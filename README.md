# GuardarPDF Dropbox

Una aplicación Next.js 15 con TypeScript que permite a los usuarios subir archivos PDF y DOC a Dropbox con un sistema de autenticación simulado.

## Características

- ✅ **Next.js 15** con App Router
- ✅ **TypeScript** para tipado estático
- ✅ **4 usuarios con login simplificado** (María, Carlos, Ana, David)
- ✅ **Integración con Dropbox** para subir archivos
- ✅ **Soporte para PDF y DOC** (.pdf, .doc, .docx)
- ✅ **Enlaces compartidos** de Dropbox
- ✅ **Interfaz moderna** con Tailwind CSS
- ✅ **Carpetas individuales por usuario** en Dropbox
- ✅ **Refresh automático** de lista de archivos
- ✅ **Deploy listo para Vercel** con configuración optimizada
- ✅ **Arquitectura preparada** para Firebase Auth y Storage

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd GuardarPDFDropbox
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp env.example .env.local
   ```
   
   Edita `.env.local` y agrega tu token de acceso de Dropbox:
   ```
   DROPBOX_ACCESS_TOKEN=tu_token_de_dropbox_aqui
   NEXT_PUBLIC_APP_NAME=GuardarPDF Dropbox
   ```

4. **Obtener token de Dropbox:**
   - Ve a [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Crea una nueva app
   - Genera un token de acceso
   - Copia el token a tu archivo `.env.local`

## Uso

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

3. **Usuarios disponibles:**
   - **María García:** maria.garcia@empresa.com
   - **Carlos Rodríguez:** carlos.rodriguez@empresa.com
   - **Ana Martínez:** ana.martinez@empresa.com
   - **David López:** david.lopez@empresa.com

## Funcionalidades

### Sistema de Autenticación
- Login simplificado con botones de acceso rápido
- Estado persistente en localStorage
- 4 usuarios predefinidos para pruebas
- Carpetas individuales en Dropbox por usuario

### Subida de Archivos
- Drag & drop para subir archivos
- Validación de tipos de archivo (PDF, DOC, DOCX)
- Validación de tamaño (máximo 10MB)
- Feedback visual durante la subida

### Gestión de Archivos
- Lista de archivos subidos por usuario
- Enlaces compartidos de Dropbox
- Información de archivo (tamaño, fecha)
- Botones para copiar enlaces y ver archivos
- Refresh automático después de subir archivos

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── upload/        # Endpoint para subir archivos
│   │   └── files/         # Endpoint para listar archivos
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── Dashboard.tsx      # Panel principal
│   ├── FileList.tsx       # Lista de archivos
│   ├── FileUpload.tsx     # Componente de subida
│   ├── Header.tsx         # Cabecera de la app
│   └── LoginForm.tsx      # Formulario de login
├── contexts/              # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticación
├── lib/                   # Utilidades y servicios
│   ├── auth.ts           # Servicio de autenticación
│   └── dropbox.ts        # Servicio de Dropbox
├── types/                 # Definiciones de TypeScript
│   └── index.ts          # Tipos principales
└── README.md             # Este archivo
```

## Migración a Firebase

La aplicación está estructurada para facilitar la migración a Firebase:

### Para Firebase Auth:
- Reemplazar `lib/auth.ts` con Firebase Auth
- Actualizar `contexts/AuthContext.tsx` para usar Firebase
- Mantener la misma interfaz de usuario

### Para Firebase Storage:
- Reemplazar `lib/dropbox.ts` con Firebase Storage
- Actualizar las API routes en `app/api/`
- Mantener la misma funcionalidad de subida y listado

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Dropbox API** - Almacenamiento en la nube
- **Lucide React** - Iconos
- **React Context** - Gestión de estado

## 🚀 Deploy en Vercel

La aplicación está configurada para deploy automático en Vercel:

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno**:
   - `DROPBOX_ACCESS_TOKEN`: Tu token de Dropbox
   - `NEXT_PUBLIC_APP_NAME`: Nombre de la app
3. **Deploy automático** en cada push a main

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter de código

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
