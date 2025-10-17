const { DropboxAPI } = require('../lib/dropbox-api');

async function createUserFolders() {
  const users = [
    'maria.garcia@empresa.com',
    'carlos.rodriguez@empresa.com', 
    'ana.martinez@empresa.com',
    'david.lopez@empresa.com'
  ];

  console.log('Creando carpetas para usuarios...');
  
  try {
    // Crear carpeta principal
    await DropboxAPI.createFolder('/GuardaPDFDropbox');
    console.log('✅ Carpeta principal /GuardaPDFDropbox creada');
    
    // Crear carpetas para cada usuario
    for (const userEmail of users) {
      const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
      await DropboxAPI.createFolder(userFolder);
      console.log(`✅ Carpeta creada: ${userFolder}`);
    }
    
    console.log('🎉 Todas las carpetas creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando carpetas:', error);
  }
}

createUserFolders();
