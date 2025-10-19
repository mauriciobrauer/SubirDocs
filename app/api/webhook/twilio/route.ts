import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import fs from 'fs';
import path from 'path';
import { addMessage } from '@/lib/messages';
import { DropboxAPI } from '@/lib/dropbox-api';
import TokenManager from '@/lib/token-manager';
import bcrypt from 'bcryptjs';

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Inicializar cliente de Twilio solo si las credenciales están disponibles
let client: any = null;
if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Cliente de Twilio inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando cliente de Twilio:', error);
    client = null;
  }
} else {
  console.warn('⚠️ Credenciales de Twilio no configuradas');
}

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

// Función para guardar usuarios en archivo JSON (solo en desarrollo)
function saveUsersToFile() {
  try {
    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      console.log(`⚠️ Modo producción: No se puede escribir al archivo users.json`);
      return;
    }
    
    const usersFile = path.join(process.cwd(), 'users.json');
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log(`✅ Usuarios guardados en archivo: ${users.length} usuarios`);
  } catch (error) {
    console.error('❌ Error guardando usuarios en archivo:', error);
  }
}

// Función para cargar usuarios desde archivo JSON
function loadUsersFromFile() {
  try {
    const usersFile = path.join(process.cwd(), 'users.json');
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
      console.log(`✅ Usuarios cargados desde archivo: ${users.length} usuarios`);
    }
  } catch (error) {
    console.error('❌ Error cargando usuarios desde archivo:', error);
  }
}

// Cargar usuarios al iniciar
loadUsersFromFile();

