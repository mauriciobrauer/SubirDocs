import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const debugLogFile = path.join(process.cwd(), 'webhook-debug-detailed.txt');
    const mainLogFile = path.join(process.cwd(), 'webhook-main-log.txt');
    
    let debugLogs = '';
    let mainLogs = '';
    
    // Leer logs detallados
    if (fs.existsSync(debugLogFile)) {
      debugLogs = fs.readFileSync(debugLogFile, 'utf-8');
    }
    
    // Leer logs principales
    if (fs.existsSync(mainLogFile)) {
      mainLogs = fs.readFileSync(mainLogFile, 'utf-8');
    }
    
    return NextResponse.json({
      debugLogs: debugLogs.split('\n').slice(-50), // Últimas 50 líneas
      mainLogs: mainLogs.split('\n').slice(-20), // Últimas 20 líneas
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error reading debug logs:', error);
    return NextResponse.json({ 
      error: 'Error reading logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
