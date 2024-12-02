import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Producto } from "@/types/db";

interface StockCount {
  count: number;
}

interface RawProduct extends Omit<Producto, 'nombre' | 'createdAt' | 'updatedAt'> {
  inventory_data: string | null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  try {
    const countResult = db.prepare(`
      SELECT COUNT(*) as count FROM Producto
    `).get() as StockCount;

    const totalCount = countResult.count;

    const products = db.prepare(`
      SELECT 
        p.*,
        GROUP_CONCAT(i.cantidad || ',' || i.almacenId) as inventory_data
      FROM Producto p
      LEFT JOIN Inventario i ON p.id = i.productoId
      GROUP BY p.id
      LIMIT ? OFFSET ?
    `).all(limit, offset) as RawProduct[];

    const processedProducts = products.map(product => {
      const warehouseStocks: { [key: string]: number } = {};
      let total = 0;

      if (product.inventory_data) {
        const inventoryItems = product.inventory_data.split(',');
        for (let i = 0; i < inventoryItems.length; i += 2) {
          const cantidad = parseInt(inventoryItems[i]);
          const almacenId = parseInt(inventoryItems[i + 1]);
          warehouseStocks[`warehouse${almacenId}`] = cantidad;
          total += cantidad;
        }
      }

      return {
        ...product,
        ...warehouseStocks,
        total,
      };
    });

    return NextResponse.json({
      items: processedProducts,
      hasMore: offset + limit < totalCount,
      total: totalCount
    });

  } catch (error) {
    console.error('Error en /api/stock:', error);
    return NextResponse.json(
      { error: "Error al obtener el inventario" },
      { status: 500 }
    );
  }
} 