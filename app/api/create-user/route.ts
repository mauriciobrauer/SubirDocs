import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, addUser } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Número de teléfono requerido' }, { status: 400 });
    }

    // Limpiar el número de teléfono
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    
    // Crear email basado en el número de teléfono
    const email = `${cleanPhoneNumber}@whatsapp.local`;
    
    // Verificar si el usuario ya existe
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Usuario ya existe',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber
        }
      });
    }

    // Crear nuevo usuario
    const userId = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash('password123', 10); // Contraseña por defecto
    
    const newUser = {
      id: userId,
      email,
      name: cleanPhoneNumber, // Usar el número como nombre
      password: hashedPassword,
      phoneNumber: cleanPhoneNumber,
      createdAt: new Date().toISOString()
    };

    addUser(newUser);

    console.log(`✅ Usuario creado automáticamente:`, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json({ 
      error: 'Error al crear usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

