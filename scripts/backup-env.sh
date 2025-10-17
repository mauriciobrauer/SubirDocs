#!/bin/bash

# Script de backup automático de .env.local
# Uso: ./scripts/backup-env.sh

ENV_FILE=".env.local"
BACKUP_DIR=".env-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/env_backup_$TIMESTAMP.env"

echo "🔄 Creando backup de variables de entorno..."

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Verificar si existe el archivo .env.local
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: No se encontró el archivo $ENV_FILE"
    exit 1
fi

# Crear backup
cp "$ENV_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup creado exitosamente: $BACKUP_FILE"
    
    # Mostrar información del backup
    echo "📊 Información del backup:"
    echo "   Archivo: $BACKUP_FILE"
    echo "   Tamaño: $(wc -c < "$BACKUP_FILE") bytes"
    echo "   Fecha: $(date)"
    
    # Limpiar backups antiguos (mantener solo los últimos 10)
    echo "🧹 Limpiando backups antiguos..."
    ls -t "$BACKUP_DIR"/env_backup_*.env | tail -n +11 | xargs -r rm
    echo "✅ Limpieza completada"
    
else
    echo "❌ Error: No se pudo crear el backup"
    exit 1
fi

echo "💡 Para restaurar un backup: cp $BACKUP_FILE $ENV_FILE"
