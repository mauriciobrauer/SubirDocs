#!/usr/bin/env node

/**
 * Script para eliminar un usuario específico de producción
 * Uso: node scripts/delete-specific-user.js <phoneNumber>
 */

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('❌ Error: Debes proporcionar un número de teléfono');
  console.log('Uso: node scripts/delete-specific-user.js <phoneNumber>');
  console.log('Ejemplo: node scripts/delete-specific-user.js 5213334987878');
  process.exit(1);
}

async function deleteUserFromProduction(phoneNumber) {
  try {
    console.log(`🔍 Buscando usuario con número: ${phoneNumber}`);
    
    // Primero, obtener todos los usuarios para encontrar el ID
    const response = await fetch('https://subir-docs.vercel.app/api/all-users');
    
    if (!response.ok) {
      throw new Error(`Error obteniendo usuarios: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const users = data.users || [];
    
    console.log(`📋 Total de usuarios encontrados: ${users.length}`);
    
    // Buscar el usuario por número de teléfono
    const userToDelete = users.find(user => 
      user.phoneNumber === phoneNumber || 
      user.email === `${phoneNumber}@whatsapp.local`
    );
    
    if (!userToDelete) {
      console.log(`❌ Usuario con número ${phoneNumber} no encontrado`);
      console.log('Usuarios disponibles:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.phoneNumber || 'N/A'}) - ${user.type}`);
      });
      return;
    }
    
    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${userToDelete.id}`);
    console.log(`   Email: ${userToDelete.email}`);
    console.log(`   Nombre: ${userToDelete.name}`);
    console.log(`   Teléfono: ${userToDelete.phoneNumber}`);
    console.log(`   Tipo: ${userToDelete.type}`);
    
    if (userToDelete.type !== 'auto-created') {
      console.log(`❌ Error: Solo se pueden eliminar usuarios auto-creados`);
      return;
    }
    
    // Confirmar eliminación
    console.log(`\n⚠️  ¿Estás seguro de que quieres eliminar este usuario?`);
    console.log(`   Esto eliminará: ${userToDelete.email}`);
    
    // En un script automatizado, proceder directamente
    console.log(`\n🚀 Procediendo con la eliminación...`);
    
    // Eliminar el usuario
    const deleteResponse = await fetch(`https://subir-docs.vercel.app/api/delete-user?userId=${userToDelete.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`Error eliminando usuario: ${errorData.error || deleteResponse.statusText}`);
    }
    
    const deleteData = await deleteResponse.json();
    
    console.log(`✅ Usuario eliminado exitosamente:`);
    console.log(`   Mensaje: ${deleteData.message}`);
    
    if (deleteData.warning) {
      console.log(`   ⚠️  Advertencia: ${deleteData.warning}`);
    }
    
    console.log(`\n🎉 Proceso completado exitosamente`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar el script
deleteUserFromProduction(phoneNumber);
