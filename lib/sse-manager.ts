// Store para mantener las conexiones SSE activas
const connections = new Set<ReadableStreamDefaultController>();

export function addConnection(controller: ReadableStreamDefaultController) {
  connections.add(controller);
}

export function removeConnection(controller: ReadableStreamDefaultController) {
  connections.delete(controller);
}

export function getConnectionCount() {
  return connections.size;
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
