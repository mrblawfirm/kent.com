import { NextRequest, NextResponse } from 'next/server';
import { queryRows } from '@/lib/db';
import { ApiResponse, Testimonial } from '@/types';

// GET /api/testimonials - Get all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = 'SELECT * FROM testimonials';
    const params: any[] = [];

    if (activeOnly) {
      query += ' WHERE active = ?';
      params.push(true);
    }

    query += ' ORDER BY created_at DESC';

    if (limit > 0) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const testimonials = await queryRows(query, params);

    return NextResponse.json({
      success: true,
      data: testimonials,
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch testimonials',
      } as ApiResponse,
      { status: 500 }
    );
  }
}