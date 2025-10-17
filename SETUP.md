# Configuración Inicial

## 1. Instalar Dependencias

```bash
npm install
```

## 2. Configurar Dropbox

### Obtener Token de Acceso

1. Ve a [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Haz clic en "Create app"
3. Selecciona "Scoped access"
4. Selecciona "Full Dropbox" o "App folder"
5. Dale un nombre a tu app (ej: "GuardarPDF App")
6. Una vez creada, ve a la pestaña "Permissions"
7. Marca las siguientes opciones:
   - `files.metadata.write`
   - `files.metadata.read`
   - `files.content.write`
   - `files.content.read`
   - `sharing.write`
8. Ve a la pestaña "Settings"
9. En "OAuth 2" genera un "Generated access token"
10. Copia el token generado

### Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:
```bash
cp env.example .env.local
```

2. Edita `.env.local` y agrega tu token:
```
DROPBOX_ACCESS_TOKEN=tu_token_aqui
NEXT_PUBLIC_APP_NAME=GuardarPDF Dropbox
```

## 3. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 4. Credenciales de Prueba

- **Administrador:** admin@example.com / admin123
- **Usuario:** user@example.com / user123

## 5. Funcionalidades

- ✅ Login simulado con persistencia local
- ✅ Subida de archivos PDF y DOC (drag & drop)
- ✅ Validación de tipos y tamaños de archivo
- ✅ Lista de archivos con enlaces compartidos
- ✅ Interfaz moderna y responsiva
- ✅ Arquitectura preparada para Firebase

## 6. Estructura para Migración a Firebase

La aplicación está diseñada para facilitar la migración a Firebase:

### Auth Context
- `contexts/AuthContext.tsx` - Maneja el estado de autenticación
- `lib/auth.ts` - Servicio de autenticación (reemplazar con Firebase Auth)

### Storage Service
- `lib/dropbox.ts` - Servicio de Dropbox (reemplazar con Firebase Storage)
- `app/api/upload/route.ts` - API para subir archivos
- `app/api/files/route.ts` - API para listar archivos

### Componentes
- `components/LoginForm.tsx` - Formulario de login
- `components/FileUpload.tsx` - Componente de subida
- `components/FileList.tsx` - Lista de archivos
- `components/Dashboard.tsx` - Panel principal

## 7. Próximos Pasos

1. Configurar Firebase Project
2. Instalar Firebase SDK
3. Reemplazar servicios de autenticación y almacenamiento
4. Actualizar tipos TypeScript si es necesario
5. Probar funcionalidades

## 8. Troubleshooting

### Error: "DROPBOX_ACCESS_TOKEN is required"
- Verifica que el archivo `.env.local` existe
- Verifica que el token está correctamente configurado
- Reinicia el servidor de desarrollo

### Error al subir archivos
- Verifica que el token de Dropbox tiene los permisos correctos
- Verifica que la app de Dropbox está activa
- Revisa la consola del navegador para más detalles

### Error de CORS
- Asegúrate de que estás ejecutando la app en localhost:3000
- Verifica la configuración de Next.js
