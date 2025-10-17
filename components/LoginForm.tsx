'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleQuickLogin = async (email: string, password: string) => {
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Selecciona tu Usuario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Elige tu cuenta para gestionar documentos
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error de autenticación
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleQuickLogin('maria.garcia@empresa.com', 'maria123')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">María García</div>
              <div className="text-sm text-gray-500">maria.garcia@empresa.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('carlos.rodriguez@empresa.com', 'carlos123')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">C</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Carlos Rodríguez</div>
              <div className="text-sm text-gray-500">carlos.rodriguez@empresa.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('ana.martinez@empresa.com', 'ana123')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Ana Martínez</div>
              <div className="text-sm text-gray-500">ana.martinez@empresa.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('david.lopez@empresa.com', 'david123')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">D</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">David López</div>
              <div className="text-sm text-gray-500">david.lopez@empresa.com</div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Iniciando sesión...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}