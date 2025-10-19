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
import SimpleDebug from './SimpleDebug';
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
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Sección de debug simple - MOVIDA AL PRINCIPIO */}
          <section>
            <SimpleDebug />
          </section>
        </div>
      </main>
    </div>
  );
}
