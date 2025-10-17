import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addUser } from '@/lib/users-production';

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Datos de usuario requeridos' 
      }, { status: 400 });
    }

    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // En producción, agregar a la memoria
      addUser(user);
      console.log(`✅ Usuario sincronizado en producción: ${user.email}`);
      
      return NextResponse.json({
        success: true,
        message: `Usuario ${user.email} sincronizado en producción`,
        environment: 'production'
      });
    } else {
      // En desarrollo, agregar al archivo JSON
      const usersFile = path.join(process.cwd(), 'users.json');
      let users: any[] = [];
      
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(data);
      }
      
      // Verificar si el usuario ya existe
      const existingUser = users.find(u => u.email === user.email);
      if (existingUser) {
        return NextResponse.json({
          success: true,
          message: `Usuario ${user.email} ya existe en desarrollo`,
          environment: 'development'
        });
      }
      
      users.push(user);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      
      return NextResponse.json({
        success: true,
        message: `Usuario ${user.email} agregado en desarrollo`,
        environment: 'development'
      });
    }

  } catch (error) {
    console.error('Error sincronizando usuario:', error);
    return NextResponse.json({ 
      error: 'Error sincronizando usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // En producción, retornar usuarios de memoria
      const { getAllUsers } = await import('@/lib/users-production');
      const users = getAllUsers();
      
      return NextResponse.json({
        success: true,
        users: users,
        environment: 'production',
        count: users.length
      });
    } else {
      // En desarrollo, retornar usuarios del archivo
      const usersFile = path.join(process.cwd(), 'users.json');
      let users: any[] = [];
      
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(data);
      }
      
      return NextResponse.json({
        success: true,
        users: users,
        environment: 'development',
        count: users.length
      });
    }

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ 
      error: 'Error obteniendo usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
