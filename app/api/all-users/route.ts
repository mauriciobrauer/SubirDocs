import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Usuarios hardcodeados
const HARDCODED_USERS = [
  { id: '1', email: 'maria.garcia@empresa.com', name: 'María García', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '2', email: 'carlos.rodriguez@empresa.com', name: 'Carlos Rodríguez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '3', email: 'ana.martinez@empresa.com', name: 'Ana Martínez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
  { id: '4', email: 'david.lopez@empresa.com', name: 'David López', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z', type: 'hardcoded' },
];

export async function GET() {
  try {
    // Leer usuarios creados automáticamente desde archivo JSON
    const usersFile = path.join(process.cwd(), 'users.json');
    let autoUsers: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      autoUsers = JSON.parse(data);
    }

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
      totalCount: allUsers.length
    });

  } catch (error) {
    console.error('Error obteniendo todos los usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
