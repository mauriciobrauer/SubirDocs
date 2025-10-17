'use client';

import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, Mail, UserCheck, UserPlus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  type: 'hardcoded' | 'auto-created';
}

export default function AllUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    hardcodedCount: 0,
    autoCreatedCount: 0,
    totalCount: 0
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/all-users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats({
          hardcodedCount: data.hardcodedCount || 0,
          autoCreatedCount: data.autoCreatedCount || 0,
          totalCount: data.totalCount || 0
        });
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

  const getTypeIcon = (type: string) => {
    return type === 'hardcoded' ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'hardcoded' ? 'text-blue-600' : 'text-green-600';
  };

  const getTypeLabel = (type: string) => {
    return type === 'hardcoded' ? 'Hardcodeado' : 'Auto-creado';
  };

  const hardcodedUsers = users.filter(user => user.type === 'hardcoded');
  const autoCreatedUsers = users.filter(user => user.type === 'auto-created');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">Todos los Usuarios</h3>
        </div>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.hardcodedCount}</div>
          <div className="text-sm text-blue-700">Hardcodeados</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.autoCreatedCount}</div>
          <div className="text-sm text-green-700">Auto-creados</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.totalCount}</div>
          <div className="text-sm text-gray-700">Total</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Usuarios Hardcodeados */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-800">Usuarios Hardcodeados</h4>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {hardcodedUsers.length}
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {hardcodedUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay usuarios hardcodeados
              </div>
            ) : (
              hardcodedUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getTypeColor(user.type)} bg-white`}>
                        {getTypeIcon(user.type)}
                        {getTypeLabel(user.type)}
                      </span>
                    </div>
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
        </div>

        {/* Usuarios Auto-creados */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-800">Usuarios Auto-creados</h4>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {autoCreatedUsers.length}
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {autoCreatedUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay usuarios auto-creados aún
                <br />
                <span className="text-xs">Los usuarios se crean automáticamente al enviar archivos por WhatsApp</span>
              </div>
            ) : (
              autoCreatedUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getTypeColor(user.type)} bg-white`}>
                        {getTypeIcon(user.type)}
                        {getTypeLabel(user.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800">{user.phoneNumber}</span>
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
        </div>
      </div>
    </div>
  );
}
