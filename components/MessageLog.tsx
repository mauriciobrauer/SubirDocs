'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Clock, FileText } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  body: string;
  timestamp: string;
  numMedia: number;
  mediaUrls?: string[];
}

export default function MessageLog() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar mensajes iniciales
    fetchMessages();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPhone = (phone: string) => {
    // Limpiar el número de teléfono para mostrar
    return phone.replace('whatsapp:', '').replace('+', '');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">Mensajes Recibidos</h3>
        </div>
        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay mensajes recibidos aún</p>
            <p className="text-sm">Envía un mensaje desde WhatsApp para verlo aquí</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {formatPhone(message.from)}
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="w-3 h-3" />
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {message.body && (
                <p className="text-gray-700 mb-2">{message.body}</p>
              )}
              
              {message.numMedia > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span>{message.numMedia} archivo(s) multimedia</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Los mensajes se actualizan automáticamente cada 5 segundos
      </div>
    </div>
  );
}
