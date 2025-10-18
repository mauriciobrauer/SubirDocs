#!/usr/bin/env node

/**
 * Script para probar el flujo completo de eliminación de usuarios
 * Uso: node scripts/test-user-deletion-flow.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987893';

async function testUserDeletionFlow(phoneNumber) {
  try {
    console.log(`🧪 === PROBANDO FLUJO COMPLETO DE ELIMINACIÓN DE USUARIOS ===`);
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
    
    // Paso 1: Crear usuario
    console.log(`\n📝 PASO 1: Creando usuario...`);
    const createResponse = await fetch('http://localhost:3000/api/simulate-user-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error(`Error creando usuario: ${createData.error}`);
    }
    
    console.log(`✅ Usuario creado: ${createData.user.email}`);
    console.log(`🆔 ID del usuario: ${createData.user.id}`);
    
    // Paso 2: Crear carpeta en Dropbox
    console.log(`\n📁 PASO 2: Creando carpeta en Dropbox...`);
    const folderName = `${phoneNumber}_at_whatsapp_local`;
    const folderResponse = await fetch('http://localhost:3000/api/create-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderName })
    });
    
    const folderData = await folderResponse.json();
    
    if (!folderData.success) {
      throw new Error(`Error creando carpeta: ${folderData.error}`);
    }
    
    console.log(`✅ Carpeta creada: ${folderData.folderInfo.name}`);
    console.log(`📁 Ruta: ${folderData.folderInfo.path}`);
    
    // Paso 3: Verificar que la carpeta existe
    console.log(`\n🔍 PASO 3: Verificando que la carpeta existe...`);
    const checkResponse = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail: createData.user.email })
    });
    
    const checkData = await checkResponse.json();
    
    if (checkData.folderExists) {
      console.log(`✅ Carpeta existe: ${checkData.folderInfo.fileCount} archivos`);
    } else {
      console.log(`❌ Carpeta no existe`);
      return;
    }
    
    // Paso 4: Eliminar usuario
    console.log(`\n🗑️ PASO 4: Eliminando usuario...`);
    const deleteResponse = await fetch(`http://localhost:3000/api/delete-user?userId=${createData.user.id}`, {
      method: 'DELETE'
    });
    
    const deleteData = await deleteResponse.json();
    
    if (!deleteData.success) {
      throw new Error(`Error eliminando usuario: ${deleteData.error}`);
    }
    
    console.log(`✅ Usuario eliminado: ${deleteData.message}`);
    
    if (deleteData.dropboxDeletion) {
      if (deleteData.dropboxDeletion.success) {
        console.log(`✅ Dropbox: ${deleteData.dropboxDeletion.message}`);
      } else {
        console.log(`❌ Dropbox: ${deleteData.dropboxDeletion.message}`);
      }
    }
    
    // Paso 5: Verificar que la carpeta se eliminó
    console.log(`\n🔍 PASO 5: Verificando que la carpeta se eliminó...`);
    const finalCheckResponse = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail: createData.user.email })
    });
    
    const finalCheckData = await finalCheckResponse.json();
    
    if (!finalCheckData.folderExists) {
      console.log(`✅ Carpeta eliminada correctamente`);
    } else {
      console.log(`❌ Carpeta NO se eliminó`);
    }
    
    // Resultado final
    console.log(`\n📊 === RESULTADO FINAL ===`);
    const userDeleted = deleteData.success;
    const dropboxSuccess = deleteData.dropboxDeletion?.success;
    const folderDeleted = !finalCheckData.folderExists;
    
    console.log(`👤 Usuario eliminado: ${userDeleted ? '✅' : '❌'}`);
    console.log(`📁 Dropbox reporta éxito: ${dropboxSuccess ? '✅' : '❌'}`);
    console.log(`🗑️ Carpeta realmente eliminada: ${folderDeleted ? '✅' : '❌'}`);
    
    if (userDeleted && dropboxSuccess && folderDeleted) {
      console.log(`\n🎉 ÉXITO: El flujo de eliminación funciona correctamente`);
    } else {
      console.log(`\n⚠️ PROBLEMA: Hay un problema en el flujo de eliminación`);
      
      if (!userDeleted) {
        console.log(`❌ El usuario no se eliminó`);
      }
      if (!dropboxSuccess) {
        console.log(`❌ Dropbox reporta error: ${deleteData.dropboxDeletion?.message}`);
      }
      if (!folderDeleted) {
        console.log(`❌ La carpeta no se eliminó realmente`);
      }
    }
    
    return {
      success: userDeleted && dropboxSuccess && folderDeleted,
      userDeleted,
      dropboxSuccess,
      folderDeleted,
      userEmail: createData.user.email,
      userId: createData.user.id
    };
    
  } catch (error) {
    console.error(`❌ Error en el test: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar el script
testUserDeletionFlow(phoneNumber);