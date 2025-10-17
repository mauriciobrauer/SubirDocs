import { NextResponse } from 'next/server';

// Array para almacenar logs del servidor
let serverLogs: string[] = [];

// Interceptar console.log
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args: any[]) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  serverLogs.push(`[LOG] ${new Date().toISOString()}: ${message}`);
  originalConsoleLog(...args);
};

console.error = (...args: any[]) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  serverLogs.push(`[ERROR] ${new Date().toISOString()}: ${message}`);
  originalConsoleError(...args);
};

export async function GET() {
  // Retornar los últimos 50 logs
  const recentLogs = serverLogs.slice(-50);
  
  return NextResponse.json({
    success: true,
    logs: recentLogs,
    totalLogs: serverLogs.length
  });
}

export async function POST() {
  // Limpiar logs
  serverLogs = [];
  
  return NextResponse.json({
    success: true,
    message: 'Logs cleared'
  });
}
