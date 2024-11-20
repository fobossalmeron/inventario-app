import { NextRequest } from "next/server";
import db from "@/lib/db";
import { Producto, Almacen } from "@/types/db";

async function parseCSV(csvData: string) {
  const lines = csvData.split("\n").filter(Boolean);
  
  // Detectar el formato del archivo basado en la primera línea
  const isValuacionFormat = lines[0].includes("Valuaci");
  
  if (isValuacionFormat) {
    // Procesar formato de valuación
    return lines
      .slice(2) // Saltar encabezados
      .filter(line => line.includes(",")) // Filtrar líneas válidas
      .map(line => {
        const columns = line.split(",");
        const sku = columns[0].replace(/"/g, '').trim();
        const descripcion = columns[1].replace(/"/g, '').trim();
        // El stock está en la columna 3 (índice 2) para algunos registros
        // y en la columna 4 (índice 3) para otros
        let stock = 0;
        if (columns[3] && columns[3].trim()) {
          stock = parseFloat(columns[3].replace(/"/g, '').trim());
        } else if (columns[2] && columns[2].trim()) {
          stock = parseFloat(columns[2].replace(/"/g, '').trim());
        }
        
        return {
          sku,
          descripcion,
          stock: isNaN(stock) ? 0 : Math.round(stock) // Redondeamos para manejar decimales
        };
      })
      .filter(row => {
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const esFechaOPagina = diasSemana.some(dia => row.sku.includes(dia)) || row.sku.includes('Página');
        
        return row.sku && 
               !row.sku.includes('Total') && 
               !row.sku.includes('Artículo') &&
               !row.sku.includes('Valuaci') &&
               !esFechaOPagina &&
               row.sku.trim() !== '';
      });
  }
  
  // Procesar formato original (almacen_random.csv)
  return lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [sku, descripcion, stock] = line.split(",").map(val => val.trim());
      return { 
        sku, 
        descripcion, 
        stock: parseInt(stock) || 0
      };
    })
    .filter(row => row.sku && !isNaN(row.stock));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const almacenId = Number(formData.get('almacenId'));
    
    if (!file || !almacenId) {
      return new Response('Archivo y almacén son requeridos', { status: 400 });
    }

    // Verificar que el almacén existe
    const almacen = db.prepare('SELECT * FROM Almacen WHERE id = ?').get(almacenId);
    
    if (!almacen) {
      const almacenes = db.prepare('SELECT id, nombre FROM Almacen').all() as Almacen[];
      return new Response(
        JSON.stringify({
          error: `El almacén ${almacenId} no existe. Almacenes disponibles: ${almacenes.map(a => `${a.id}: ${a.nombre}`).join(', ')}`
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const buffer = await file.arrayBuffer();
    const csvData = new TextDecoder('latin1').decode(buffer);
    
    const rows = await parseCSV(csvData);

    // Preparar statements fuera de la transacción
    const insertOrUpdateProducto = db.prepare(`
      INSERT INTO Producto (sku, nombre, descripcion, stockMinimo, stockMaximo)
      VALUES (@sku, @sku, @descripcion, 0, 999999)
      ON CONFLICT(sku) DO UPDATE SET
      descripcion = COALESCE(excluded.descripcion, descripcion)
      RETURNING id, sku, nombre, descripcion, stockMinimo, stockMaximo
    `);

    const updateInventario = db.prepare(`
      INSERT INTO Inventario (productoId, almacenId, cantidad)
      VALUES (@productoId, @almacenId, @cantidad)
      ON CONFLICT(productoId, almacenId) DO UPDATE SET
      cantidad = excluded.cantidad,
      updatedAt = CURRENT_TIMESTAMP
    `);

    const result = db.transaction(() => {
      let updatedProducts = 0;
      let updatedInventory = 0;

      for (const row of rows) {
        if (!row.sku) continue;

        // Insertar o actualizar producto
        const producto = insertOrUpdateProducto.get({
          sku: row.sku,
          descripcion: row.descripcion
        }) as Producto;

        // Actualizar inventario
        const inventarioResult = updateInventario.run({
          productoId: producto.id,
          almacenId: almacenId,
          cantidad: row.stock
        });

        if (inventarioResult.changes > 0) {
          updatedInventory++;
        }
        updatedProducts++;
      }

      return { updatedProducts, updatedInventory };
    })();

    return new Response(
      JSON.stringify({
        message: `Stock actualizado correctamente. Productos: ${result.updatedProducts}, Inventario: ${result.updatedInventory}`,
        success: true
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error detallado:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error al procesar el archivo',
        success: false
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 