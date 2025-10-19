import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOrSDT1Qx_qq5G7MRO0oio29jeI6UKU50",
  authDomain: "prueba-autenticacion-2d6a5.firebaseapp.com",
  projectId: "prueba-autenticacion-2d6a5",
  storageBucket: "prueba-autenticacion-2d6a5.firebasestorage.app",
  messagingSenderId: "985002591857",
  appId: "1:985002591857:web:909526f66a79d9a0e5fdd0"
};

// Función para inicializar Firebase Admin
function initializeFirebaseAdmin() {
  // Verificar si ya está inicializado
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // Para desarrollo local, usar credenciales de servicio si están disponibles
    // En producción, se usarían las credenciales de servicio desde variables de entorno
    let app;
    
    // Intentar usar credenciales de servicio desde archivo JSON o variables de entorno
    try {
      let serviceAccount;
      
      // Primero intentar desde archivo JSON
      try {
        serviceAccount = require('../firebase-service-account.json');
        console.log('✅ Usando credenciales de servicio desde archivo JSON');
      } catch (fileError) {
        // Si no hay archivo, intentar desde variables de entorno
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          console.log('✅ Usando credenciales de servicio desde variables de entorno');
        } else {
          throw new Error('No se encontraron credenciales de servicio');
        }
      }
      
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
      console.log('✅ Firebase Admin inicializado con credenciales de servicio');
    } catch (serviceAccountError) {
      console.log('⚠️ No se encontraron credenciales de servicio, usando configuración básica');
      console.log('⚠️ Para desarrollo completo, necesitas configurar credenciales de servicio');
      // Configuración básica sin credenciales (limitada)
      app = initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log('⚠️ Firebase Admin inicializado en modo limitado (sin credenciales de servicio)');
    }

    return app;
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error);
    throw error;
  }
}

// Inicializar Firebase Admin
const app = initializeFirebaseAdmin();
export const auth = getAuth(app);

// Exportar configuración para uso en el cliente
export { firebaseConfig };

export default app;
