import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentar obtener la URL de ngrok desde su API local
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    
    if (data.tunnels && data.tunnels.length > 0) {
      const tunnel = data.tunnels.find((t: any) => t.proto === 'https');
      if (tunnel) {
        return new NextResponse(tunnel.public_url);
      }
    }
    
    return new NextResponse('not-found');
  } catch (error) {
    return new NextResponse('not-found');
  }
}
