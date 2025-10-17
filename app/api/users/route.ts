import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Leer usuarios desde archivo JSON
    const usersFile = path.join(process.cwd(), 'users.json');
    let users: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
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
