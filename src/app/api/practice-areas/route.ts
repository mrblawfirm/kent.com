import { NextRequest, NextResponse } from 'next/server';
import { queryRows } from '@/lib/db';
import { ApiResponse, PracticeArea } from '@/types';

// GET /api/practice-areas - Get all practice areas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = 'SELECT * FROM practice_areas';
    const params: any[] = [];

    if (activeOnly) {
      query += ' WHERE active = ?';
      params.push(true);
    }

    query += ' ORDER BY name ASC';

    const practiceAreas = await queryRows(query, params);

    return NextResponse.json({
      success: true,
      data: practiceAreas,
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching practice areas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch practice areas',
      } as ApiResponse,
      { status: 500 }
    );
  }
}