import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, stockMinimo, stockMaximo, tiempoDeResurtido } = await req.json();

    // Validar que los valores existen
    if (id == null || stockMinimo == null || stockMaximo == null || tiempoDeResurtido == null) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Convertir a números y validar
    const minStock = Number(stockMinimo);
    const maxStock = Number(stockMaximo);
    const resurtidoDias = Number(tiempoDeResurtido);
    const productoId = Number(id);

    // Validar que son números válidos
    if (isNaN(minStock) || isNaN(maxStock) || isNaN(productoId) || isNaN(resurtidoDias)) {
      return NextResponse.json(
        { error: 'Los valores deben ser números válidos' },
        { status: 400 }
      );
    }

    // Validar que los valores son números positivos
    if (minStock < 0 || maxStock < 0 || resurtidoDias < 0) {
      return NextResponse.json(
        { error: 'Los valores deben ser números positivos' },
        { status: 400 }
      );
    }

    // Validar que el máximo es mayor que el mínimo
    if (maxStock <= minStock) {
      return NextResponse.json(
        { error: 'El stock máximo debe ser mayor que el mínimo' },
        { status: 400 }
      );
    }

    const result = db.transaction(() => {
      // Verificar que el producto existe
      const producto = db.prepare('SELECT id FROM Producto WHERE id = ?').get(productoId);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Actualizar los límites y el tiempo de resurtido
      return db.prepare(`
        UPDATE Producto 
        SET 
          stockMinimo = ?, 
          stockMaximo = ?, 
          tiempoDeResurtido = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING id, sku, nombre, descripcion, stockMinimo, stockMaximo, tiempoDeResurtido
      `).get(minStock, maxStock, resurtidoDias, productoId);
    })();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al actualizar límites:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar límites' },
      { status: 500 }
    );
  }
} 