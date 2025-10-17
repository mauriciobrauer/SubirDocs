import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Simulamos una base de datos en memoria para usuarios
// En producción, esto debería ser una base de datos real
let users: Array<{
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}> = [];

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
    const existingUser = users.find(user => user.email === email);
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

    users.push(newUser);

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

// Función para obtener un usuario por email (para autenticación)
export function getUserByEmail(email: string) {
  return users.find(user => user.email === email);
}

// Función para obtener un usuario por número de teléfono
export function getUserByPhoneNumber(phoneNumber: string) {
  const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
  return users.find(user => user.phoneNumber === cleanPhoneNumber);
}

// Función para obtener todos los usuarios
export function getAllUsers() {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt
  }));
}
