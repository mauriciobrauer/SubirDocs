#!/usr/bin/env node

/**
 * Script detallado para probar el auto-refresh de la UI
 * Uso: node scripts/test-auto-refresh-detailed.js <phoneNumber>
 */

const phoneNumber = process.argv[2] || '5213334987890';

async function testAutoRefreshDetailed(phoneNumber) {
  try {
    console.log(`🧪 === PROBANDO AUTO-REFRESH DETALLADO ===`);
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
    
    // Paso 4: Verificar timestamp inmediatamente
    console.log(`\n📊 PASO 4: Verificando timestamp inmediatamente...`);
    const immediateResponse = await fetch('http://localhost:3000/api/user-created');
    const immediateData = await immediateResponse.json();
    console.log(`📊 Timestamp inmediato: ${immediateData.lastUserCreatedTimestamp}`);
    
    // Paso 5: Esperar 3 segundos (tiempo de polling)
    console.log(`\n⏱️ PASO 5: Esperando 3 segundos (tiempo de polling)...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 6: Verificar timestamp después de esperar
    console.log(`\n📊 PASO 6: Verificando timestamp después de esperar...`);
    const afterWaitResponse = await fetch('http://localhost:3000/api/user-created');
    const afterWaitData = await afterWaitResponse.json();
    console.log(`📊 Timestamp después de esperar: ${afterWaitData.lastUserCreatedTimestamp}`);
    
    // Paso 7: Verificar que el usuario aparece en la lista
    console.log(`\n👥 PASO 7: Verificando que el usuario aparece en la lista...`);
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
    const timestampUpdated = immediateData.lastUserCreatedTimestamp > initialData.lastUserCreatedTimestamp;
    const userCountIncreased = finalUserCount > initialUserCount;
    const userInList = !!newUser;
    
    console.log(`📊 Timestamp actualizado: ${timestampUpdated ? '✅' : '❌'}`);
    console.log(`👥 Usuario en lista: ${userInList ? '✅' : '❌'}`);
    console.log(`📈 Contador aumentó: ${userCountIncreased ? '✅' : '❌'}`);
    
    if (timestampUpdated && userInList && userCountIncreased) {
      console.log(`\n🎉 ÉXITO: El auto-refresh debería funcionar correctamente`);
      console.log(`💡 La UI debería actualizarse automáticamente en 2 segundos`);
      console.log(`🔍 Revisa la consola del navegador para ver los logs de polling`);
    } else {
      console.log(`\n⚠️ PROBLEMA: Hay un problema con el auto-refresh`);
      console.log(`🔍 Revisa los logs del navegador para más detalles`);
    }
    
    // Información adicional para debugging
    console.log(`\n🔍 === INFORMACIÓN PARA DEBUGGING ===`);
    console.log(`📊 Timestamp inicial: ${initialData.lastUserCreatedTimestamp}`);
    console.log(`📊 Timestamp inmediato: ${immediateData.lastUserCreatedTimestamp}`);
    console.log(`📊 Timestamp después de esperar: ${afterWaitData.lastUserCreatedTimestamp}`);
    console.log(`👥 Usuarios iniciales: ${initialUserCount}`);
    console.log(`👥 Usuarios finales: ${finalUserCount}`);
    console.log(`📧 Email del usuario: ${createData.user.email}`);
    
    return {
      success: true,
      timestampUpdated,
      userInList,
      userCountIncreased,
      initialTimestamp: initialData.lastUserCreatedTimestamp,
      immediateTimestamp: immediateData.lastUserCreatedTimestamp,
      finalTimestamp: afterWaitData.lastUserCreatedTimestamp,
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
testAutoRefreshDetailed(phoneNumber);