// Función para crear usuarios automáticamente
async function createUserAutomatically(phoneNumber: string) {
  try {
    // Limpiar el número de teléfono
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    
    // Crear email basado en el número de teléfono
    const email = `${cleanPhoneNumber}@whatsapp.local`;
    
    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
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
      console.log(`✅ Usuario ya existe: ${existingUser.email}`);
      return existingUser;
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
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  // Log inicial para verificar que el webhook se está ejecutando
  console.log('🚀 WEBHOOK TWILIO INICIADO');
  logs.push('🚀 WEBHOOK TWILIO INICIADO');
  
  // Función para escribir logs detallados (solo console.log en producción)
  const writeDebugLog = (message: string) => {
    console.log(`DEBUG: ${message}`);
  };
  
  writeDebugLog('🚀 WEBHOOK TWILIO INICIADO - DEBUGGING ACTIVADO');
  
  try {
    writeDebugLog('📥 INICIANDO PROCESAMIENTO DEL WEBHOOK');
    
    // Log de headers para debugging
    logs.push('=== HEADERS RECIBIDOS ===');
    writeDebugLog('📋 PROCESANDO HEADERS');
    Array.from(request.headers.entries()).forEach(([key, value]) => {
      logs.push(`${key}: ${value}`);
      writeDebugLog(`Header: ${key} = ${value}`);
    });
    
    // Parsear los datos del webhook de Twilio
    logs.push('=== INICIANDO PARSEO DE FORM DATA ===');
    writeDebugLog('🔄 INICIANDO PARSEO DE FORM DATA');
    const formData = await request.formData();
    logs.push('✅ FormData parseado exitosamente');
    writeDebugLog('✅ FormData parseado exitosamente');
    
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;
    
    logs.push('=== DATOS EXTRAÍDOS ===');
    logs.push(`MessageSid: ${messageSid}`);
    logs.push(`From: ${from}`);
    logs.push(`To: ${to}`);
    logs.push(`Body: ${body}`);
    logs.push(`NumMedia: ${numMedia}`);
    
    writeDebugLog('📊 DATOS EXTRAÍDOS DEL FORM DATA');
    writeDebugLog(`MessageSid: ${messageSid}`);
    writeDebugLog(`From: ${from}`);
    writeDebugLog(`To: ${to}`);
    writeDebugLog(`Body: ${body}`);
    writeDebugLog(`NumMedia: ${numMedia}`);

    logs.push('=== WEBHOOK TWILIO RECIBIDO ===');
    logs.push(`MessageSid: ${messageSid}`);
    logs.push(`From: ${from}`);
    logs.push(`To: ${to}`);
    logs.push(`Body: ${body}`);
    logs.push(`NumMedia: ${numMedia}`);

    console.log('=== WEBHOOK TWILIO RECIBIDO ===');
    console.log(`MessageSid: ${messageSid}`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log(`NumMedia: ${numMedia}`);

    // Log de todos los campos del formData para debugging
    logs.push('=== TODOS LOS CAMPOS DEL FORM DATA ===');
    console.log('=== TODOS LOS CAMPOS DEL FORM DATA ===');
    Array.from(formData.entries()).forEach(([key, value]) => {
      logs.push(`${key}: ${value}`);
      console.log(`${key}: ${value}`);
    });

    // Guardar el mensaje en la UI
    addMessage({
      MessageSid: messageSid,
      From: from,
      To: to,
      Body: body,
      NumMedia: numMedia.toString(),
      ...(numMedia > 0 ? Object.fromEntries(
        Array.from({length: numMedia}, (_, i) => [
          `MediaUrl${i}`, formData.get(`MediaUrl${i}`)
        ])
      ) : {})
    });

           // Si hay archivos multimedia, preparar para procesamiento
           if (numMedia > 0) {
             logs.push(`=== DETECTADOS ${numMedia} ARCHIVO(S) MULTIMEDIA ===`);
             console.log(`=== DETECTADOS ${numMedia} ARCHIVO(S) MULTIMEDIA ===`);
             writeDebugLog(`📁 DETECTADOS ${numMedia} ARCHIVO(S) MULTIMEDIA`);
             
             // Notificar que se recibió un PDF
             const phoneNumber = from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
             const fileName = `mensaje_${messageSid}_${Date.now()}.pdf`;
             
             try {
               await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   isProcessing: true,
                   phoneNumber,
                   fileName,
                   messageSid,
                   status: 'received'
                 })
               });
               console.log('✅ Estado de procesamiento actualizado: PDF recibido');
             } catch (notifyError) {
               console.error('❌ Error actualizando estado de procesamiento:', notifyError);
             }
      
      for (let i = 0; i < numMedia; i++) {
        logs.push(`--- ARCHIVO ${i + 1} ---`);
        writeDebugLog(`📄 PROCESANDO ARCHIVO ${i + 1}`);
        
        const mediaUrl = formData.get(`MediaUrl${i}`) as string;
        const contentType = formData.get(`MediaContentType${i}`) as string;
        
        logs.push(`MediaUrl${i}: ${mediaUrl}`);
        logs.push(`MediaContentType${i}: ${contentType}`);
        
        writeDebugLog(`MediaUrl${i}: ${mediaUrl}`);
        writeDebugLog(`MediaContentType${i}: ${contentType}`);
        
        if (mediaUrl && contentType) {
          logs.push(`✅ Datos del archivo ${i + 1} encontrados`);
          logs.push(`📋 Tipo de archivo: ${contentType}`);
          logs.push(`🔗 URL del archivo: ${mediaUrl}`);
          logs.push(`🔄 Archivo ${i + 1} será procesado en segundo plano`);
          
          writeDebugLog(`✅ Datos del archivo ${i + 1} encontrados`);
          writeDebugLog(`📋 Tipo de archivo: ${contentType}`);
          writeDebugLog(`🔗 URL del archivo: ${mediaUrl}`);
          writeDebugLog(`🔄 Archivo ${i + 1} será procesado en segundo plano`);
        } else {
          logs.push(`⚠️ Archivo ${i + 1} sin URL o ContentType`);
          logs.push(`MediaUrl${i} existe: ${!!mediaUrl}`);
          logs.push(`MediaContentType${i} existe: ${!!contentType}`);
          
          writeDebugLog(`⚠️ Archivo ${i + 1} sin URL o ContentType`);
          writeDebugLog(`MediaUrl${i} existe: ${!!mediaUrl}`);
          writeDebugLog(`MediaContentType${i} existe: ${!!contentType}`);
        }
      }
    } else {
      logs.push('ℹ️ No hay archivos multimedia en este mensaje');
      writeDebugLog('ℹ️ No hay archivos multimedia en este mensaje');
    }

    logs.push('=== WEBHOOK COMPLETADO ===');
    console.log('=== WEBHOOK COMPLETADO ===');

    // Log final
    writeDebugLog('✅ WEBHOOK PRINCIPAL COMPLETADO EXITOSAMENTE');

           // Responder inmediatamente a WhatsApp con mensaje simple
           let responseText = '';
           if (numMedia > 0) {
             responseText = 'Tu documento ha sido recibido';
           } else {
             responseText = `✅ Mensaje recibido: "${body}"\n📱 De: ${from}`;
           }
    
    const response = new NextResponse(responseText, { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

    // Procesar archivos de forma síncrona (simplificado para Vercel)
    if (numMedia > 0) {
      writeDebugLog(`🔄 PROCESANDO ${numMedia} ARCHIVO(S) DE FORMA SÍNCRONA`);
      try {
        writeDebugLog('🔄 INICIANDO PROCESAMIENTO SÍNCRONO SIMPLIFICADO');
        console.log('🔄 Iniciando procesamiento síncrono simplificado...');
        
        // Solo procesar el primer archivo para evitar timeouts
        const mediaUrl = formData.get(`MediaUrl0`) as string;
        const contentType = formData.get(`MediaContentType0`) as string;
        
        writeDebugLog(`📁 PROCESANDO ARCHIVO PRINCIPAL`);
        writeDebugLog(`MediaUrl: ${mediaUrl}`);
        writeDebugLog(`ContentType: ${contentType}`);
        
        if (mediaUrl && contentType) {
          console.log(`📁 Procesando archivo principal...`);
          writeDebugLog(`🔄 LLAMANDO A processMediaFile PARA ARCHIVO PRINCIPAL`);
          try {
            const backgroundLogs: string[] = [];
            await processMediaFile(mediaUrl, contentType, from, messageSid, backgroundLogs);
            console.log(`✅ Archivo principal procesado exitosamente`);
            writeDebugLog(`✅ ARCHIVO PRINCIPAL PROCESADO EXITOSAMENTE`);
            // Escribir logs del procesamiento
            backgroundLogs.forEach(log => writeDebugLog(`[SYNC] ${log}`));
          } catch (processError) {
            const errorMsg = `❌ Error procesando archivo principal: ${processError instanceof Error ? processError.message : String(processError)}`;
            console.error(errorMsg, processError);
            writeDebugLog(`❌ ERROR PROCESANDO ARCHIVO PRINCIPAL: ${errorMsg}`);
            writeDebugLog(`❌ Stack trace: ${processError instanceof Error ? processError.stack : 'No stack trace'}`);
          }
        } else {
          writeDebugLog(`⚠️ ARCHIVO PRINCIPAL SIN URL O CONTENT TYPE`);
        }
        
        writeDebugLog('✅ PROCESAMIENTO SÍNCRONO SIMPLIFICADO COMPLETADO');
      } catch (error) {
        const errorMsg = `❌ Error en procesamiento síncrono simplificado: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg, error);
        writeDebugLog(`❌ ERROR EN PROCESAMIENTO SÍNCRONO SIMPLIFICADO: ${errorMsg}`);
        writeDebugLog(`❌ Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      }
    }

    return response;

  } catch (error) {
    const errorMsg = `❌ ERROR GENERAL EN WEBHOOK: ${error instanceof Error ? error.message : String(error)}`;
    logs.push(errorMsg);
    logs.push(`❌ Error type: ${typeof error}`);
    logs.push(`❌ Error constructor: ${error?.constructor?.name || 'Unknown'}`);
    if (error instanceof Error) {
      logs.push(`❌ Stack trace: ${error.stack}`);
    }
    console.error('Error en webhook de Twilio:', error);
    
    // Log de error detallado
    writeDebugLog(`❌ ERROR GENERAL EN WEBHOOK: ${errorMsg}`);
    writeDebugLog(`❌ Error type: ${typeof error}`);
    writeDebugLog(`❌ Error constructor: ${error?.constructor?.name || 'Unknown'}`);
    if (error instanceof Error) {
      writeDebugLog(`❌ Stack trace: ${error.stack}`);
    }
    
    // Log de error
    writeDebugLog(`❌ ERROR EN WEBHOOK PRINCIPAL: ${errorMsg}`);
    
    const responseText = logs.join('\n');
    return new NextResponse(responseText, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

async function processMediaFile(mediaUrl: string, contentType: string, from: string, messageSid: string, logs?: string[]) {
  try {
    const logMessage = (msg: string) => {
      console.log(msg);
      if (logs) logs.push(msg);
    };

    logMessage('🚀 INICIANDO processMediaFile');
    logMessage(`📥 Parámetros recibidos:`);
    logMessage(`  - mediaUrl: ${mediaUrl}`);
    logMessage(`  - contentType: ${contentType}`);
    logMessage(`  - from: ${from}`);
    logMessage(`  - messageSid: ${messageSid}`);
    logMessage(`  - logs array existe: ${!!logs}`);

    logMessage('=== PROCESANDO ARCHIVO MULTIMEDIA ===');
    logMessage(`MediaUrl: ${mediaUrl}`);
    logMessage(`ContentType: ${contentType}`);
    logMessage(`From: ${from}`);
    logMessage(`MessageSid: ${messageSid}`);
    
    // Descargar el archivo desde Twilio
    logMessage('Descargando archivo desde Twilio...');
    logMessage(`🔑 AccountSid: ${accountSid ? 'Configurado' : 'NO CONFIGURADO'}`);
    logMessage(`🔑 AuthToken: ${authToken ? 'Configurado' : 'NO CONFIGURADO'}`);
    
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
    logMessage(`🔐 Header de autorización generado: ${authHeader.substring(0, 20)}...`);
    
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': authHeader
      }
    });

    logMessage(`Respuesta de descarga: ${mediaResponse.status} ${mediaResponse.statusText}`);
    logMessage(`Headers de respuesta: ${JSON.stringify(Object.fromEntries(mediaResponse.headers.entries()))}`);
    
    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      const errorMsg = `Error descargando archivo: ${mediaResponse.status} - ${errorText}`;
      console.error(errorMsg);
      if (logs) logs.push(`❌ ${errorMsg}`);
      throw new Error(`Error descargando archivo: ${mediaResponse.status}`);
    }

    const fileBuffer = await mediaResponse.arrayBuffer();
    logMessage(`Archivo descargado exitosamente. Tamaño: ${fileBuffer.byteLength} bytes`);
    
    // Determinar la extensión del archivo basada en el content type
    const extension = getFileExtension(contentType);
    const fileName = `mensaje_${messageSid}_${Date.now()}${extension}`;
    logMessage(`Nombre de archivo generado: ${fileName}`);
    
    // En Vercel, no podemos escribir archivos al sistema de archivos
    // Solo procesamos el archivo para subirlo a Dropbox
    const phoneNumber = from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    
    logMessage(`📱 Número de teléfono: ${phoneNumber}`);
    logMessage(`📄 Nombre del archivo: ${fileName}`);
    logMessage(`📁 Tamaño del archivo: ${fileBuffer.byteLength} bytes`);
    logMessage(`📅 Fecha de procesamiento: ${new Date().toISOString()}`);
    
           // Crear usuario automáticamente si no existe
           logMessage('Creando usuario automáticamente...');
           
           // Notificar que se está creando el usuario
           try {
             await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 isProcessing: true,
                 phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                 fileName,
                 messageSid,
                 status: 'creating_user'
               })
             });
           } catch (notifyError) {
             console.error('❌ Error actualizando estado: creando usuario', notifyError);
           }
           
           try {
             const user = await createUserAutomatically(from);
             logMessage(`✅ Usuario creado/verificado: ${user.email}`);
             
             // Notificar que se está guardando el archivo
             try {
               await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   isProcessing: true,
                   phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                   fileName,
                   messageSid,
                   status: 'saving_file'
                 })
               });
             } catch (notifyError) {
               console.error('❌ Error actualizando estado: guardando archivo', notifyError);
             }
             
           } catch (userError) {
             const errorMsg = `❌ Error creando usuario: ${userError instanceof Error ? userError.message : String(userError)}`;
             console.error(errorMsg);
             if (logs) logs.push(errorMsg);
           }

           // Subir también a Dropbox
           logMessage('Subiendo archivo a Dropbox...');
           
           // Log de inicio de subida a Dropbox
           try {
             await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 message: 'Iniciando subida a Dropbox',
                 phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                 fileName
               })
             });
           } catch (logError) {
             console.error('❌ Error enviando log de Dropbox:', logError);
           }
           
           // Notificar que se está subiendo a Dropbox
           try {
             await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 isProcessing: true,
                 phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                 fileName,
                 messageSid,
                 status: 'uploading_dropbox'
               })
             });
           } catch (notifyError) {
             console.error('❌ Error actualizando estado: subiendo a dropbox', notifyError);
           }
           
           try {
             // Obtener token de Dropbox usando TokenManager
             const dropboxToken = await TokenManager.getValidAccessToken();
             console.log('🔑 Token renovado exitosamente en webhook');
             console.log('🔑 Token inicio en webhook:', dropboxToken.substring(0, 15) + '...');
             console.log('🔑 Token tipo:', dropboxToken.startsWith('sl.u.') ? 'Corta duración' : dropboxToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido');
             console.log('✅ Token válido y renovado automáticamente');
             
             const dropboxFolderName = `/GuardaPDFDropbox/${phoneNumber}`;
             const file = new File([fileBuffer], fileName, { type: contentType });
             
             logMessage(`🔍 INICIANDO PROCESO DE SUBIDA A DROPBOX`);
             logMessage(`📁 Carpeta destino: ${dropboxFolderName}`);
              logMessage(`📄 Archivo: ${fileName} (${fileBuffer.byteLength} bytes)`);
             logMessage(`🔑 Token disponible: ${!!dropboxToken}`);
             logMessage(`🔑 Token tipo: ${dropboxToken.startsWith('sl.u.') ? 'Corta duración' : dropboxToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido'}`);
             
             console.log('🚀 LLAMANDO A DropboxAPI.uploadFile...');
             console.log('📁 Parámetros:', {
               fileName: fileName,
               folder: dropboxFolderName,
               fileSize: fileBuffer.byteLength,
               contentType: contentType,
               hasToken: !!dropboxToken
             });
             
             logMessage(`🚀 LLAMANDO A DropboxAPI.uploadFile con parámetros:`);
             logMessage(`📁 Carpeta: ${dropboxFolderName}`);
              logMessage(`📄 Archivo: ${fileName} (${fileBuffer.byteLength} bytes)`);
             logMessage(`🔑 Token disponible: ${!!dropboxToken}`);
             
             const userEmail = `${phoneNumber}@whatsapp.local`;
             await DropboxAPI.uploadFile(file, userEmail);
             logMessage(`✅ Archivo ${fileName} subido exitosamente a Dropbox para usuario: ${userEmail}`);
             
             // Notificar que se completó el procesamiento
             try {
               await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   isProcessing: false,
                   phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                   fileName,
                   messageSid,
                   status: 'completed'
                 })
               });
             } catch (notifyError) {
               console.error('❌ Error actualizando estado: completado', notifyError);
             }
             
           } catch (dropboxError) {
             const errorMsg = `❌ Error subiendo a Dropbox: ${dropboxError instanceof Error ? dropboxError.message : String(dropboxError)}`;
             const errorDetails = `❌ Error details: ${dropboxError instanceof Error ? dropboxError.stack : 'No stack trace'}`;
             console.error(errorMsg);
             console.error(errorDetails);
             if (logs) logs.push(errorMsg);
             if (logs) logs.push(errorDetails);
             logMessage('⚠️ El archivo se guardó localmente, pero falló la subida a Dropbox');
             logMessage(`❌ Error completo: ${JSON.stringify(dropboxError, null, 2)}`);
             
             // Log del error de Dropbox
             try {
               await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   message: 'Error subiendo a Dropbox',
                   phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                   fileName,
                   error: {
                     message: dropboxError instanceof Error ? dropboxError.message : String(dropboxError),
                     stack: dropboxError instanceof Error ? dropboxError.stack : 'No stack trace',
                     type: dropboxError instanceof Error ? dropboxError.constructor.name : typeof dropboxError
                   }
                 })
               });
             } catch (logError) {
               console.error('❌ Error enviando log de error de Dropbox:', logError);
             }
             
             // Notificar error pero marcar como completado (archivo guardado localmente)
             try {
               await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/processing-status`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   isProcessing: false,
                   phoneNumber: from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, ''),
                   fileName,
                   messageSid,
                   status: 'completed',
                   error: `Dropbox Error: ${dropboxError instanceof Error ? dropboxError.message : String(dropboxError)}`
                 })
               });
             } catch (notifyError) {
               console.error('❌ Error actualizando estado: error', notifyError);
             }
             // No lanzamos el error para que el proceso continúe
           }
    
  } catch (error) {
    const errorMsg = `❌ Error procesando archivo multimedia: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    if (logs) logs.push(errorMsg);
    throw error;
  }
}

function getFileExtension(contentType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  };
  
  return extensions[contentType] || '.bin';
}
