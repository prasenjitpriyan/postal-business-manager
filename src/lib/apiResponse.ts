import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}
