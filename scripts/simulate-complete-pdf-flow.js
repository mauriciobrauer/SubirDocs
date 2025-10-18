#!/usr/bin/env node

/**
 * Script para simular el flujo completo de PDF (usuario + carpeta)
 * Uso: node scripts/simulate-complete-pdf-flow.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987896';

async function simulateCompletePdfFlow(phoneNumber) {
  try {
    console.log(`🧪 === SIMULANDO FLUJO COMPLETO DE PDF ===`);
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
    
    // Paso 1: Limpiar entorno
    console.log(`\n🧹 PASO 1: Limpiando entorno...`);
    
    // Verificar si existe el usuario
    const existingUsersResponse = await fetch('http://localhost:3000/api/all-users');
    const existingUsersData = await existingUsersResponse.json();
    const existingUser = existingUsersData.users.find(user => user.phoneNumber === phoneNumber);
    
    if (existingUser) {
      console.log(`🗑️ Eliminando usuario existente: ${existingUser.email}`);
      const deleteResponse = await fetch(`http://localhost:3000/api/delete-user?userId=${existingUser.id}`, {
        method: 'DELETE'
      });
      if (deleteResponse.ok) {
        console.log(`✅ Usuario eliminado`);
      }
    }
    
    // Verificar si existe la carpeta
    const checkFolderResponse = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: `${phoneNumber}@whatsapp.local` })
    });
    const checkFolderData = await checkFolderResponse.json();
    
    if (checkFolderData.folderExists) {
      console.log(`🗑️ Eliminando carpeta existente...`);
      const deleteFolderResponse = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: `${phoneNumber}@whatsapp.local` })
      });
      if (deleteFolderResponse.ok) {
        console.log(`✅ Carpeta eliminada`);
      }
    }
    
    console.log(`✅ Entorno limpio`);
    
    // Paso 2: Crear usuario
    console.log(`\n📝 PASO 2: Creando usuario...`);
    const createUserResponse = await fetch('http://localhost:3000/api/simulate-user-creation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    
    const createUserData = await createUserResponse.json();
    
    if (!createUserData.success) {
      throw new Error(`Error creando usuario: ${createUserData.error}`);
    }
    
    console.log(`✅ Usuario creado: ${createUserData.user.email}`);
    console.log(`🆔 ID: ${createUserData.user.id}`);
    
    // Paso 3: Crear carpeta en Dropbox
    console.log(`\n📁 PASO 3: Creando carpeta en Dropbox...`);
    const folderName = `${phoneNumber}_at_whatsapp_local`;
    const createFolderResponse = await fetch('http://localhost:3000/api/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName })
    });
    
    const createFolderData = await createFolderResponse.json();
    
    if (!createFolderData.success) {
      throw new Error(`Error creando carpeta: ${createFolderData.error}`);
    }
    
    console.log(`✅ Carpeta creada: ${createFolderData.folderInfo.name}`);
    console.log(`📁 Ruta: ${createFolderData.folderInfo.path}`);
    
    // Paso 4: Verificar timestamp
    console.log(`\n📊 PASO 4: Verificando timestamp...`);
    const timestampResponse = await fetch('http://localhost:3000/api/user-created');
    const timestampData = await timestampResponse.json();
    console.log(`📊 Timestamp: ${timestampData.lastUserCreatedTimestamp}`);
    
    // Paso 5: Verificar que el usuario aparece en la lista
    console.log(`\n👥 PASO 5: Verificando que el usuario aparece en la lista...`);
    const usersResponse = await fetch('http://localhost:3000/api/all-users');
    const usersData = await usersResponse.json();
    const userInList = usersData.users.find(user => user.email === createUserData.user.email);
    
    if (userInList) {
      console.log(`✅ Usuario aparece en la lista: ${userInList.email}`);
    } else {
      console.log(`❌ Usuario NO aparece en la lista`);
    }
    
    // Paso 6: Verificar que la carpeta existe
    console.log(`\n📁 PASO 6: Verificando que la carpeta existe...`);
    const verifyFolderResponse = await fetch('http://localhost:3000/api/test-dropbox-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: createUserData.user.email })
    });
    const verifyFolderData = await verifyFolderResponse.json();
    
    if (verifyFolderData.folderExists) {
      console.log(`✅ Carpeta existe: ${verifyFolderData.folderInfo.fileCount} archivos`);
    } else {
      console.log(`❌ Carpeta NO existe`);
    }
    
    // Resultado final
    console.log(`\n📊 === RESULTADO FINAL ===`);
    const userCreated = createUserData.success;
    const folderCreated = createFolderData.success;
    const userInListCheck = !!userInList;
    const folderExists = verifyFolderData.folderExists;
    const timestampUpdated = timestampData.lastUserCreatedTimestamp > 0;
    
    console.log(`👤 Usuario creado: ${userCreated ? '✅' : '❌'}`);
    console.log(`📁 Carpeta creada: ${folderCreated ? '✅' : '❌'}`);
    console.log(`👥 Usuario en lista: ${userInListCheck ? '✅' : '❌'}`);
    console.log(`📁 Carpeta existe: ${folderExists ? '✅' : '❌'}`);
    console.log(`📊 Timestamp actualizado: ${timestampUpdated ? '✅' : '❌'}`);
    
    if (userCreated && folderCreated && userInListCheck && folderExists && timestampUpdated) {
      console.log(`\n🎉 ÉXITO: El flujo completo está listo para testing`);
      console.log(`💡 Ahora puedes probar:`);
      console.log(`   1. Auto-refresh en la UI (debería funcionar)`);
      console.log(`   2. Eliminación de usuario (debería eliminar carpeta)`);
    } else {
      console.log(`\n⚠️ PROBLEMA: Hay un problema en el flujo`);
    }
    
    return {
      success: userCreated && folderCreated && userInListCheck && folderExists && timestampUpdated,
      userCreated,
      folderCreated,
      userInListCheck,
      folderExists,
      timestampUpdated,
      userEmail: createUserData.user.email,
      userId: createUserData.user.id
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
simulateCompletePdfFlow(phoneNumber);
