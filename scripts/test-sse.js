#!/usr/bin/env node

/**
 * Script para probar Server-Sent Events
 */

const EventSource = require('eventsource');

console.log('🔌 Conectando a SSE...');

const eventSource = new EventSource('http://localhost:3000/api/events');

eventSource.onopen = function(event) {
  console.log('✅ Conexión SSE abierta');
};

eventSource.onmessage = function(event) {
  console.log('📡 Mensaje SSE recibido:', event.data);
  try {
    const data = JSON.parse(event.data);
    console.log('📋 Datos parseados:', data);
  } catch (error) {
    console.error('❌ Error parseando datos:', error);
  }
};

eventSource.onerror = function(event) {
  console.error('❌ Error en SSE:', event);
};

// Mantener el script corriendo
console.log('⏳ Esperando eventos SSE... (presiona Ctrl+C para salir)');
