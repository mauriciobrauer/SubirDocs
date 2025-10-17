'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, FileText } from 'lucide-react';

export default function TwilioStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    // Para desarrollo local, usar ngrok si está disponible
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    if (isLocalhost) {
      // Intentar obtener la URL de ngrok
      fetch('/api/ngrok-url')
        .then(res => res.text())
        .then(url => {
          if (url && url !== 'not-found') {
            setWebhookUrl(`${url}/api/webhook/twilio`);
          } else {
            setWebhookUrl('https://supermorosely-nondeferential-abdullah.ngrok-free.dev/api/webhook/twilio');
          }
        })
        .catch(() => {
          setWebhookUrl('https://supermorosely-nondeferential-abdullah.ngrok-free.dev/api/webhook/twilio');
        });
    } else {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000';
      setWebhookUrl(`${baseUrl}/api/webhook/twilio`);
    }
  }, []);

  const testWebhook = async () => {
    try {
      // Enviar mensaje real a WhatsApp
      const response = await fetch('/api/send-test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'whatsapp:+5213334987878',
          message: '¡Hola! Esta es una prueba de conexión desde la aplicación. Responde con cualquier mensaje para confirmar que funciona.'
        }),
      });

      if (response.ok) {
        setIsConnected(true);
        alert('Mensaje enviado exitosamente a WhatsApp. Responde desde tu teléfono para confirmar la conexión.');
      } else {
        const error = await response.text();
        alert(`Error al enviar mensaje: ${error}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Error al enviar mensaje de prueba');
    }
  };

  const testFileUpload = async () => {
    try {
      const response = await fetch('/api/test-file-upload');
      
      if (response.ok) {
        const result = await response.json();
        alert(`Test de archivo completado. Revisa la consola del servidor para ver los logs detallados.`);
        console.log('Resultado del test:', result);
      } else {
        const error = await response.text();
        alert(`Error en test de archivo: ${error}`);
      }
    } catch (error) {
      console.error('Error testing file upload:', error);
      alert('Error al probar subida de archivo');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Phone className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Estado de Twilio</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium mb-2">URL del Webhook:</p>
          <code className="text-xs bg-white p-2 rounded border block break-all">
            {webhookUrl}
          </code>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Configuración en Twilio</span>
          </div>
          <p className="text-xs text-blue-700">
            Configura esta URL en tu número de Twilio en la consola de Twilio:
          </p>
          <ol className="text-xs text-blue-700 mt-2 space-y-1">
            <li>1. Ve a <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" className="underline">Phone Numbers</a></li>
            <li>2. Selecciona tu número +14155238886</li>
            <li>3. En &quot;Webhook&quot; configura: {webhookUrl}</li>
            <li>4. Método: POST</li>
          </ol>
        </div>

        <div className="space-y-2">
          <button
            onClick={testWebhook}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Probar Conexión
          </button>
          
          <button
            onClick={testFileUpload}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Probar Subida de Archivo
          </button>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Funcionalidad</span>
          </div>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Recibe archivos multimedia por WhatsApp/SMS</li>
            <li>• Los guarda en Dropbox organizados por número</li>
            <li>• Soporta imágenes, videos, audios y documentos</li>
            <li>• Carpeta: /twilio_files/[número_teléfono]/</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
