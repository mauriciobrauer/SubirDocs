'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Cloud } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center min-w-0 flex-1">
            <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              GuardarPDF Dropbox
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="hidden sm:flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{user?.name}</span>
              <span className="text-gray-500 ml-1">({user?.email})</span>
            </div>
            
            {/* Mobile user info */}
            <div className="sm:hidden flex items-center text-xs text-gray-700">
              <User className="h-3 w-3 mr-1" />
              <span className="font-medium truncate max-w-20">{user?.name}</span>
            </div>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
