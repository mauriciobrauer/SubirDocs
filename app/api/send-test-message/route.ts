import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Enviar mensaje usando Twilio
    const messageResponse = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: to
    });

    return NextResponse.json({
      success: true,
      messageSid: messageResponse.sid,
      status: messageResponse.status
    });

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    return NextResponse.json({ 
      error: 'Error al enviar mensaje',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
