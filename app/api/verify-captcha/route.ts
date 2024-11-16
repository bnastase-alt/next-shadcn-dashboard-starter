import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const isCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true';

  // If captcha is disabled, return success immediately
  if (!isCaptchaEnabled) {
    return NextResponse.json({ success: true });
  }

  try {
    const { token } = await req.json();
    console.log('🟡 Received token:', token);

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
      }
    );

    const data = await response.json();
    console.log('🟡 Google response:', data);

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: 'Captcha verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔴 Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
