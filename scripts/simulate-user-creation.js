#!/usr/bin/env node

/**
 * Script para simular la creación de un usuario en producción
 * Uso: node scripts/simulate-user-creation.js <phoneNumber>
 */

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('❌ Error: Debes proporcionar un número de teléfono');
  console.log('Uso: node scripts/simulate-user-creation.js <phoneNumber>');
  console.log('Ejemplo: node scripts/simulate-user-creation.js 5213334987878');
  process.exit(1);
}

async function simulateUserCreation(phoneNumber) {
  try {
    console.log(`🧪 Simulando creación de usuario para: ${phoneNumber}`);
    
    // Crear el usuario como lo haría el webhook
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
    const email = `${cleanPhoneNumber}@whatsapp.local`;
    const userId = `user_${Date.now()}`;
    
    const newUser = {
      id: userId,
      email,
      name: cleanPhoneNumber,
      password: 'password123', // Contraseña por defecto
      phoneNumber: cleanPhoneNumber,
      createdAt: new Date().toISOString()
    };
    
    console.log(`📋 Usuario a crear:`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Nombre: ${newUser.name}`);
    console.log(`   Teléfono: ${newUser.phoneNumber}`);
    
    // Llamar al endpoint de sincronización
    const response = await fetch('https://subir-docs.vercel.app/api/sync-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: newUser })
    });
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Resultado:`);
    console.log(`   Éxito: ${data.success}`);
    console.log(`   Mensaje: ${data.message}`);
    console.log(`   Entorno: ${data.environment}`);
    
    // Verificar que el usuario aparezca en la lista
    console.log(`\n🔍 Verificando que el usuario aparezca en la lista...`);
    
    const listResponse = await fetch('https://subir-docs.vercel.app/api/all-users');
    const listData = await listResponse.json();
    
    const userInList = listData.users.find(user => user.email === email);
    
    if (userInList) {
      console.log(`✅ Usuario encontrado en la lista:`);
      console.log(`   Email: ${userInList.email}`);
      console.log(`   Tipo: ${userInList.type}`);
      console.log(`   Total usuarios: ${listData.totalCount}`);
    } else {
      console.log(`❌ Usuario NO encontrado en la lista`);
      console.log(`   Usuarios disponibles: ${listData.users.length}`);
      listData.users.forEach(user => {
        console.log(`   - ${user.email} (${user.type})`);
      });
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

// Ejecutar el script
simulateUserCreation(phoneNumber);
