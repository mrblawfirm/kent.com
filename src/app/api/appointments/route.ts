import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryRows } from '@/lib/db';
import { AppointmentFormData, ApiResponse, Appointment } from '@/types';
import { sendAppointmentEmail } from '@/lib/email';

// GET /api/appointments - Get all appointments (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT * FROM appointments 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const appointments = await queryRows(query, params);

    return NextResponse.json({
      success: true,
      data: appointments,
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch appointments',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body: AppointmentFormData = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'practiceArea',
      'preferredDate',
      'preferredTime',
      'consultationType',
      'caseDescription'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof AppointmentFormData]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(body.phone) || body.phone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const selectedDate = new Date(body.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Preferred date cannot be in the past',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check for existing appointment at the same date/time
    const existingAppointment = await queryRows(
      `SELECT id FROM appointments 
       WHERE preferred_date = ? AND preferred_time = ? AND status != 'cancelled'`,
      [body.preferredDate, body.preferredTime]
    );

    if (existingAppointment.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'This time slot is already booked. Please choose another time.',
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Insert appointment into database
    const result = await executeQuery(
      `INSERT INTO appointments (
        first_name, last_name, email, phone, practice_area,
        preferred_date, preferred_time, consultation_type, case_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.firstName,
        body.lastName,
        body.email,
        body.phone,
        body.practiceArea,
        body.preferredDate,
        body.preferredTime,
        body.consultationType,
        body.caseDescription,
      ]
    );

    const insertResult = result as any;
    const appointmentId = insertResult.insertId;

    // Fetch the created appointment
    const appointment = await queryRows(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    // Send confirmation email
    try {
      await sendAppointmentEmail({
        appointment: appointment[0] as Appointment,
        type: 'confirmation',
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          appointment: appointment[0],
          appointmentId,
        },
        message: 'Appointment scheduled successfully! You will receive a confirmation email shortly.',
      } as ApiResponse,
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule appointment. Please try again.',
      } as ApiResponse,
      { status: 500 }
    );
  }
}