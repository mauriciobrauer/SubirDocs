'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, AlertCircle, UserCheck, UserPlus, Phone, Trash2, Loader2, FolderPlus } from 'lucide-react';
import DropboxLogs from './DropboxLogs';

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  type: 'hardcoded' | 'auto-created';
}

export default function LoginForm() {
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [newUserDetected, setNewUserDetected] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUserTimestamp, setLastUserTimestamp] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const { login, isLoading } = useAuth();

  const fetchUsers = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoadingUsers(true);
    }
    try {
      const response = await fetch('/api/all-users');
      if (response.ok) {
        const data = await response.json();
        const newUsers = data.users || [];
        
        // Solo detectar nuevos usuarios después de la carga inicial
        if (!initialLoad && newUsers.length > users.length) {
          setNewUserDetected(true);
          // Ocultar la notificación después de 3 segundos
          setTimeout(() => setNewUserDetected(false), 3000);
        }
        
        setUsers(newUsers);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (showLoading) {
        setIsLoadingUsers(false);
      }
    }
  }, [initialLoad, users.length]);

  const checkForNewUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/user-created');
      if (response.ok) {
        const data = await response.json();
        const currentTimestamp = data.lastUserCreatedTimestamp;
        
        // Si hay un nuevo timestamp y es diferente al anterior
        if (currentTimestamp > lastUserTimestamp && lastUserTimestamp > 0) {
          console.log('🔄 Nuevo usuario detectado, actualizando lista...');
          await fetchUsers(false); // Actualizar sin mostrar loading
          setNewUserDetected(true);
          setTimeout(() => setNewUserDetected(false), 3000);
        }
        
        setLastUserTimestamp(currentTimestamp);
      }
    } catch (error) {
      console.error('Error checking for new users:', error);
    }
  }, [lastUserTimestamp, fetchUsers]);

  useEffect(() => {
    fetchUsers(true); // Mostrar loading solo en la carga inicial
    
    // Verificar nuevos usuarios cada 2 segundos (más frecuente para mejor UX)
    const interval = setInterval(checkForNewUsers, 2000);
    return () => clearInterval(interval);
  }, [lastUserTimestamp, checkForNewUsers, fetchUsers]); // Dependencias completas

  const handleQuickLogin = async (email: string, password: string) => {
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Error al iniciar sesión');
    }
  };

  const deleteUser = async (userId: string, userEmail: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se active el login
    
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userEmail}?`)) {
      return;
    }

    setIsDeleting(userId);
    try {
      const response = await fetch(`/api/delete-user?userId=${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuario eliminado:', data.message);
        
        // Actualizar la lista de usuarios
        await fetchUsers(false);
        
        // Mostrar notificación de éxito con información detallada
        let message = `Usuario ${userEmail} eliminado exitosamente.`;
        
        if (data.dropboxDeletion) {
          if (data.dropboxDeletion.success) {
            message += `\n\n✅ Dropbox: ${data.dropboxDeletion.message}`;
          } else {
            message += `\n\n⚠️ Dropbox: ${data.dropboxDeletion.message}`;
          }
        }
        
        if (data.warning) {
          message += `\n\n⚠️ Advertencia: ${data.warning}`;
        }
        
        alert(message);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}\n\nDetalles: ${errorData.details}`
          : errorData.error;
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error de conexión'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const getPasswordForUser = (user: User) => {
    if (user.type === 'hardcoded') {
      // Para usuarios hardcodeados, usar contraseñas específicas
      const passwords: { [key: string]: string } = {
        'maria.garcia@empresa.com': 'maria123',
        'carlos.rodriguez@empresa.com': 'carlos123',
        'ana.martinez@empresa.com': 'ana123',
        'david.lopez@empresa.com': 'david123'
      };
      return passwords[user.email] || 'password123';
    } else {
      // Para usuarios auto-creados, usar contraseña por defecto
      return 'password123';
    }
  };

  const getAvatarColor = (user: User) => {
    if (user.type === 'auto-created') return 'bg-green-500';
    
    const colors: { [key: string]: string } = {
      'maria.garcia@empresa.com': 'bg-pink-500',
      'carlos.rodriguez@empresa.com': 'bg-blue-500',
      'ana.martinez@empresa.com': 'bg-green-500',
      'david.lopez@empresa.com': 'bg-purple-500'
    };
    return colors[user.email] || 'bg-gray-500';
  };

  const getInitial = (user: User) => {
    if (user.type === 'auto-created') {
      return user.phoneNumber.charAt(0);
    }
    return user.name.charAt(0);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Por favor ingresa un nombre para la carpeta');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Carpeta "${newFolderName}" creada exitosamente en GuardaPDFDropbox`);
        setNewFolderName('');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creando carpeta:', error);
      alert('Error al crear la carpeta');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Selecciona tu Usuario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 px-2">
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

        {newUserDetected && (
          <div className="rounded-md bg-green-50 p-4 animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserPlus className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ¡Nuevo usuario detectado!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  Se ha creado automáticamente un nuevo usuario desde WhatsApp
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingUsers ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Cargando usuarios...
            </div>
          </div>
        ) : (
                 <div className="space-y-4">
                   {users.map((user) => (
                     <div key={user.id} className="relative">
                       <button
                         type="button"
                         onClick={() => handleQuickLogin(user.email, getPasswordForUser(user))}
                         disabled={isLoading}
                         className="w-full inline-flex justify-center items-center px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                       >
                         <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getAvatarColor(user)} rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0`}>
                           <span className="text-white text-sm sm:text-lg font-bold">{getInitial(user)}</span>
                         </div>
                         <div className="text-left flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <span className="font-semibold text-sm sm:text-base truncate">{user.name}</span>
                             {user.type === 'hardcoded' ? (
                               <div title="Usuario hardcodeado">
                                 <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                               </div>
                             ) : (
                               <div title="Usuario auto-creado">
                                 <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                               </div>
                             )}
                           </div>
                           <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                           {user.type === 'auto-created' && (
                             <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                               <Phone className="w-3 h-3 flex-shrink-0" />
                               <span className="truncate">{user.phoneNumber}</span>
                             </div>
                           )}
                         </div>
                       </button>
                       
                       {/* Botón de eliminar solo para usuarios auto-creados */}
                       {user.type === 'auto-created' && (
                         <button
                           onClick={(e) => deleteUser(user.id, user.email, e)}
                           disabled={isDeleting === user.id}
                           className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full disabled:opacity-50"
                           title="Eliminar usuario"
                         >
                           {isDeleting === user.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <Trash2 className="h-4 w-4" />
                           )}
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Iniciando sesión...
            </div>
          </div>
        )}
        
               {/* Logs de Dropbox */}
               <DropboxLogs />
               
               {/* Crear carpeta */}
               <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                   <FolderPlus className="h-4 w-4 mr-2" />
                   Crear Carpeta en GuardaPDFDropbox
                 </h3>
                 <div className="space-y-3">
                   <input
                     type="text"
                     value={newFolderName}
                     onChange={(e) => setNewFolderName(e.target.value)}
                     placeholder="Nombre de la carpeta"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   <button
                     onClick={createFolder}
                     disabled={isCreatingFolder || !newFolderName.trim()}
                     className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isCreatingFolder ? (
                       <>
                         <Loader2 className="h-4 w-4 animate-spin mr-2" />
                         Creando...
                       </>
                     ) : (
                       <>
                         <FolderPlus className="h-4 w-4 mr-2" />
                         Crear Carpeta
                       </>
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         );
       }