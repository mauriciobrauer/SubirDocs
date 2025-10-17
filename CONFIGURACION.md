# 🔧 Guía de Configuración de Variables de Entorno

## ⚠️ IMPORTANTE: Cómo Evitar Perder la Configuración

### 🛡️ Mejores Prácticas

1. **NUNCA edites directamente el archivo .env.local** sin hacer backup
2. **Siempre usa el template** como base
3. **Valida la configuración** antes de hacer cambios importantes
4. **Haz backups regulares** de tu configuración

### 📋 Comandos Útiles

```bash
# 1. Crear configuración desde template
npm run setup-env

# 2. Validar configuración actual
npm run validate-env

# 3. Hacer backup de configuración
npm run backup-env

# 4. Verificar configuración completa
npm run check-config
```

### 🔄 Flujo de Trabajo Recomendado

#### Para Configuración Inicial:
```bash
# 1. Crear archivo desde template
npm run setup-env

# 2. Editar .env.local con tus valores
nano .env.local  # o tu editor preferido

# 3. Validar configuración
npm run validate-env
```

#### Para Cambios en la Configuración:
```bash
# 1. Hacer backup de la configuración actual
npm run backup-env

# 2. Editar .env.local
nano .env.local

# 3. Validar cambios
npm run validate-env

# 4. Si algo sale mal, restaurar backup
cp .env-backups/env_backup_YYYYMMDD_HHMMSS.env .env.local
```

### 📁 Estructura de Archivos

```
├── .env.template          # Template con todas las variables
├── .env.local            # Tu configuración real (NO hacer commit)
├── .env-backups/         # Backups automáticos
│   ├── env_backup_20241017_143022.env
│   └── env_backup_20241017_150145.env
└── scripts/
    ├── validate-env.js   # Script de validación
    └── backup-env.sh     # Script de backup
```

### 🔑 Variables Requeridas

| Variable | Descripción | Dónde Obtenerla |
|----------|-------------|-----------------|
| `DROPBOX_ACCESS_TOKEN` | Token de acceso de Dropbox | [Dropbox App Console](https://www.dropbox.com/developers/apps) |
| `TWILIO_ACCOUNT_SID` | Account SID de Twilio | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Auth Token de Twilio | [Twilio Console](https://console.twilio.com) |
| `TWILIO_PHONE_NUMBER` | Número de WhatsApp Business | [Twilio Console](https://console.twilio.com) |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | Tu elección |

### 🚨 Solución de Problemas

#### Si pierdes tu configuración:
```bash
# 1. Verificar si hay backups
ls .env-backups/

# 2. Restaurar el backup más reciente
cp .env-backups/env_backup_$(ls -t .env-backups/ | head -1) .env.local

# 3. Validar configuración restaurada
npm run validate-env
```

#### Si no hay backups:
```bash
# 1. Crear nueva configuración desde template
npm run setup-env

# 2. Completar con tus valores reales
nano .env.local

# 3. Validar configuración
npm run validate-env
```

### 💡 Tips Adicionales

1. **Automatiza los backups**: Ejecuta `npm run backup-env` antes de hacer cambios importantes
2. **Valida antes de deploy**: Siempre ejecuta `npm run validate-env` antes de hacer deploy
3. **Mantén el template actualizado**: Si agregas nuevas variables, actualiza `.env.template`
4. **Documenta cambios**: Si cambias credenciales, documenta el motivo y fecha

### 🔒 Seguridad

- **NUNCA** hagas commit de `.env.local` al repositorio
- **NUNCA** compartas tus credenciales reales
- **SIEMPRE** usa el template para compartir la estructura
- **ROTA** tus tokens periódicamente por seguridad
