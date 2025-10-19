import { auth } from './firebase';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  customClaims?: any;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}

// Función para crear un usuario en Firebase Auth
export async function createFirebaseUser(email: string, phoneNumber: string, displayName?: string) {
  try {
    console.log(`🔄 Creando usuario en Firebase: ${email}`);
    
    // Crear un UID corto y único
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Solo números
    const shortUID = cleanPhone.slice(-6); // Últimos 6 dígitos solamente
    
    const userRecord = await auth.createUser({
      uid: shortUID, // UID muy corto
      email: email,
      displayName: displayName || phoneNumber,
      // No incluir phoneNumber para evitar problemas de longitud
    });

    console.log(`✅ Usuario creado en Firebase: ${userRecord.uid}`);
    return userRecord;
  } catch (error: any) {
    console.error(`❌ Error creando usuario en Firebase: ${error.message}`);
    
    // Si el usuario ya existe, intentar obtenerlo
    if (error.code === 'auth/uid-already-exists') {
      console.log(`⚠️ Usuario ya existe, obteniendo usuario existente: ${phoneNumber}`);
      try {
        const existingUser = await auth.getUser(phoneNumber);
        console.log(`✅ Usuario existente obtenido: ${existingUser.uid}`);
        return existingUser;
      } catch (getError) {
        console.error(`❌ Error obteniendo usuario existente: ${getError}`);
        throw getError;
      }
    }
    
    throw error;
  }
}

// Función para obtener un usuario por UID (número de teléfono)
export async function getFirebaseUser(phoneNumber: string): Promise<FirebaseUser | null> {
  try {
    // Crear el UID de la misma manera que en createFirebaseUser
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const uid = cleanPhone.slice(-6);
    
    const userRecord = await auth.getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      }
    };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️ Usuario no encontrado: ${phoneNumber}`);
      return null;
    }
    console.error(`❌ Error obteniendo usuario de Firebase: ${error.message}`);
    throw error;
  }
}

// Función para obtener un usuario por email
export async function getFirebaseUserByEmail(email: string): Promise<FirebaseUser | null> {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      }
    };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️ Usuario no encontrado por email: ${email}`);
      return null;
    }
    console.error(`❌ Error obteniendo usuario por email de Firebase: ${error.message}`);
    throw error;
  }
}

// Función para listar todos los usuarios (con paginación)
export async function getAllFirebaseUsers(): Promise<FirebaseUser[]> {
  try {
    console.log('🔄 Obteniendo todos los usuarios de Firebase...');
    
    const users: FirebaseUser[] = [];
    let nextPageToken: string | undefined;

    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      listUsersResult.users.forEach(userRecord => {
        users.push({
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName,
          phoneNumber: userRecord.phoneNumber,
          customClaims: userRecord.customClaims,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          }
        });
      });

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`✅ Obtenidos ${users.length} usuarios de Firebase`);
    return users;
  } catch (error: any) {
    console.error(`❌ Error listando usuarios de Firebase: ${error.message}`);
    throw error;
  }
}

// Función para eliminar un usuario
export async function deleteFirebaseUser(uid: string): Promise<boolean> {
  try {
    console.log(`🔄 Eliminando usuario de Firebase: ${uid}`);
    
    await auth.deleteUser(uid);
    console.log(`✅ Usuario eliminado de Firebase: ${uid}`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️ Usuario no encontrado para eliminar: ${uid}`);
      return true; // Considerar como éxito si no existe
    }
    console.error(`❌ Error eliminando usuario de Firebase: ${error.message}`);
    return false;
  }
}

// Función para migrar usuarios simulados a Firebase
export async function migrateSimulatedUsersToFirebase() {
  try {
    console.log('🔄 Iniciando migración de usuarios simulados a Firebase...');
    
    const simulatedUsers = [
      {
        id: '1',
        email: 'maria.garcia@empresa.com',
        name: 'María García',
        phoneNumber: '5512345678'
      },
      {
        id: '2', 
        email: 'carlos.rodriguez@empresa.com',
        name: 'Carlos Rodríguez',
        phoneNumber: '5512345679'
      },
      {
        id: '3',
        email: 'ana.martinez@empresa.com', 
        name: 'Ana Martínez',
        phoneNumber: '5512345680'
      },
      {
        id: '4',
        email: 'david.lopez@empresa.com',
        name: 'David López', 
        phoneNumber: '5512345681'
      }
    ];

    const migratedUsers = [];

    for (const user of simulatedUsers) {
      try {
        // Crear UID único basado en el ID original
        const uid = `simulated_${user.id}`;
        
        const userRecord = await auth.createUser({
          uid: uid,
          email: user.email,
          displayName: user.name,
          phoneNumber: `+${user.phoneNumber}`,
        });

        migratedUsers.push(userRecord);
        console.log(`✅ Usuario migrado: ${user.name} (${user.email})`);
      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`⚠️ Usuario ya existe: ${user.name}`);
          const existingUser = await auth.getUser(`simulated_${user.id}`);
          migratedUsers.push(existingUser);
        } else {
          console.error(`❌ Error migrando usuario ${user.name}: ${error.message}`);
        }
      }
    }

    console.log(`✅ Migración completada: ${migratedUsers.length} usuarios procesados`);
    return migratedUsers;
  } catch (error: any) {
    console.error(`❌ Error en migración: ${error.message}`);
    throw error;
  }
}
