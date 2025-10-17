'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
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
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Sección de subida de archivos */}
          <section>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestiona tus documentos
              </h1>
              <p className="text-lg text-gray-600">
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
