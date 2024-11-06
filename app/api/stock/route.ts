import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Producto, CreateInventarioDTO, UpdateInventarioDTO } from '@/types/db';

export async function GET() {
  try {
    // Obtener productos con su inventario agregado por almacén
    const inventory = db.prepare(`
      SELECT 
        p.*,
        SUM(CASE WHEN i.almacenId = 1 THEN i.cantidad ELSE 0 END) as warehouse1,
        SUM(CASE WHEN i.almacenId = 2 THEN i.cantidad ELSE 0 END) as warehouse2,
        SUM(CASE WHEN i.almacenId = 3 THEN i.cantidad ELSE 0 END) as warehouse3,
        SUM(CASE WHEN i.almacenId = 4 THEN i.cantidad ELSE 0 END) as warehouse4,
        SUM(CASE WHEN i.almacenId = 5 THEN i.cantidad ELSE 0 END) as warehouse5,
        SUM(i.cantidad) as total
      FROM Producto p
      LEFT JOIN Inventario i ON p.id = i.productoId
      GROUP BY p.id
    `).all();

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    return NextResponse.json(
      { error: 'Error al obtener inventario' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateInventarioDTO = await request.json();
    
    const result = db.transaction(() => {
      // Verificar límites de stock
      const producto = db.prepare('SELECT stockMinimo, stockMaximo FROM Producto WHERE id = ?')
        .get(body.productoId) as Pick<Producto, 'stockMinimo' | 'stockMaximo'>;
      
      if (!producto) throw new Error('Producto no encontrado');
      
      if (body.cantidad < producto.stockMinimo || body.cantidad > producto.stockMaximo) {
        throw new Error('Cantidad fuera de los límites permitidos');
      }

      return db.prepare(`
        INSERT INTO Inventario (productoId, almacenId, cantidad)
        VALUES (?, ?, ?)
      `).run(body.productoId, body.almacenId, body.cantidad);
    })();

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error al crear inventario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear inventario' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: UpdateInventarioDTO = await request.json();
    
    const result = db.transaction(() => {
      // Verificar límites de stock
      const producto = db.prepare('SELECT stockMinimo, stockMaximo FROM Producto WHERE id = ?')
        .get(body.productoId) as Pick<Producto, 'stockMinimo' | 'stockMaximo'>;
      
      if (!producto) throw new Error('Producto no encontrado');
      
      if (body.cantidad < producto.stockMinimo || body.cantidad > producto.stockMaximo) {
        throw new Error('Cantidad fuera de los límites permitidos');
      }

      return db.prepare(`
        UPDATE Inventario 
        SET cantidad = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE productoId = ? AND almacenId = ?
      `).run(body.cantidad, body.productoId, body.almacenId);
    })();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Registro de inventario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar inventario' },
      { status: 500 }
    );
  }
} 