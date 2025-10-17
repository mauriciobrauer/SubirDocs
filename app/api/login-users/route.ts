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

    // Retornar solo la información necesaria para login (sin contraseña)
    const loginUsers = users.map(user => ({
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      users: loginUsers,
      count: loginUsers.length,
      message: "Para hacer login, usa email: 5213334987878@whatsapp.local y contraseña: password123"
    });

  } catch (error) {
    console.error('Error obteniendo usuarios para login:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
