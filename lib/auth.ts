'use client';

import { User, AuthState } from '@/types';

const STORAGE_KEY = 'auth_user';

// Usuarios simulados para el login
const MOCK_USERS = [
  { id: '1', email: 'maria.garcia@empresa.com', password: 'maria123', name: 'María García' },
  { id: '2', email: 'carlos.rodriguez@empresa.com', password: 'carlos123', name: 'Carlos Rodríguez' },
  { id: '3', email: 'ana.martinez@empresa.com', password: 'ana123', name: 'Ana Martínez' },
  { id: '4', email: 'david.lopez@empresa.com', password: 'david123', name: 'David López' },
];

export class AuthService {
  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static setStoredUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  static async login(email: string, password: string): Promise<User | null> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar en usuarios hardcodeados
    let user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    // Si no se encuentra, buscar en usuarios creados automáticamente
    if (!user) {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          const autoUser = data.users.find((u: any) => u.email === email);
          
          // Para usuarios automáticos, la contraseña por defecto es 'password123'
          if (autoUser && password === 'password123') {
            user = {
              id: autoUser.id,
              email: autoUser.email,
              password: 'password123',
              name: autoUser.name
            };
          }
        }
      } catch (error) {
        console.error('Error fetching auto-created users:', error);
      }
    }
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      this.setStoredUser(userWithoutPassword);
      return userWithoutPassword;
    }
    
    return null;
  }

  static logout(): void {
    this.setStoredUser(null);
  }

  static getInitialAuthState(): AuthState {
    const user = this.getStoredUser();
    return {
      user,
      isAuthenticated: !!user,
      isLoading: false,
    };
  }
}
