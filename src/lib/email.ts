import nodemailer from 'nodemailer';
import { Appointment, AppointmentEmailData } from '@/types';

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}

// Send appointment confirmation email
export async function sendAppointmentEmail({ appointment, type }: AppointmentEmailData) {
  try {
    const subject = getEmailSubject(type);
    const html = getEmailTemplate(appointment, type);
    const text = getEmailText(appointment, type);

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject,
      html,
      text,
    };

    // Send to client
    await transporter.sendMail(mailOptions);

    // Send notification to law firm
    const adminMailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `New Appointment ${type === 'confirmation' ? 'Scheduled' : type}`,
      html: getAdminEmailTemplate(appointment, type),
      text: getAdminEmailText(appointment, type),
    };

    await transporter.sendMail(adminMailOptions);

    console.log(`✅ ${type} email sent successfully to ${appointment.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send ${type} email:`, error);
    throw error;
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'confirmation':
      return 'Consultation Request Received - MRB Law Firm';
    case 'reminder':
      return 'Appointment Reminder - MRB Law Firm';
    case 'cancellation':
      return 'Appointment Cancelled - MRB Law Firm';
    default:
      return 'MRB Law Firm - Appointment Update';
  }
}

function getEmailTemplate(appointment: Appointment, type: string): string {
  const practiceAreaName = getPracticeAreaName(appointment.practice_area);
  const consultationTypeText = getConsultationTypeText(appointment.consultation_type);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getEmailSubject(type)}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(90deg, #4f46e5, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #6b7280; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MRB LAW FIRM</h1>
          <p>${type === 'confirmation' ? 'Consultation Request Received' : 'Appointment Update'}</p>
        </div>
        
        <div class="content">
          <h2>Dear ${appointment.first_name} ${appointment.last_name},</h2>
          
          ${type === 'confirmation' ? `
            <p>Thank you for choosing MRB Law Firm. We have received your consultation request and will contact you within 24 hours to confirm your appointment.</p>
          ` : type === 'reminder' ? `
            <p>This is a reminder about your upcoming consultation with MRB Law Firm.</p>
          ` : `
            <p>Your appointment has been cancelled as requested.</p>
          `}
          
          <div class="appointment-details">
            <h3>Appointment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Practice Area:</span>
              <span class="detail-value">${practiceAreaName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(appointment.preferred_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${appointment.preferred_time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Consultation Type:</span>
              <span class="detail-value">${consultationTypeText}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
            </div>
          </div>
          
          ${type === 'confirmation' ? `
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your case description</li>
              <li>We'll contact you within 24 hours to confirm the appointment</li>
              <li>You'll receive further instructions about the consultation</li>
            </ul>
          ` : ''}
          
          <p>If you have any questions or need to make changes, please contact us:</p>
          <ul>
            <li><strong>Phone:</strong> 0967942489</li>
            <li><strong>Email:</strong> MRBLAW@gmail.com</li>
            <li><strong>Address:</strong> 123 Legal Ave, Justice City, Lawland</li>
          </ul>
          
          <div class="footer">
            <p>&copy; 2024 MRB Law Firm. All rights reserved.</p>
            <p>This email was sent regarding your consultation request. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getEmailText(appointment: Appointment, type: string): string {
  const practiceAreaName = getPracticeAreaName(appointment.practice_area);
  const consultationTypeText = getConsultationTypeText(appointment.consultation_type);
  
  return `
MRB LAW FIRM - ${getEmailSubject(type)}

Dear ${appointment.first_name} ${appointment.last_name},

${type === 'confirmation' ? 
  'Thank you for choosing MRB Law Firm. We have received your consultation request and will contact you within 24 hours to confirm your appointment.' :
  type === 'reminder' ?
  'This is a reminder about your upcoming consultation with MRB Law Firm.' :
  'Your appointment has been cancelled as requested.'
}

APPOINTMENT DETAILS:
- Practice Area: ${practiceAreaName}
- Date: ${new Date(appointment.preferred_date).toLocaleDateString()}
- Time: ${appointment.preferred_time}
- Consultation Type: ${consultationTypeText}
- Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}

CONTACT INFORMATION:
- Phone: 0967942489
- Email: MRBLAW@gmail.com
- Address: 123 Legal Ave, Justice City, Lawland

© 2024 MRB Law Firm. All rights reserved.
  `;
}

function getAdminEmailTemplate(appointment: Appointment, type: string): string {
  const practiceAreaName = getPracticeAreaName(appointment.practice_area);
  const consultationTypeText = getConsultationTypeText(appointment.consultation_type);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Appointment - Admin Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Appointment ${type === 'confirmation' ? 'Scheduled' : 'Update'}</h1>
        </div>
        
        <div class="content">
          ${type === 'confirmation' ? '<div class="urgent"><strong>Action Required:</strong> New consultation request needs confirmation</div>' : ''}
          
          <div class="appointment-details">
            <h3>Client Information</h3>
            <div class="detail-row"><strong>Name:</strong> ${appointment.first_name} ${appointment.last_name}</div>
            <div class="detail-row"><strong>Email:</strong> ${appointment.email}</div>
            <div class="detail-row"><strong>Phone:</strong> ${appointment.phone}</div>
            
            <h3>Appointment Details</h3>
            <div class="detail-row"><strong>Practice Area:</strong> ${practiceAreaName}</div>
            <div class="detail-row"><strong>Date:</strong> ${new Date(appointment.preferred_date).toLocaleDateString()}</div>
            <div class="detail-row"><strong>Time:</strong> ${appointment.preferred_time}</div>
            <div class="detail-row"><strong>Type:</strong> ${consultationTypeText}</div>
            <div class="detail-row"><strong>Status:</strong> ${appointment.status}</div>
            
            <h3>Case Description</h3>
            <p>${appointment.case_description}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the case description</li>
            <li>Contact the client within 24 hours</li>
            <li>Update appointment status in the system</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getAdminEmailText(appointment: Appointment, type: string): string {
  const practiceAreaName = getPracticeAreaName(appointment.practice_area);
  const consultationTypeText = getConsultationTypeText(appointment.consultation_type);
  
  return `
NEW APPOINTMENT ${type === 'confirmation' ? 'SCHEDULED' : 'UPDATE'} - MRB LAW FIRM

CLIENT INFORMATION:
- Name: ${appointment.first_name} ${appointment.last_name}
- Email: ${appointment.email}
- Phone: ${appointment.phone}

APPOINTMENT DETAILS:
- Practice Area: ${practiceAreaName}
- Date: ${new Date(appointment.preferred_date).toLocaleDateString()}
- Time: ${appointment.preferred_time}
- Type: ${consultationTypeText}
- Status: ${appointment.status}

CASE DESCRIPTION:
${appointment.case_description}

ACTION REQUIRED: Contact client within 24 hours to confirm appointment.
  `;
}

function getPracticeAreaName(slug: string): string {
  const practiceAreas: { [key: string]: string } = {
    'corporate-law': 'Corporate Law',
    'litigation': 'Litigation',
    'estate-planning': 'Estate Planning',
    'real-estate': 'Real Estate Law',
    'family-law': 'Family Law',
    'criminal-defense': 'Criminal Defense',
    'other': 'Other Legal Matter'
  };
  return practiceAreas[slug] || slug;
}

function getConsultationTypeText(type: string): string {
  const types: { [key: string]: string } = {
    'in-person': 'In-Person Meeting',
    'video-call': 'Video Call',
    'phone-call': 'Phone Call'
  };
  return types[type] || type;
}