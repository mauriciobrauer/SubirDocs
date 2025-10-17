'use client';

import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">Usuarios Creados</h3>
        </div>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay usuarios creados aún</p>
            <p className="text-sm">Los usuarios se crean automáticamente al enviar archivos por WhatsApp</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {user.phoneNumber}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Creado: {formatDate(user.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Total de usuarios: <span className="font-medium">{users.length}</span>
      </div>
    </div>
  );
}
