import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simular datos de webhook con archivo multimedia
    const testData = {
      MessageSid: 'test_file_message_123',
      From: 'whatsapp:+5213334987878',
      To: 'whatsapp:+14155238886',
      Body: 'Test file message',
      NumMedia: '1',
      MediaUrl0: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      MediaContentType0: 'application/pdf'
    };

    console.log('=== SIMULANDO WEBHOOK CON ARCHIVO ===');
    console.log('Datos de prueba:', JSON.stringify(testData, null, 2));

    // Crear FormData para simular el webhook
    const formData = new FormData();
    Object.entries(testData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Llamar al webhook interno
    const webhookResponse = await fetch('http://localhost:3000/api/webhook/twilio', {
      method: 'POST',
      body: formData
    });

    console.log(`Respuesta del webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);

    return NextResponse.json({
      success: true,
      message: 'Test de archivo completado',
      webhookStatus: webhookResponse.status,
      testData
    });

  } catch (error) {
    console.error('Error en test de archivo:', error);
    return NextResponse.json({
      error: 'Error en test de archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
