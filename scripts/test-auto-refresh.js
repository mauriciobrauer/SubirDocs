#!/usr/bin/env node

/**
 * Script para probar el auto-refresh de la UI
 * Uso: node scripts/test-auto-refresh.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987887';

async function testAutoRefresh(phoneNumber) {
  try {
    console.log(`🧪 === PROBANDO AUTO-REFRESH DE UI ===`);
    console.log(`📱 Número de teléfono: ${phoneNumber}`);
    
    // Paso 1: Verificar timestamp inicial
    console.log(`\n📊 PASO 1: Verificando timestamp inicial...`);
    const initialResponse = await fetch('http://localhost:3000/api/user-created');
    const initialData = await initialResponse.json();
    console.log(`📊 Timestamp inicial: ${initialData.lastUserCreatedTimestamp}`);
    
    // Paso 2: Verificar usuarios actuales
    console.log(`\n👥 PASO 2: Verificando usuarios actuales...`);
    const usersResponse = await fetch('http://localhost:3000/api/all-users');
    const usersData = await usersResponse.json();
    const initialUserCount = usersData.users.filter(user => user.type === 'auto-created').length;
    console.log(`👥 Usuarios auto-creados iniciales: ${initialUserCount}`);
    
    // Paso 3: Crear nuevo usuario
    console.log(`\n📝 PASO 3: Creando nuevo usuario...`);
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
    
    // Paso 4: Verificar timestamp actualizado
    console.log(`\n📊 PASO 4: Verificando timestamp actualizado...`);
    const updatedResponse = await fetch('http://localhost:3000/api/user-created');
    const updatedData = await updatedResponse.json();
    console.log(`📊 Timestamp actualizado: ${updatedData.lastUserCreatedTimestamp}`);
    
    if (updatedData.lastUserCreatedTimestamp > initialData.lastUserCreatedTimestamp) {
      console.log(`✅ Timestamp se actualizó correctamente`);
    } else {
      console.log(`❌ Timestamp NO se actualizó`);
    }
    
    // Paso 5: Verificar que el usuario aparece en la lista
    console.log(`\n👥 PASO 5: Verificando que el usuario aparece en la lista...`);
    const finalUsersResponse = await fetch('http://localhost:3000/api/all-users');
    const finalUsersData = await finalUsersResponse.json();
    const finalUserCount = finalUsersData.users.filter(user => user.type === 'auto-created').length;
    console.log(`👥 Usuarios auto-creados finales: ${finalUserCount}`);
    
    const newUser = finalUsersData.users.find(user => user.email === createData.user.email);
    
    if (newUser) {
      console.log(`✅ Usuario aparece en la lista: ${newUser.email}`);
    } else {
      console.log(`❌ Usuario NO aparece en la lista`);
    }
    
    // Resultado final
    console.log(`\n📊 === RESULTADO FINAL ===`);
    const timestampUpdated = updatedData.lastUserCreatedTimestamp > initialData.lastUserCreatedTimestamp;
    const userCountIncreased = finalUserCount > initialUserCount;
    const userInList = !!newUser;
    
    console.log(`📊 Timestamp actualizado: ${timestampUpdated ? '✅' : '❌'}`);
    console.log(`👥 Usuario en lista: ${userInList ? '✅' : '❌'}`);
    console.log(`📈 Contador aumentó: ${userCountIncreased ? '✅' : '❌'}`);
    
    if (timestampUpdated && userInList && userCountIncreased) {
      console.log(`\n🎉 ÉXITO: El auto-refresh debería funcionar correctamente`);
      console.log(`💡 La UI debería actualizarse automáticamente en 2 segundos`);
    } else {
      console.log(`\n⚠️ PROBLEMA: Hay un problema con el auto-refresh`);
      console.log(`🔍 Revisa los logs del navegador para más detalles`);
    }
    
    return {
      success: true,
      timestampUpdated,
      userInList,
      userCountIncreased,
      initialTimestamp: initialData.lastUserCreatedTimestamp,
      finalTimestamp: updatedData.lastUserCreatedTimestamp,
      initialUserCount,
      finalUserCount
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
testAutoRefresh(phoneNumber);
