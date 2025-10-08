import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryRow } from '@/lib/db';
import { ApiResponse, Appointment } from '@/types';

// GET /api/appointments/[id] - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = parseInt(params.id);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid appointment ID',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const appointment = await queryRow(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch appointment',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Update appointment status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid appointment ID',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { status } = body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be: pending, confirmed, completed, or cancelled',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if appointment exists
    const existingAppointment = await queryRow(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Update appointment status
    await executeQuery(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, appointmentId]
    );

    // Fetch updated appointment
    const updatedAppointment = await queryRow(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: `Appointment status updated to ${status}`,
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update appointment',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = parseInt(params.id);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid appointment ID',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if appointment exists
    const existingAppointment = await queryRow(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Update status to cancelled instead of deleting
    await executeQuery(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', appointmentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    } as ApiResponse);

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel appointment',
      } as ApiResponse,
      { status: 500 }
    );
  }
}