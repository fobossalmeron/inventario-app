import db from '@/lib/db';

async function main() {
  try {
    // Ejecutar todo en una única transacción
    const transaction = db.transaction(() => {
      // Desactivar las restricciones de clave foránea temporalmente
      db.prepare('PRAGMA foreign_keys = OFF').run();

      // Limpiar tablas en orden correcto (debido a las relaciones)
      db.prepare("DELETE FROM 'Inventario'").run();
      db.prepare("DELETE FROM 'Producto'").run();
      db.prepare("DELETE FROM 'Almacen'").run();
      
      // Reiniciar los contadores de autoincremento
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('Inventario', 'Producto', 'Almacen')").run();

      // Reactivar las restricciones de clave foránea
      db.prepare('PRAGMA foreign_keys = ON').run();

      // Preparar las sentencias una sola vez fuera del loop
      const insertAlmacen = db.prepare(`
        INSERT INTO Almacen (nombre, ubicacion) 
        VALUES (@nombre, @ubicacion)
      `);

      const insertProducto = db.prepare(`
        INSERT INTO Producto (sku, nombre, descripcion, stockMinimo, stockMaximo)
        VALUES (@sku, @nombre, @descripcion, @stockMinimo, @stockMaximo)
      `);

      const insertInventario = db.prepare(`
        INSERT INTO Inventario (productoId, almacenId, cantidad)
        VALUES (@productoId, @almacenId, @cantidad)
      `);

      // Insertar almacenes usando named parameters
      const almacenes = [
        { nombre: 'Almacén Central', ubicacion: 'CDMX' },
        { nombre: 'Almacén Norte', ubicacion: 'Monterrey' },
        { nombre: 'Almacén Sur', ubicacion: 'Mérida' },
        { nombre: 'Almacén Este', ubicacion: 'Veracruz' },
        { nombre: 'Almacén Oeste', ubicacion: 'Guadalajara' }
      ];
      
      for (const almacen of almacenes) {
        insertAlmacen.run(almacen);
      }

      // Insertar productos usando named parameters
      const productos = [
        { 
          sku: 'KIT90-079', 
          nombre: 'Kit X-Pression "R" CCO Smile System', 
          descripcion: 'Kit ortodóntico completo', 
          stockMinimo: 69, 
          stockMaximo: 100 
        },
        { 
          sku: 'KIT90-089', 
          nombre: 'Kit X-Pression "C" CCO Smile System c/secuencia metálica', 
          descripcion: 'Kit ortodóntico con secuencia metálica', 
          stockMinimo: 15, 
          stockMaximo: 120 
        },
        { 
          sku: '90-085-01', 
          nombre: 'Juego de brackets X-pression "C" CCO c/g.345 .022', 
          descripcion: 'Juego de brackets completo', 
          stockMinimo: 5, 
          stockMaximo: 50 
        }
      ];

      for (const producto of productos) {
        insertProducto.run(producto);
      }

      // Insertar inventario usando named parameters
      const inventarios = [
        { productoId: 1, almacenId: 1, cantidad: 23 },
        { productoId: 1, almacenId: 2, cantidad: 15 },
        { productoId: 1, almacenId: 3, cantidad: 10 },
        { productoId: 1, almacenId: 4, cantidad: 8 },
        { productoId: 1, almacenId: 5, cantidad: 12 },
        { productoId: 2, almacenId: 1, cantidad: 45 },
        { productoId: 2, almacenId: 2, cantidad: 25 },
        { productoId: 2, almacenId: 3, cantidad: 20 },
        { productoId: 2, almacenId: 4, cantidad: 15 },
        { productoId: 2, almacenId: 5, cantidad: 18 },
        { productoId: 3, almacenId: 1, cantidad: 12 },
        { productoId: 3, almacenId: 2, cantidad: 8 },
        { productoId: 3, almacenId: 3, cantidad: 6 },
        { productoId: 3, almacenId: 4, cantidad: 5 },
        { productoId: 3, almacenId: 5, cantidad: 7 }
      ];

      for (const inventario of inventarios) {
        insertInventario.run(inventario);
      }
    });

    // Ejecutar la transacción
    transaction();

    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
main().catch((error) => {
  console.error('❌ Error fatal durante el seed:', error);
  process.exit(1);
}); 