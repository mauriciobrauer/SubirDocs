# Solución: Token de Dropbox Expirado en Producción

## 🔍 **Problema Identificado**

- ✅ **Localhost**: Dropbox funciona (puedes crear carpetas y subir archivos)
- ❌ **Producción**: Dropbox no funciona (token expirado)
- 🔑 **Causa**: Token de corta duración (`sl.u.`) que expira rápidamente

## 📊 **Diagnóstico Actual**

### **Token en Producción (Vercel):**
```json
{
  "success": false,
  "error": "Token inválido o expirado",
  "errorDetails": {
    "message": "Response failed with a 401 code",
    "status": 401,
    "errorType": "expired_access_token"
  },
  "tokenInfo": {
    "exists": true,
    "type": "string",
    "startsWithSlU": true,
    "startsWithSlB": false,
    "length": 1331,
    "firstChars": "sl.u.AGBFJvXM1MKNBtz...",
    "isShortLived": true,
    "isLongLived": false
  }
}
```

### **Problema:**
- 🔑 **Tipo de token**: `sl.u.` (corta duración)
- ⏰ **Duración**: ~4 horas
- ❌ **Estado**: Expirado
- 🔄 **Comportamiento**: Se expira automáticamente

## 🔧 **Solución: Generar Token de Larga Duración**

### **Paso 1: Ir a Dropbox App Console**
1. Ve a [https://www.dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Inicia sesión con tu cuenta de Dropbox
3. Selecciona tu aplicación existente

### **Paso 2: Generar Token de Larga Duración**
1. En tu aplicación, ve a la sección **"Permissions"**
2. Busca la sección **"Access tokens"**
3. Haz clic en **"Generate access token"**
4. Selecciona **"No expiration"** (sin expiración)
5. Copia el nuevo token (debería empezar con `sl.B.`)

### **Paso 3: Actualizar en Vercel**
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Busca `DROPBOX_ACCESS_TOKEN`
5. Actualiza el valor con el nuevo token de larga duración
6. Haz clic en **Save**

### **Paso 4: Redesplegar**
1. En Vercel Dashboard, ve a **Deployments**
2. Haz clic en **"Redeploy"** en el último deployment
3. O haz un nuevo commit y push para trigger automático

## 🧪 **Verificación**

### **Probar en Producción:**
```bash
# Verificar token
curl "https://subir-docs.vercel.app/api/test-dropbox-token"

# Probar creación de carpeta
curl "https://subir-docs.vercel.app/api/test-create-folder"

# Probar eliminación de carpeta
curl "https://subir-docs.vercel.app/api/test-dropbox-deletion?userEmail=test@example.com"
```

### **Resultado Esperado:**
```json
{
  "success": true,
  "message": "Token válido y funcional",
  "tokenInfo": {
    "exists": true,
    "startsWithSlB": true,
    "isLongLived": true
  }
}
```

## 🔄 **Diferencias entre Tipos de Token**

| Característica | `sl.u.` (Corta duración) | `sl.B.` (Larga duración) |
|---|---|---|
| **Duración** | ~4 horas | Sin expiración |
| **Uso recomendado** | Desarrollo/Testing | Producción |
| **Renovación** | Automática | Manual |
| **Seguridad** | Alta (expira rápido) | Media (no expira) |
| **Conveniencia** | Baja (requiere renovación) | Alta (no requiere renovación) |

## 🚨 **Importante**

### **Para Producción:**
- ✅ **Usar**: Token de larga duración (`sl.B.`)
- ❌ **Evitar**: Token de corta duración (`sl.u.`)

### **Para Desarrollo:**
- ✅ **Puedes usar**: Cualquiera de los dos
- ⚠️ **Recomendado**: Token de larga duración para evitar interrupciones

## 🔍 **Verificación Local**

Si quieres verificar tu token local:

```bash
# Verificar token local (reemplaza TOKEN_AQUI con tu token)
node scripts/check-dropbox-token.js TOKEN_AQUI
```

## 📝 **Notas Adicionales**

1. **Mismo token para ambos entornos**: No necesitas tokens diferentes para localhost y producción
2. **Variables de entorno**: El token se lee desde `process.env.DROPBOX_ACCESS_TOKEN`
3. **Seguridad**: Mantén el token seguro y no lo compartas
4. **Backup**: Guarda el token en un lugar seguro por si necesitas restaurarlo

## ✅ **Después de la Solución**

Una vez que actualices el token en Vercel:

1. ✅ **Producción funcionará**: Podrás crear carpetas y subir archivos
2. ✅ **Webhook funcionará**: Los PDFs de WhatsApp se subirán a Dropbox
3. ✅ **Eliminación funcionará**: Podrás eliminar carpetas de usuarios
4. ✅ **Sin interrupciones**: El token no expirará automáticamente

## 🆘 **Si Tienes Problemas**

1. **Verifica el formato**: El token debe empezar con `sl.B.`
2. **Verifica permisos**: Asegúrate de que la app tenga permisos de escritura
3. **Verifica red**: Asegúrate de que Vercel pueda acceder a la API de Dropbox
4. **Revisa logs**: Verifica los logs de Vercel para errores específicos
