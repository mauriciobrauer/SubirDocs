# 🚀 Guía de Deploy en Vercel

Esta guía te ayudará a desplegar la aplicación **GuardarPDF Dropbox** en Vercel.

## 📋 Prerrequisitos

1. **Cuenta de Vercel**: [Crea una cuenta gratuita](https://vercel.com/signup)
2. **Cuenta de Dropbox**: Para obtener el token de acceso
3. **Repositorio en GitHub**: El código debe estar en GitHub

## 🔧 Configuración del Proyecto

### 1. Variables de Entorno

Configura las siguientes variables de entorno en Vercel:

#### En el Dashboard de Vercel:
1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```bash
# Variable requerida
DROPBOX_ACCESS_TOKEN=tu_token_completo_de_dropbox

# Variable opcional
NEXT_PUBLIC_APP_NAME=GuardarPDF Dropbox
```

### 2. Configuración del Token de Dropbox

1. Ve a [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Crea una nueva app o usa una existente
3. Genera un token de acceso
4. Copia el token completo (empieza con `sl.u.`)

## 🚀 Proceso de Deploy

### Opción 1: Deploy Automático desde GitHub

1. **Conecta tu repositorio**:
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en "New Project"
   - Importa tu repositorio de GitHub

2. **Configura el proyecto**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (por defecto)
   - Build Command: `npm run build` (automático)
   - Output Directory: `.next` (automático)

3. **Variables de entorno**:
   - Agrega `DROPBOX_ACCESS_TOKEN`
   - Agrega `NEXT_PUBLIC_APP_NAME`

4. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine el build

### Opción 2: Deploy Manual con Vercel CLI

1. **Instala Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔍 Verificación del Deploy

### 1. Funcionalidades a Verificar

- [ ] **Login**: Los 4 usuarios funcionan correctamente
- [ ] **Upload**: Se pueden subir archivos PDF/DOC
- [ ] **Lista de archivos**: Se muestran los archivos subidos
- [ ] **Enlaces compartidos**: Los enlaces de Dropbox funcionan
- [ ] **Carpetas por usuario**: Cada usuario tiene su carpeta

### 2. URLs de Prueba

- **Producción**: `https://tu-proyecto.vercel.app`
- **Preview**: `https://tu-proyecto-git-branch.vercel.app`

## 🛠️ Configuración Avanzada

### 1. Dominio Personalizado

1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

### 2. Configuración de Build

El archivo `vercel.json` ya está configurado con:
- Timeout extendido para uploads
- Headers de seguridad
- Optimizaciones de rendimiento

### 3. Monitoreo

- **Vercel Analytics**: Habilitado por defecto
- **Logs**: Disponibles en el dashboard
- **Métricas**: Performance y errores

## 🐛 Solución de Problemas

### Error: "DROPBOX_ACCESS_TOKEN is required"

**Solución**: Verifica que la variable de entorno esté configurada correctamente en Vercel.

### Error: "Failed to fetch files from Dropbox"

**Solución**: 
1. Verifica que el token sea válido
2. Revisa los permisos de la app de Dropbox
3. Confirma que la app tenga acceso a los archivos

### Error: "Build failed"

**Solución**:
1. Revisa los logs de build en Vercel
2. Verifica que todas las dependencias estén en `package.json`
3. Confirma que no hay errores de TypeScript

### Error: "Function timeout"

**Solución**:
1. El timeout está configurado en 30s para uploads
2. Para archivos grandes, considera usar chunked upload
3. Revisa la configuración en `vercel.json`

## 📊 Monitoreo Post-Deploy

### 1. Métricas Importantes

- **Uptime**: Disponibilidad del servicio
- **Response Time**: Tiempo de respuesta de las APIs
- **Error Rate**: Porcentaje de errores
- **Build Time**: Tiempo de build y deploy

### 2. Logs a Monitorear

- Errores de autenticación
- Fallos en upload de archivos
- Errores de API de Dropbox
- Problemas de rendimiento

## 🔄 Actualizaciones

### Deploy de Cambios

1. **Push a main**: Deploy automático
2. **Push a branch**: Deploy de preview
3. **Manual**: Usar Vercel CLI

### Rollback

1. Ve a Deployments en Vercel
2. Selecciona una versión anterior
3. Click en "Promote to Production"

## 📞 Soporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Dropbox API**: [dropbox.com/developers](https://www.dropbox.com/developers)
- **Issues**: Crea un issue en el repositorio de GitHub

---

¡Tu aplicación **GuardarPDF Dropbox** está lista para producción! 🎉
