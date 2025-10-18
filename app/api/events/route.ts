import { NextRequest } from 'next/server';
import { addConnection, removeConnection } from '@/lib/sse-manager';

export async function GET(request: NextRequest) {
  // Crear un stream para Server-Sent Events
  let controller: ReadableStreamDefaultController;
  
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      // Agregar esta conexión al set de conexiones activas
      addConnection(controller);
      
      // Enviar un mensaje de conexión establecida
      const data = JSON.stringify({
        type: 'connected',
        message: 'Conexión SSE establecida',
        timestamp: Date.now()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      // Función para limpiar cuando se cierre la conexión
      const cleanup = () => {
        removeConnection(controller);
      };
      
      // Escuchar cuando se cierre la conexión
      request.signal.addEventListener('abort', cleanup);
    },
    
    cancel() {
      // Limpiar la conexión cuando se cancele
      if (controller) {
        removeConnection(controller);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
