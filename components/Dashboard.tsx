'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
import TwilioStatus from './TwilioStatus';
import MessageLog from './MessageLog';
import LocalFiles from './LocalFiles';
import DropboxFiles from './DropboxFiles';
import UsersList from './UsersList';
import AllUsersList from './AllUsersList';
import DebugLogs from './DebugLogs';
import ProcessingStatus from './ProcessingStatus';
import DiagnosticPanel from './DiagnosticPanel';
import { UploadedFile } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (file: UploadedFile) => {
    // Trigger refresh de la lista de archivos
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Componente de estado de procesamiento en tiempo real */}
      <ProcessingStatus />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Sección de diagnóstico - MOVIDA AL PRINCIPIO */}
          <section>
            <DiagnosticPanel />
          </section>

          {/* Sección de estado de Twilio - OCULTO TEMPORALMENTE */}
          {/* <section>
            <TwilioStatus />
          </section> */}

          {/* Sección de mensajes recibidos - OCULTO TEMPORALMENTE */}
          {/* <section>
            <MessageLog />
          </section> */}

          {/* Sección de archivos descargados - OCULTO TEMPORALMENTE */}
          {/* <section>
            <LocalFiles />
          </section> */}

          {/* Sección de archivos en Dropbox - OCULTO TEMPORALMENTE */}
          {/* <section>
            <DropboxFiles />
          </section> */}

                 {/* Sección de todos los usuarios - OCULTO TEMPORALMENTE */}
                 {/* <section>
                   <AllUsersList />
                 </section> */}

          {/* Sección de logs de debug - OCULTO TEMPORALMENTE */}
          {/* <section>
            <DebugLogs isVisible={true} />
          </section> */}

          {/* Sección de subida de archivos */}
          <section>
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-4">
                Gestiona tus documentos
              </h1>
              <p className="text-base sm:text-lg text-gray-600 px-4">
                Sube archivos PDF y DOC a tu Dropbox de forma segura
              </p>
            </div>
            
            <FileUpload 
              onUploadSuccess={handleUploadSuccess} 
              userEmail={user?.email || 'default'} 
            />
          </section>

                 {/* Sección de lista de archivos */}
                 <section>
                   <FileList 
                     refreshTrigger={refreshTrigger}
                     userEmail={user?.email || 'default'} 
                   />
                 </section>
        </div>
      </main>
    </div>
  );
}
