#!/usr/bin/env node

/**
 * Script para simular el envío de un PDF y verificar que se cree el usuario
 * Uso: node scripts/simulate-pdf-upload.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987878';

async function simulatePdfUpload(phoneNumber) {
  try {
    console.log(`🧪 Simulando envío de PDF desde: ${phoneNumber}`);
    
    // Simular datos del webhook de Twilio
    const formData = new FormData();
    formData.append('MessageSid', `MM${Date.now()}`);
    formData.append('From', `whatsapp:${phoneNumber}`);
    formData.append('To', 'whatsapp:+1234567890');
    formData.append('Body', 'PDF enviado');
    formData.append('NumMedia', '1');
    formData.append('MediaUrl0', 'https://example.com/test.pdf');
    formData.append('MediaContentType0', 'application/pdf');
    
    console.log(`📤 Enviando webhook a localhost...`);
    
    const response = await fetch('http://localhost:3000/api/webhook/twilio', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const responseText = await response.text();
      console.log(`✅ Webhook procesado exitosamente:`);
      console.log(`📋 Respuesta: ${responseText}`);
      
      // Esperar un momento para que se procese
      console.log(`⏳ Esperando 3 segundos para que se procese...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar que el usuario se creó
      console.log(`🔍 Verificando que el usuario se creó...`);
      
      const usersResponse = await fetch('http://localhost:3000/api/all-users');
      const usersData = await usersResponse.json();
      
      const userEmail = `${phoneNumber}@whatsapp.local`;
      const createdUser = usersData.users.find(user => user.email === userEmail);
      
      if (createdUser) {
        console.log(`✅ Usuario creado exitosamente:`);
        console.log(`   Email: ${createdUser.email}`);
        console.log(`   Tipo: ${createdUser.type}`);
        console.log(`   ID: ${createdUser.id}`);
        console.log(`   Total usuarios: ${usersData.totalCount}`);
      } else {
        console.log(`❌ Usuario NO encontrado en la lista`);
        console.log(`   Usuarios disponibles: ${usersData.users.length}`);
        usersData.users.forEach(user => {
          console.log(`   - ${user.email} (${user.type})`);
        });
      }
      
      // Verificar archivos locales
      console.log(`📁 Verificando archivos locales...`);
      const fs = require('fs');
      const path = require('path');
      const tmpDir = path.join(process.cwd(), 'tmp-files', phoneNumber);
      
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        console.log(`✅ Archivos encontrados en ${tmpDir}:`);
        files.forEach(file => {
          console.log(`   - ${file}`);
        });
      } else {
        console.log(`❌ No se encontró carpeta local: ${tmpDir}`);
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Error en webhook: ${response.status} ${response.statusText}`);
      console.log(`📋 Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Ejecutar el script
simulatePdfUpload(phoneNumber);
