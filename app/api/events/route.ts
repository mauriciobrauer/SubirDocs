import { NextRequest } from 'next/server';

// Store para mantener las conexiones SSE activas
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Crear un stream para Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Agregar esta conexión al set de conexiones activas
      connections.add(controller);
      
      // Enviar un mensaje de conexión establecida
      const data = JSON.stringify({
        type: 'connected',
        message: 'Conexión SSE establecida',
        timestamp: Date.now()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      // Función para limpiar cuando se cierre la conexión
      const cleanup = () => {
        connections.delete(controller);
      };
      
      // Escuchar cuando se cierre la conexión
      request.signal.addEventListener('abort', cleanup);
    },
    
    cancel() {
      // Limpiar la conexión cuando se cancele
      connections.delete(this);
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

// Función para notificar a todas las conexiones activas
export function notifyUserCreated(userData: any) {
  const data = JSON.stringify({
    type: 'user_created',
    user: userData,
    timestamp: Date.now()
  });
  
  const message = `data: ${data}\n\n`;
  
  // Enviar a todas las conexiones activas
  connections.forEach(controller => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Si hay error, remover la conexión
      connections.delete(controller);
    }
  });
  
  console.log(`📡 Notificación SSE enviada a ${connections.size} conexiones activas`);
}

// Función para notificar eliminación de usuario
export function notifyUserDeleted(userData: any) {
  const data = JSON.stringify({
    type: 'user_deleted',
    user: userData,
    timestamp: Date.now()
  });
  
  const message = `data: ${data}\n\n`;
  
  // Enviar a todas las conexiones activas
  connections.forEach(controller => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Si hay error, remover la conexión
      connections.delete(controller);
    }
  });
  
  console.log(`📡 Notificación SSE de eliminación enviada a ${connections.size} conexiones activas`);
}
