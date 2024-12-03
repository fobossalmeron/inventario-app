import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Producto } from "@/types/db";

interface StockItem extends Producto {
  total: number;
  inventory_data: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";

  const offset = (page - 1) * limit;

  try {
    const searchQuery = search 
      ? `WHERE (p.sku LIKE ? OR p.descripcion LIKE ?)` 
      : '';
    const searchParams = search 
      ? [`%${search}%`, `%${search}%`] 
      : [];

    const items = db.prepare(`
      SELECT 
        p.*,
        COALESCE(SUM(i.cantidad), 0) as total,
        GROUP_CONCAT(i.almacenId || ':' || COALESCE(i.cantidad, 0)) as inventory_data
      FROM Producto p
      LEFT JOIN Inventario i ON p.id = i.productoId
      ${searchQuery}
      GROUP BY p.id
      LIMIT ? OFFSET ?
    `).all([...searchParams, limit, offset]) as StockItem[];

    // Procesar los resultados para el formato esperado
    const processedItems = items.map(item => {
      const warehouseData = item.inventory_data
        ? item.inventory_data.split(',').reduce((acc: Record<string, number>, curr: string) => {
            const [warehouseId, quantity] = curr.split(':');
            acc[`warehouse${warehouseId}`] = parseInt(quantity);
            return acc;
          }, {})
        : {};

      return {
        ...item,
        ...warehouseData,
        inventory_data: undefined
      };
    });

    const hasMore = items.length === limit;

    return NextResponse.json({ items: processedItems, hasMore });
  } catch (err) {
    console.error('Error en /api/stock:', err);
    return NextResponse.json(
      { error: "Error al obtener el inventario" },
      { status: 500 }
    );
  }
} 