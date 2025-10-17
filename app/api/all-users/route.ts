import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllUsers as getUsersFromMemory } from '@/lib/users-production';

// Usuarios hardcodeados
const HARDCODED_USERS = [
  { id: '1', email: 'maria.garcia@empresa.com', name: 'María García', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '2', email: 'carlos.rodriguez@empresa.com', name: 'Carlos Rodríguez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '3', email: 'ana.martinez@empresa.com', name: 'Ana Martínez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '4', email: 'david.lopez@empresa.com', name: 'David López', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
];

export async function GET() {
  try {
    // Verificar si estamos en producción (Vercel)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    let autoUsers: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    if (isProduction) {
      // En producción, usar el sistema de memoria
      const memoryUsers = getUsersFromMemory();
      autoUsers = memoryUsers.filter(user => user.phoneNumber); // Solo usuarios auto-creados
    } else {
      // En desarrollo, leer desde archivo JSON
      const usersFile = path.join(process.cwd(), 'users.json');
      
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf-8');
        autoUsers = JSON.parse(data);
      }
    }

    // Filtrar específicamente el usuario que se quiere eliminar
    autoUsers = autoUsers.filter(user => 
      user.phoneNumber !== '5213334987878' && 
      user.email !== '5213334987878@whatsapp.local'
    );

    // Agregar tipo a usuarios automáticos
    const autoUsersWithType = autoUsers.map(user => ({
      ...user,
      type: 'auto-created'
    }));

    // Combinar ambos tipos de usuarios
    const allUsers = [...HARDCODED_USERS, ...autoUsersWithType];
    
    return NextResponse.json({
      success: true,
      users: allUsers,
      hardcodedCount: HARDCODED_USERS.length,
      autoCreatedCount: autoUsers.length,
      totalCount: allUsers.length,
      environment: isProduction ? 'production' : 'development'
    });

  } catch (error) {
    console.error('Error obteniendo todos los usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
