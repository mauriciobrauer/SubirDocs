// Sistema de usuarios para producción (Vercel)
// En producción, usamos variables de entorno para persistir usuarios

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}

// Cache en memoria para usuarios (se pierde en cada reinicio)
let usersCache: User[] = [];

// Función para cargar usuarios desde variables de entorno
export function loadUsersFromEnv(): User[] {
  try {
    const usersEnv = process.env.USERS_DATA;
    if (usersEnv) {
      const users = JSON.parse(usersEnv);
      usersCache = users;
      return users;
    }
  } catch (error) {
    console.error('Error cargando usuarios desde variables de entorno:', error);
  }
  
  // Usuarios por defecto si no hay datos en variables de entorno
  const defaultUsers: User[] = [
    {
      id: '1',
      email: 'maria.garcia@empresa.com',
      name: 'María García',
      password: 'maria123',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'carlos.rodriguez@empresa.com',
      name: 'Carlos Rodríguez',
      password: 'carlos123',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'ana.martinez@empresa.com',
      name: 'Ana Martínez',
      password: 'ana123',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      email: 'david.lopez@empresa.com',
      name: 'David López',
      password: 'david123',
      createdAt: new Date().toISOString()
    }
  ];
  
  usersCache = defaultUsers;
  return defaultUsers;
}

// Función para obtener todos los usuarios
export function getAllUsers(): User[] {
  if (usersCache.length === 0) {
    return loadUsersFromEnv();
  }
  return usersCache;
}

// Función para obtener un usuario por email
export function getUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find(user => user.email === email);
}

// Función para obtener un usuario por número de teléfono
export function getUserByPhoneNumber(phoneNumber: string): User | undefined {
  const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
  const users = getAllUsers();
  return users.find(user => user.phoneNumber === cleanPhoneNumber);
}

// Función para agregar un usuario (solo en memoria en producción)
export function addUser(user: User): void {
  usersCache.push(user);
  console.log(`✅ Usuario agregado en memoria: ${user.email}`);
}

// Función para eliminar un usuario (solo de memoria en producción)
export function deleteUser(userId: string): { success: boolean; user?: User; message: string } {
  const userIndex = usersCache.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'Usuario no encontrado' };
  }
  
  const userToDelete = usersCache[userIndex];
  
  // Solo permitir eliminar usuarios auto-creados
  if (!userToDelete.phoneNumber) {
    return { success: false, message: 'Solo se pueden eliminar usuarios auto-creados' };
  }
  
  usersCache.splice(userIndex, 1);
  console.log(`✅ Usuario eliminado de memoria: ${userToDelete.email}`);
  
  return { 
    success: true, 
    user: userToDelete, 
    message: `Usuario ${userToDelete.email} eliminado exitosamente (solo en memoria)` 
  };
}

// Función para obtener el array de usuarios completo
export function getUsersArray(): User[] {
  return getAllUsers();
}

// Función para generar un ID único
export function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
