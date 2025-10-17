#!/usr/bin/env node

/**
 * Script para eliminar directamente un usuario del archivo users.json
 * Este script modifica el archivo local y luego se puede hacer commit
 */

const fs = require('fs');
const path = require('path');

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('❌ Error: Debes proporcionar un número de teléfono');
  console.log('Uso: node scripts/remove-user-direct.js <phoneNumber>');
  console.log('Ejemplo: node scripts/remove-user-direct.js 5213334987878');
  process.exit(1);
}

function removeUserFromFile(phoneNumber) {
  try {
    const usersFile = path.join(__dirname, '..', 'users.json');
    
    console.log(`🔍 Buscando usuario con número: ${phoneNumber}`);
    console.log(`📁 Archivo: ${usersFile}`);
    
    // Leer el archivo actual
    let users = [];
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
      console.log(`📋 Usuarios encontrados en archivo: ${users.length}`);
    } else {
      console.log('📋 Archivo users.json no existe, creando uno vacío');
    }
    
    // Buscar el usuario a eliminar
    const userIndex = users.findIndex(user => 
      user.phoneNumber === phoneNumber || 
      user.email === `${phoneNumber}@whatsapp.local`
    );
    
    if (userIndex === -1) {
      console.log(`❌ Usuario con número ${phoneNumber} no encontrado en el archivo`);
      console.log('Usuarios en el archivo:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.phoneNumber || 'N/A'})`);
      });
      return false;
    }
    
    const userToDelete = users[userIndex];
    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${userToDelete.id}`);
    console.log(`   Email: ${userToDelete.email}`);
    console.log(`   Nombre: ${userToDelete.name}`);
    console.log(`   Teléfono: ${userToDelete.phoneNumber}`);
    
    // Eliminar el usuario del array
    users.splice(userIndex, 1);
    
    // Guardar el archivo actualizado
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log(`✅ Usuario eliminado del archivo users.json`);
    console.log(`📋 Usuarios restantes: ${users.length}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Ejecutar el script
const success = removeUserFromFile(phoneNumber);

if (success) {
  console.log(`\n🎉 Usuario ${phoneNumber} eliminado exitosamente del archivo local`);
  console.log(`📝 Próximos pasos:`);
  console.log(`   1. Revisar el archivo users.json`);
  console.log(`   2. Hacer commit de los cambios`);
  console.log(`   3. Hacer push a producción`);
} else {
  console.log(`\n❌ No se pudo eliminar el usuario`);
  process.exit(1);
}
