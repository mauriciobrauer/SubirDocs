// Simulamos una base de datos en memoria para este ejemplo
// En producción, esto debería ser una base de datos real
let receivedMessages: any[] = [];

// Función para agregar mensaje (será llamada desde el webhook)
export function addMessage(messageData: any) {
  receivedMessages.unshift({
    id: messageData.MessageSid || `msg_${Date.now()}`,
    from: messageData.From,
    body: messageData.Body,
    timestamp: new Date().toISOString(),
    numMedia: parseInt(messageData.NumMedia) || 0,
    mediaUrls: messageData.NumMedia > 0 ? 
      Array.from({length: parseInt(messageData.NumMedia)}, (_, i) => messageData[`MediaUrl${i}`]) : 
      []
  });
  
  // Mantener solo los últimos 50 mensajes
  if (receivedMessages.length > 50) {
    receivedMessages = receivedMessages.slice(0, 50);
  }
}

// Función para obtener todos los mensajes
export function getAllMessages() {
  return receivedMessages;
}
