import { NextResponse } from 'next/server';
import { getAllMessages } from '@/lib/messages';

export async function GET() {
  try {
    const messages = getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 });
  }
}
