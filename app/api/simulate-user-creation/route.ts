import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ 
        error: 'Número de teléfono requerido' 
      }, { status: 400 });
    }

    // Limpiar el número de teléfono
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    
    // Crear email basado en el número de teléfono
    const email = `${cleanPhoneNumber}@whatsapp.local`;
    
    // Verificar si el usuario ya existe
    const usersFile = path.join(process.cwd(), 'users.json');
    let users: any[] = [];
    
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
    }
    
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: `Usuario ${email} ya existe`,
        user: existingUser,
        wasAlreadyCreated: true
      });
    }

    // Crear nuevo usuario
    const userId = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = {
      id: userId,
      email,
      name: cleanPhoneNumber,
      password: hashedPassword,
      phoneNumber: cleanPhoneNumber,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    
    // Guardar usuarios en archivo
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    // Notificar que se creó un usuario
    try {
      // Llamar directamente al endpoint de notificación
      const { POST: notifyUserCreatedHandler } = await import('../user-created/route');
      const notifyResponse = await notifyUserCreatedHandler();
      const notifyData = await notifyResponse.json();
      
      console.log('✅ Notificación de usuario creado enviada:', notifyData);
      
      // Notificar via SSE para auto-refresh en tiempo real
      const { notifyUserCreated: notifySSE } = await import('@/lib/sse-manager');
      notifySSE({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.createdAt
      });
      
      console.log('📡 Notificación SSE enviada para auto-refresh');
    } catch (notifyError) {
      console.error('❌ Error enviando notificación:', notifyError);
    }

    console.log(`✅ Usuario creado:`, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${email} creado exitosamente`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.createdAt
      },
      wasAlreadyCreated: false
    });

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    return NextResponse.json({ 
      error: 'Error creando usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
