import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import fs from 'fs';
import path from 'path';
import { addMessage } from '@/lib/messages';
import { DropboxService } from '@/lib/dropbox';
import bcrypt from 'bcryptjs';

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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

// Función para guardar usuarios en archivo JSON
function saveUsersToFile() {
  try {
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
    
    // Verificar si el usuario ya existe
    const existingUser = users.find(user => user.email === email);
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

          users.push(newUser);
          
          // Guardar usuarios en archivo
          saveUsersToFile();

          // Notificar que se creó un usuario
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-created`, {
              method: 'POST'
            });
            console.log('✅ Notificación de usuario creado enviada');
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
  
  // Log a archivo para debugging
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(process.cwd(), 'webhook-main-log.txt');
  const debugLogFile = path.join(process.cwd(), 'webhook-debug-detailed.txt');
  const timestamp = new Date().toISOString();
  
  // Función para escribir logs detallados
  const writeDebugLog = (message: string) => {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(debugLogFile, logMessage);
    console.log(`DEBUG: ${message}`);
  };
  
  fs.appendFileSync(logFile, `[${timestamp}] WEBHOOK PRINCIPAL RECIBIDO - INICIANDO\n`);
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

    // Log final a archivo
    const finalTimestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${finalTimestamp}] WEBHOOK PRINCIPAL COMPLETADO EXITOSAMENTE\n`);

           // Responder inmediatamente a WhatsApp con logs cortos
           let responseText = '';
           if (numMedia > 0) {
             const phoneNumber = from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
             const messageSidShort = messageSid.substring(0, 8);
             const dropboxTokenStatus = process.env.DROPBOX_ACCESS_TOKEN ? 'Configurado' : 'NO CONFIGURADO';
             responseText = `✅ PDF recibido!\n📁 Tipo: ${formData.get('MediaContentType0')}\n📱 De: ${phoneNumber}\n🆔 Msg: ${messageSidShort}\n🔄 Procesando...\n📂 Local: tmp-files/${phoneNumber}\n☁️ Dropbox: ${dropboxTokenStatus}\n👤 Usuario: ${phoneNumber}@whatsapp.local\n🔍 Debug: Ver logs en UI`;
           } else {
             responseText = `✅ Mensaje recibido: "${body}"\n📱 De: ${from}`;
           }
    
    const response = new NextResponse(responseText, { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

    // Procesar archivos en segundo plano después de responder
    if (numMedia > 0) {
      writeDebugLog(`🔄 PROGRAMANDO PROCESAMIENTO EN SEGUNDO PLANO PARA ${numMedia} ARCHIVO(S)`);
      setTimeout(async () => {
        try {
          writeDebugLog('🔄 INICIANDO PROCESAMIENTO EN SEGUNDO PLANO');
          console.log('🔄 Iniciando procesamiento en segundo plano...');
          for (let i = 0; i < numMedia; i++) {
            const mediaUrl = formData.get(`MediaUrl${i}`) as string;
            const contentType = formData.get(`MediaContentType${i}`) as string;
            
            writeDebugLog(`📁 PROCESANDO ARCHIVO ${i + 1} EN SEGUNDO PLANO`);
            writeDebugLog(`MediaUrl: ${mediaUrl}`);
            writeDebugLog(`ContentType: ${contentType}`);
            
            if (mediaUrl && contentType) {
              console.log(`📁 Procesando archivo ${i + 1} en segundo plano...`);
              writeDebugLog(`🔄 LLAMANDO A processMediaFile PARA ARCHIVO ${i + 1}`);
              try {
                const backgroundLogs: string[] = [];
                await processMediaFile(mediaUrl, contentType, from, messageSid, backgroundLogs);
                console.log(`✅ Archivo ${i + 1} procesado exitosamente en segundo plano`);
                writeDebugLog(`✅ ARCHIVO ${i + 1} PROCESADO EXITOSAMENTE EN SEGUNDO PLANO`);
                // Escribir logs del procesamiento en segundo plano
                backgroundLogs.forEach(log => writeDebugLog(`[BACKGROUND] ${log}`));
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] ARCHIVO ${i + 1} PROCESADO EXITOSAMENTE\n`);
              } catch (processError) {
                const errorMsg = `❌ Error procesando archivo ${i + 1}: ${processError instanceof Error ? processError.message : String(processError)}`;
                console.error(errorMsg, processError);
                writeDebugLog(`❌ ERROR PROCESANDO ARCHIVO ${i + 1}: ${errorMsg}`);
                writeDebugLog(`❌ Stack trace: ${processError instanceof Error ? processError.stack : 'No stack trace'}`);
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR PROCESANDO ARCHIVO ${i + 1}: ${errorMsg}\n`);
              }
            } else {
              writeDebugLog(`⚠️ ARCHIVO ${i + 1} SIN URL O CONTENT TYPE EN SEGUNDO PLANO`);
            }
          }
          writeDebugLog('✅ PROCESAMIENTO EN SEGUNDO PLANO COMPLETADO');
        } catch (error) {
          const errorMsg = `❌ Error en procesamiento en segundo plano: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg, error);
          writeDebugLog(`❌ ERROR EN PROCESAMIENTO EN SEGUNDO PLANO: ${errorMsg}`);
          writeDebugLog(`❌ Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`);
          fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR EN SEGUNDO PLANO: ${errorMsg}\n`);
        }
      }, 100); // Esperar 100ms para asegurar que la respuesta se envíe
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
    
    // Log de error a archivo
    const errorTimestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${errorTimestamp}] ERROR EN WEBHOOK PRINCIPAL: ${errorMsg}\n`);
    
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
    
    // Crear carpeta por número de teléfono del remitente
    const phoneNumber = from.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    const folderPath = path.join(process.cwd(), 'tmp-files', phoneNumber);
    const filePath = path.join(folderPath, fileName);
    
    logMessage(`Carpeta de destino: ${folderPath}`);
    logMessage(`Ruta completa del archivo: ${filePath}`);
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      logMessage(`✅ Carpeta creada: ${folderPath}`);
    }
    
    // Guardar el archivo localmente
    logMessage('Guardando archivo localmente...');
    fs.writeFileSync(filePath, Buffer.from(fileBuffer));
    
    logMessage(`✅ Archivo ${fileName} guardado exitosamente en: ${filePath}`);
    
    // Mostrar información del archivo guardado
    const stats = fs.statSync(filePath);
    logMessage(`📁 Tamaño del archivo: ${stats.size} bytes`);
    logMessage(`📅 Fecha de creación: ${stats.birthtime}`);
    
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
             // Obtener token de Dropbox directamente
             const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
             console.log('🔑 Token de Dropbox en webhook:', !!dropboxToken);
             console.log('🔑 Token inicio en webhook:', dropboxToken ? dropboxToken.substring(0, 15) + '...' : 'NO TOKEN');
             console.log('🔑 Token completo (primeros 50 chars):', dropboxToken ? dropboxToken.substring(0, 50) + '...' : 'NO TOKEN');
             console.log('🔑 Token tipo:', typeof dropboxToken);
             console.log('🔑 Token longitud:', dropboxToken ? dropboxToken.length : 'NO TOKEN');
             console.log('🔑 Token empieza con sl.u:', dropboxToken ? dropboxToken.startsWith('sl.u.') : 'NO TOKEN');
             console.log('🔑 Token empieza con sl.B:', dropboxToken ? dropboxToken.startsWith('sl.B') : 'NO TOKEN');
             console.log('⚠️ DIAGNÓSTICO: Token sl.u. es de corta duración y puede estar expirado');
             console.log('💡 SOLUCIÓN: Necesitas generar un token sl.B. de larga duración en Dropbox App Console');
             
             if (!dropboxToken) {
               throw new Error('DROPBOX_ACCESS_TOKEN no configurado en webhook');
             }
             
             const dropboxFolderName = `/GuardaPDFDropbox/${phoneNumber}`;
             const file = new File([fileBuffer], fileName, { type: contentType });
             
             logMessage(`🔍 INICIANDO PROCESO DE SUBIDA A DROPBOX`);
             logMessage(`📁 Carpeta destino: ${dropboxFolderName}`);
              logMessage(`📄 Archivo: ${fileName} (${fileBuffer.byteLength} bytes)`);
             logMessage(`🔑 Token disponible: ${!!dropboxToken}`);
             logMessage(`🔑 Token tipo: ${dropboxToken.startsWith('sl.u.') ? 'Corta duración' : dropboxToken.startsWith('sl.B') ? 'Larga duración' : 'Desconocido'}`);
             
             console.log('🚀 LLAMANDO A DropboxService.uploadFile...');
             console.log('📁 Parámetros:', {
               fileName: fileName,
               folder: dropboxFolderName,
                fileSize: fileBuffer.byteLength,
               contentType: contentType,
               hasToken: !!dropboxToken
             });
             
             logMessage(`🚀 LLAMANDO A DropboxService.uploadFile con parámetros:`);
             logMessage(`📁 Carpeta: ${dropboxFolderName}`);
              logMessage(`📄 Archivo: ${fileName} (${fileBuffer.byteLength} bytes)`);
             logMessage(`🔑 Token disponible: ${!!dropboxToken}`);
             
             await DropboxService.uploadFile(file, dropboxFolderName, dropboxToken);
             logMessage(`✅ Archivo ${fileName} subido exitosamente a Dropbox en carpeta: ${dropboxFolderName}`);
             
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
