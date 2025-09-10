const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
const Event = require('../models/Event');
const Document = require('../models/Document');
const Billing = require('../models/Billing');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mrb-law');
    console.log('Connected to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Case.deleteMany({});
    await Event.deleteMany({});
    await Document.deleteMany({});
    await Billing.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    
    // Create Attorney
    const attorney = await User.create({
      name: 'Jhon Khent',
      email: 'attorney@mrblaw.com',
      password: 'password123',
      userType: 'attorney',
      phone: '09123456789',
      position: 'Senior Attorney',
      barNumber: 'BAR-2020-001',
      specializations: ['Civil Law', 'Criminal Law', 'Family Law'],
      gender: 'male',
      dateOfBirth: new Date('1985-06-15')
    });

    // Create Staff
    const staff = await User.create({
      name: 'Maria Santos',
      email: 'staff@mrblaw.com',
      password: 'password123',
      userType: 'staff',
      phone: '09123456790',
      position: 'Legal Assistant',
      department: 'Legal',
      gender: 'female',
      dateOfBirth: new Date('1990-03-22'),
      createdBy: attorney._id
    });

    // Create Clients
    const client1 = await User.create({
      name: 'Ethan Charles Jumao-as',
      email: 'client@mrblaw.com',
      password: 'password123',
      userType: 'client',
      phone: '0955432325458',
      gender: 'male',
      dateOfBirth: new Date('1992-08-10'),
      address: {
        street: 'Babag 2',
        city: 'Lapu Lapu City',
        state: 'Cebu',
        zipCode: '6015',
        country: 'Philippines'
      },
      assignedAttorney: attorney._id,
      createdBy: attorney._id
    });

    const client2 = await User.create({
      name: 'Berkin Admight',
      email: 'berkin@email.com',
      password: 'password123',
      userType: 'client',
      phone: '09567890123',
      gender: 'male',
      dateOfBirth: new Date('1988-12-05'),
      address: {
        street: '123 Main Street',
        city: 'Cebu City',
        state: 'Cebu',
        zipCode: '6000',
        country: 'Philippines'
      },
      assignedAttorney: attorney._id,
      createdBy: attorney._id
    });

    console.log('Users created successfully');

    // Create Cases
    console.log('Creating cases...');
    
    const case1 = await Case.create({
      title: 'PEOPLE VS. BERKIN ADMIGHT',
      description: 'Criminal case involving theft charges',
      caseType: 'criminal',
      status: 'active',
      priority: 'high',
      client: client1._id,
      assignedAttorney: attorney._id,
      supportStaff: [staff._id],
      court: {
        name: 'Regional Trial Court',
        address: 'Cebu City',
        judge: 'Hon. Maria Rodriguez',
        courtroom: 'Room 301'
      },
      filingDate: new Date('2024-01-15'),
      expectedResolutionDate: new Date('2025-06-15'),
      estimatedCost: 150000,
      notes: [{
        content: 'Initial case filing completed. Awaiting court schedule.',
        createdBy: attorney._id,
        isPublic: true,
        createdAt: new Date('2024-01-16')
      }],
      createdBy: attorney._id
    });

    const case2 = await Case.create({
      title: 'Estate Planning - Wilson Family',
      description: 'Comprehensive estate planning and will preparation',
      caseType: 'family',
      status: 'pending',
      priority: 'medium',
      client: client2._id,
      assignedAttorney: attorney._id,
      filingDate: new Date('2024-12-01'),
      expectedResolutionDate: new Date('2025-03-01'),
      estimatedCost: 75000,
      createdBy: attorney._id
    });

    console.log('Cases created successfully');

    // Create Events
    console.log('Creating events...');
    
    const event1 = await Event.create({
      title: 'Initial Consultation',
      description: 'First meeting with client to discuss case details',
      eventType: 'consultation',
      startDate: new Date('2025-03-07T09:00:00'),
      endDate: new Date('2025-03-07T10:00:00'),
      location: 'MRB Law Office',
      client: client1._id,
      case: case1._id,
      assignedTo: attorney._id,
      status: 'confirmed',
      createdBy: attorney._id
    });

    const event2 = await Event.create({
      title: 'Court Hearing - PEOPLE VS. BERKIN ADMIGHT',
      description: 'Preliminary hearing for criminal case',
      eventType: 'court-hearing',
      startDate: new Date('2025-03-15T10:00:00'),
      endDate: new Date('2025-03-15T12:00:00'),
      location: 'Regional Trial Court, Room 301',
      judge: 'Hon. Maria Rodriguez',
      courtroom: 'Room 301',
      client: client1._id,
      case: case1._id,
      assignedTo: attorney._id,
      status: 'scheduled',
      createdBy: attorney._id
    });

    const event3 = await Event.create({
      title: 'Document Review Meeting',
      description: 'Review estate planning documents with client',
      eventType: 'client-meeting',
      startDate: new Date('2025-03-10T14:00:00'),
      endDate: new Date('2025-03-10T15:30:00'),
      location: 'MRB Law Office',
      client: client2._id,
      case: case2._id,
      assignedTo: attorney._id,
      status: 'scheduled',
      createdBy: attorney._id
    });

    console.log('Events created successfully');

    // Create Documents
    console.log('Creating documents...');
    
    const doc1 = await Document.create({
      title: 'Case Brief - PEOPLE VS. BERKIN ADMIGHT',
      filename: 'case-brief-001.pdf',
      originalName: 'Case Brief - PEOPLE VS BERKIN ADMIGHT.pdf',
      mimeType: 'application/pdf',
      size: 2048576, // 2MB
      path: '/uploads/documents/case-brief-001.pdf',
      category: 'legal-brief',
      client: client1._id,
      case: case1._id,
      uploadedBy: attorney._id,
      accessLevel: 'client-visible',
      tags: ['criminal', 'brief', 'court-filing'],
      description: 'Initial case brief outlining the charges and defense strategy',
      status: 'approved'
    });

    const doc2 = await Document.create({
      title: 'Consultation Agreement',
      filename: 'consultation-agreement-001.pdf',
      originalName: 'Consultation Agreement - Ethan Jumao-as.pdf',
      mimeType: 'application/pdf',
      size: 1024768, // 1MB
      path: '/uploads/documents/consultation-agreement-001.pdf',
      category: 'contract',
      client: client1._id,
      uploadedBy: attorney._id,
      accessLevel: 'client-visible',
      tags: ['consultation', 'agreement', 'contract'],
      description: 'Legal consultation service agreement',
      status: 'signed'
    });

    const doc3 = await Document.create({
      title: 'Estate Planning Checklist',
      filename: 'estate-planning-checklist.docx',
      originalName: 'Estate Planning Checklist - Wilson.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 512384, // 500KB
      path: '/uploads/documents/estate-planning-checklist.docx',
      category: 'other',
      client: client2._id,
      case: case2._id,
      uploadedBy: staff._id,
      accessLevel: 'client-visible',
      tags: ['estate-planning', 'checklist'],
      description: 'Comprehensive checklist for estate planning process',
      status: 'draft'
    });

    console.log('Documents created successfully');

    // Create Billing Records
    console.log('Creating billing records...');
    
    const billing1 = await Billing.create({
      client: client1._id,
      case: case1._id,
      assignedAttorney: attorney._id,
      description: 'Legal consultation and initial case assessment',
      billingType: 'consultation',
      lineItems: [{
        description: 'Initial consultation (2 hours)',
        quantity: 2,
        rate: 5000,
        amount: 10000,
        date: new Date('2024-12-15')
      }, {
        description: 'Case research and analysis',
        quantity: 4,
        rate: 3000,
        amount: 12000,
        date: new Date('2024-12-16')
      }],
      subtotal: 22000,
      taxRate: 0.12,
      taxAmount: 2640,
      totalAmount: 24640,
      issueDate: new Date('2024-12-20'),
      dueDate: new Date('2025-01-20'),
      status: 'sent',
      paymentStatus: 'unpaid',
      createdBy: attorney._id
    });

    const billing2 = await Billing.create({
      client: client2._id,
      case: case2._id,
      assignedAttorney: attorney._id,
      description: 'Estate planning consultation and document preparation',
      billingType: 'legal-services',
      lineItems: [{
        description: 'Estate planning consultation',
        quantity: 1,
        rate: 8000,
        amount: 8000,
        date: new Date('2024-12-01')
      }],
      subtotal: 8000,
      taxRate: 0.12,
      taxAmount: 960,
      totalAmount: 8960,
      issueDate: new Date('2024-12-05'),
      dueDate: new Date('2025-01-05'),
      status: 'sent',
      paymentStatus: 'paid',
      paidDate: new Date('2024-12-28'),
      payments: [{
        amount: 8960,
        paymentDate: new Date('2024-12-28'),
        paymentMethod: 'bank-transfer',
        reference: 'BT-2024-001',
        notes: 'Full payment via online banking',
        recordedBy: staff._id
      }],
      createdBy: attorney._id
    });

    console.log('Billing records created successfully');

    // Update case references
    console.log('Updating case references...');
    
    await Case.findByIdAndUpdate(case1._id, {
      $push: {
        documents: [doc1._id, doc2._id],
        hearings: [event1._id, event2._id]
      }
    });

    await Case.findByIdAndUpdate(case2._id, {
      $push: {
        documents: [doc3._id],
        hearings: [event3._id]
      }
    });

    console.log('Case references updated successfully');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`✓ Created ${await User.countDocuments()} users:`);
    console.log(`  - 1 Attorney (${attorney.email})`);
    console.log(`  - 1 Staff (${staff.email})`);
    console.log(`  - 2 Clients (${client1.email}, ${client2.email})`);
    console.log(`✓ Created ${await Case.countDocuments()} cases`);
    console.log(`✓ Created ${await Event.countDocuments()} events`);
    console.log(`✓ Created ${await Document.countDocuments()} documents`);
    console.log(`✓ Created ${await Billing.countDocuments()} billing records`);
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Attorney Login:');
    console.log('  Email: attorney@mrblaw.com');
    console.log('  Password: password123');
    console.log('  User Type: Attorney');
    console.log('');
    console.log('Staff Login:');
    console.log('  Email: staff@mrblaw.com');
    console.log('  Password: password123');
    console.log('  User Type: Staff');
    console.log('');
    console.log('Client Login:');
    console.log('  Email: client@mrblaw.com');
    console.log('  Password: password123');
    console.log('  User Type: Client');
    console.log('');
    console.log('Seed data created successfully! 🎉');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

seedData();