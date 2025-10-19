import { NextResponse } from 'next/server';
import { createFirebaseUser, getFirebaseUser } from '@/lib/firebase-users';

export async function POST() {
  try {
    console.log('🧪 Probando creación de usuario en Firebase...');
    
    const testPhoneNumber = '5213334987878';
    const testEmail = `${testPhoneNumber}@whatsapp.local`;
    
    // Verificar si el usuario ya existe
    const existingUser = await getFirebaseUser(testPhoneNumber);
    if (existingUser) {
      console.log(`✅ Usuario ya existe en Firebase: ${existingUser.email}`);
      return NextResponse.json({
        success: true,
        message: 'Usuario ya existe en Firebase',
        user: {
          uid: existingUser.uid,
          email: existingUser.email,
          displayName: existingUser.displayName,
          phoneNumber: existingUser.phoneNumber,
          createdAt: existingUser.metadata.creationTime
        }
      });
    }
    
    // Crear nuevo usuario en Firebase
    console.log(`➕ Creando usuario en Firebase: ${testEmail}`);
    const newUser = await createFirebaseUser(testEmail, testPhoneNumber, testPhoneNumber);
    
    console.log(`✅ Usuario creado en Firebase: ${newUser.uid}`);
    
    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente en Firebase',
      user: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.metadata.creationTime
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error probando creación de usuario en Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error creando usuario en Firebase',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
