# Funcionalidad de Eliminación de Carpetas Dropbox

## 📋 Resumen

Se ha implementado la funcionalidad para eliminar automáticamente las carpetas de Dropbox cuando se elimina un usuario, tanto desde la UI como desde la API.

## 🔧 Funcionalidades Implementadas

### 1. Nuevas Funciones en DropboxAPI

#### `deleteUserFolder(userEmail: string): Promise<boolean>`
- Elimina una carpeta completa y todos sus archivos de Dropbox
- Primero elimina todos los archivos individualmente
- Luego elimina la carpeta vacía
- Manejo robusto de errores

#### `userFolderExists(userEmail: string): Promise<boolean>`
- Verifica si una carpeta de usuario existe en Dropbox
- Útil para validaciones antes de operaciones

#### `getUserFolderInfo(userEmail: string): Promise<object>`
- Obtiene información detallada de una carpeta
- Incluye: número de archivos, tamaño total, lista de archivos
- Útil para reportes y debugging

### 2. API de Eliminación de Usuarios Actualizada

#### `/api/delete-user` (Desarrollo y Producción)
- **Desarrollo**: Elimina usuario del archivo JSON + archivos locales + carpeta Dropbox
- **Producción**: Elimina usuario de memoria + carpeta Dropbox
- Retorna información detallada sobre la eliminación de Dropbox
- Manejo de errores independiente para cada operación

#### `/api/test-dropbox-deletion` (Nuevo)
- **GET**: Verifica el estado de una carpeta de Dropbox
- **POST**: Prueba la eliminación de una carpeta específica
- Útil para testing y debugging

### 3. Frontend Mejorado

#### LoginForm.tsx
- Muestra información detallada sobre la eliminación de Dropbox
- Indica si la carpeta se eliminó exitosamente o hubo errores
- Mensajes informativos para el usuario

## 📁 Estructura de Carpetas en Dropbox

```
/GuardaPDFDropbox/
├── maria_garcia_at_empresa_com/
├── carlos_rodriguez_at_empresa_com/
├── ana_martinez_at_empresa_com/
├── david_lopez_at_empresa_com/
└── 5213334987878_at_whatsapp_local/
```

**Formato de conversión de email a carpeta:**
- `@` → `_at_`
- `.` → `_`

## 🔄 Flujo de Eliminación

### 1. Usuario elimina desde UI
```
Usuario hace clic en "Eliminar" 
→ Frontend llama a /api/delete-user
→ API elimina usuario de memoria/archivo
→ API elimina carpeta de Dropbox
→ API retorna resultado detallado
→ Frontend muestra mensaje con estado de Dropbox
```

### 2. Eliminación programática
```
Script/API llama a /api/delete-user
→ Mismo flujo que eliminación desde UI
→ Retorna JSON con información completa
```

## 🧪 Testing

### Scripts de Prueba
- `scripts/test-dropbox-deletion.js` - Prueba local
- `scripts/delete-specific-user.js` - Eliminación específica

### Endpoints de Prueba
- `GET /api/test-dropbox-deletion?userEmail=...` - Verificar estado
- `POST /api/test-dropbox-deletion` - Probar eliminación

## 📊 Respuesta de la API

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente",
  "deletedUser": {
    "id": "user_123",
    "email": "usuario@ejemplo.com",
    "phoneNumber": "1234567890"
  },
  "dropboxDeletion": {
    "success": true,
    "message": "Carpeta de Dropbox eliminada exitosamente"
  },
  "warning": "En producción, los cambios no se persisten..."
}
```

## ⚠️ Consideraciones Importantes

### 1. Permisos de Dropbox
- La aplicación debe tener permisos de escritura y eliminación
- El token de acceso debe tener los permisos necesarios

### 2. Manejo de Errores
- Si falla la eliminación de Dropbox, el usuario se elimina igual
- Los errores se reportan en la respuesta de la API
- Logs detallados para debugging

### 3. Producción vs Desarrollo
- **Desarrollo**: Eliminación completa (archivo + local + Dropbox)
- **Producción**: Eliminación temporal (memoria + Dropbox)

### 4. Recuperación
- Los archivos eliminados de Dropbox NO se pueden recuperar fácilmente
- Considerar implementar papelera de reciclaje en el futuro

## 🚀 Uso

### Eliminar usuario desde UI
1. Ir a la lista de usuarios
2. Hacer clic en el botón de eliminar (🗑️)
3. Confirmar la eliminación
4. Ver el mensaje con el estado de Dropbox

### Eliminar usuario programáticamente
```bash
# Usar el script
node scripts/delete-specific-user.js 5213334987878

# O llamar directamente a la API
curl -X DELETE "https://subir-docs.vercel.app/api/delete-user?userId=user_123"
```

### Verificar estado de carpeta
```bash
# Verificar si existe
curl "https://subir-docs.vercel.app/api/test-dropbox-deletion?userEmail=usuario@ejemplo.com"

# Probar eliminación
curl -X POST "https://subir-docs.vercel.app/api/test-dropbox-deletion" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "usuario@ejemplo.com"}'
```

## 🔮 Mejoras Futuras

1. **Papelera de reciclaje**: Mover archivos a carpeta temporal antes de eliminar
2. **Backup automático**: Crear backup antes de eliminar
3. **Eliminación programada**: Eliminar después de X días
4. **Notificaciones**: Enviar email cuando se elimine un usuario
5. **Auditoría**: Log de todas las eliminaciones realizadas
