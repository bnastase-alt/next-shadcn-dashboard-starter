import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;
    console.log('🟡 Received token:', token);

    const formData = new URLSearchParams();
    formData.append('secret', process.env.RECAPTCHA_SECRET_KEY!);
    formData.append('response', token);

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const data = await response.json();
    console.log('🟡 Google response:', data);

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: data['error-codes']?.[0] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('🔴 Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
