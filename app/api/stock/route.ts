import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Producto, Inventario } from "@/types/db";

interface ProductoWithInventarios extends Producto {
  inventarios: Inventario[];
}

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        inventarios: true
      }
    }) as ProductoWithInventarios[];

    // Transformar los datos al formato que espera la tabla
    const inventoryData = productos.map(producto => {
      // Inicializar todos los almacenes en 0
      const warehouseStocks: Record<string, number> = {
        warehouse1: 0,
        warehouse2: 0,
        warehouse3: 0,
        warehouse4: 0,
        warehouse5: 0
      };

      // Actualizar solo los almacenes que tienen inventario
      producto.inventarios.forEach(inv => {
        warehouseStocks[`warehouse${inv.almacenId}`] = inv.cantidad;
      });

      const total = Object.values(warehouseStocks).reduce((sum, cantidad) => sum + cantidad, 0);

      return {
        sku: producto.sku,
        description: producto.descripcion || "",
        ...warehouseStocks,
        total,
        minStock: producto.stockMinimo,
        maxStock: producto.stockMaximo,
      };
    });

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return NextResponse.json(
      { error: "Error al obtener el inventario" },
      { status: 500 }
    );
  }
} 