import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const almacenes = db.prepare('SELECT * FROM Almacen ORDER BY id').all();
    return NextResponse.json(almacenes);
  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    return NextResponse.json(
      { error: 'Error al obtener almacenes' },
      { status: 500 }
    );
  }
} 