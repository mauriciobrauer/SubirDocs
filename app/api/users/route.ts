import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    let users: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // En producción, usar el sistema de memoria
      try {
        const { getAllUsers } = await import('@/lib/users-production');
        users = getAllUsers();
        console.log(`✅ Usuarios obtenidos desde memoria en producción: ${users.length} usuarios`);
      } catch (memoryError) {
        console.error('❌ Error obteniendo usuarios de memoria en producción:', memoryError);
        users = [];
      }
    } else {
      // En desarrollo, leer desde archivo JSON
      const usersFile = path.join(process.cwd(), 'users.json');
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(data);
        console.log(`✅ Usuarios obtenidos desde archivo en desarrollo: ${users.length} usuarios`);
      }
    }
    
    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
