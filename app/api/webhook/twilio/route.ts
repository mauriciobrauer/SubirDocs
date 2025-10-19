import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import TokenManager from '@/lib/token-manager';
import { DropboxAPI } from '@/lib/dropbox-api';

// Array de usuarios en memoria (solo para desarrollo)
let users: Array<{
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}> = [];

// Función para cargar usuarios desde archivo (solo desarrollo)
function loadUsersFromFile() {
  const usersFile = path.join(process.cwd(), 'users.json');
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    users = [];
  }
}

// Función para guardar usuarios en archivo (solo desarrollo)
function saveUsersToFile() {
  const usersFile = path.join(process.cwd(), 'users.json');
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error guardando usuarios:', error);
  }
}

// Cargar usuarios al inicializar (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
  loadUsersFromFile();
}

// Función para crear usuarios automáticamente
async function createUserAutomatically(phoneNumber: string) {
  try {
    // Limpiar el número de teléfono
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    
    // Crear email basado en el número de teléfono
    const email = `${cleanPhoneNumber}@whatsapp.local`;
    
    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    // Intentar usar Firebase primero (si está disponible)
    try {
      console.log('🔥 === INTENTANDO USAR FIREBASE ===');
      console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);
      
      const { getFirebaseUser, createFirebaseUser } = await import('@/lib/firebase-users');
      console.log('✅ Firebase users module importado correctamente');
      
      // Verificar si el usuario ya existe en Firebase
      console.log(`🔍 Verificando si usuario existe en Firebase: ${cleanPhoneNumber}`);
      const existingFirebaseUser = await getFirebaseUser(cleanPhoneNumber);
      if (existingFirebaseUser) {
        console.log(`✅ Usuario ya existe en Firebase: ${existingFirebaseUser.email}`);
        return {
          id: existingFirebaseUser.uid,
          email: existingFirebaseUser.email,
          name: existingFirebaseUser.displayName || cleanPhoneNumber,
          phoneNumber: cleanPhoneNumber,
          createdAt: existingFirebaseUser.metadata.creationTime
        };
      }
      
      // Crear nuevo usuario en Firebase
      console.log(`🔄 Creando nuevo usuario en Firebase: ${email}`);
      const firebaseUser = await createFirebaseUser(email, cleanPhoneNumber, cleanPhoneNumber);
      console.log(`✅ Usuario creado en Firebase: ${firebaseUser.uid}`);
      
      // Notificar que se creó un usuario
      try {
        const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-created`;
        console.log(`📤 Enviando notificación a: ${notifyUrl}`);
        
        const notifyResponse = await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (notifyResponse.ok) {
          const notifyData = await notifyResponse.json();
          console.log('✅ Notificación de usuario creado enviada:', notifyData);
        } else {
          console.error('❌ Error en respuesta de notificación:', notifyResponse.status, notifyResponse.statusText);
        }
      } catch (notifyError) {
        console.error('❌ Error enviando notificación de usuario creado:', notifyError);
      }

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: firebaseUser.displayName || cleanPhoneNumber,
        phoneNumber: cleanPhoneNumber,
        createdAt: firebaseUser.metadata.creationTime
      };
      
    } catch (firebaseError) {
      console.log('❌ === ERROR EN FIREBASE ===');
      console.log(`❌ Firebase no disponible, usando sistema de memoria local`);
      console.log(`❌ Error Firebase: ${firebaseError instanceof Error ? firebaseError.message : String(firebaseError)}`);
      if (firebaseError instanceof Error) {
        console.log(`❌ Stack trace: ${firebaseError.stack}`);
      }
      
      // Fallback al sistema anterior si Firebase no está disponible
      let existingUser = null;
      
      if (isProduction) {
        // En producción, verificar en el sistema de memoria
        try {
          const { getUserByEmail } = await import('@/lib/users-production');
          existingUser = getUserByEmail(email);
        } catch (memoryError) {
          console.error('❌ Error verificando usuario en memoria:', memoryError);
        }
      } else {
        // En desarrollo, verificar en el array local
        existingUser = users.find(user => user.email === email);
      }
      
      if (existingUser) {
        console.log(`✅ Usuario ya existe en sistema local: ${existingUser.email}`);
        return existingUser;
      }

      // Crear nuevo usuario en sistema local
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

      if (isProduction) {
        // En producción, solo usar el sistema de memoria
        try {
          const { addUser } = await import('@/lib/users-production');
          addUser(newUser);
          console.log(`✅ Usuario agregado al sistema de memoria en producción: ${newUser.email}`);
        } catch (memoryError) {
          console.error('❌ Error agregando usuario a memoria en producción:', memoryError);
          throw memoryError;
        }
      } else {
        // En desarrollo, usar el array local y guardar en archivo
        users.push(newUser);
        saveUsersToFile();
      }
      
      // Notificar que se creó un usuario
      try {
        const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-created`;
        console.log(`📤 Enviando notificación a: ${notifyUrl}`);
        
        const notifyResponse = await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (notifyResponse.ok) {
          const notifyData = await notifyResponse.json();
          console.log('✅ Notificación de usuario creado enviada:', notifyData);
        } else {
          console.error('❌ Error en respuesta de notificación:', notifyResponse.status, notifyResponse.statusText);
        }
      } catch (notifyError) {
        console.error('❌ Error enviando notificación de usuario creado:', notifyError);
      }

      console.log(`✅ Usuario creado automáticamente:`, {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber
      });

      return newUser;
    }
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  // Log inicial para verificar que el webhook se está ejecutando
  console.log('🔔 === WEBHOOK TWILIO INICIADO ===');
  
  try {
    // Verificar variables de entorno de Dropbox
    const dropboxTokenStatus = process.env.DROPBOX_REFRESH_TOKEN ? '✅ Configurado' : '❌ No configurado';
    console.log(`🔑 Dropbox Token: ${dropboxTokenStatus}`);
    
    // Verificar variables de entorno de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioStatus = accountSid && authToken ? '✅ Configurado' : '❌ No configurado';
    console.log(`📱 Twilio: ${twilioStatus}`);
    
    // Verificar Firebase
    const firebaseStatus = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Configurado' : '⚠️ No configurado';
    console.log(`🔥 Firebase: ${firebaseStatus}`);

    // Obtener datos del formulario
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;

    console.log(`📨 Mensaje recibido: "${body}"`);
    console.log(`📱 De: ${from}`);
    console.log(`📱 Para: ${to}`);
    console.log(`📎 Archivos adjuntos: ${numMedia}`);

    // Si hay archivos adjuntos, procesar el primero
    if (numMedia > 0) {
      console.log(`🔄 Procesando archivo adjunto...`);
      
      try {
        // Crear usuario automáticamente
        const user = await createUserAutomatically(from);
        console.log(`👤 Usuario procesado: ${user.email}`);

        // Obtener el archivo adjunto
        const mediaUrl = formData.get(`MediaUrl0`) as string;
        const mediaContentType = formData.get(`MediaContentType0`) as string;

        if (mediaUrl && mediaContentType) {
          console.log(`📎 URL del archivo: ${mediaUrl}`);
          console.log(`📎 Tipo de contenido: ${mediaContentType}`);

          // Descargar el archivo
          const mediaResponse = await fetch(mediaUrl);
          if (!mediaResponse.ok) {
            throw new Error(`Error descargando archivo: ${mediaResponse.status}`);
          }

          const fileBuffer = await mediaResponse.arrayBuffer();
          const fileName = `documento_${Date.now()}.pdf`;

          // Subir a Dropbox usando el TokenManager
          console.log(`☁️ Subiendo archivo a Dropbox...`);
          const uploadResult = await DropboxAPI.uploadFile(
            Buffer.from(fileBuffer),
            fileName,
            user.email, // Usar el email completo para consistencia en nombres de carpeta
            mediaContentType
          );

          if (uploadResult.success) {
            console.log(`✅ Archivo subido exitosamente: ${fileName}`);
          } else {
            console.error(`❌ Error subiendo archivo: ${uploadResult.error}`);
          }
        }
      } catch (error) {
        console.error('❌ Error procesando archivo adjunto:', error);
      }
    }

    // Respuesta simplificada
    let responseText = '';
    if (numMedia > 0) {
      responseText = 'Tu documento ha sido recibido';
    } else if (body) {
      responseText = `Mensaje recibido: ${body}`;
    } else {
      responseText = 'Mensaje recibido';
    }

    console.log(`📤 Respuesta: ${responseText}`);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseText}</Message>
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error procesando mensaje</Message>
</Response>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}
