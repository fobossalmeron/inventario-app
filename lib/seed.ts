import db from '@/lib/db';

async function main() {
  try {
    // Ejecutar todo en una única transacción
    const transaction = db.transaction(() => {
      // Desactivar las restricciones de clave foránea temporalmente
      db.prepare('PRAGMA foreign_keys = OFF').run();

      // Eliminar tablas si existen para recrearlas
      db.prepare('DROP TABLE IF EXISTS "Inventario"').run();
      db.prepare('DROP TABLE IF EXISTS "Producto"').run();
      db.prepare('DROP TABLE IF EXISTS "Almacen"').run();

      // Crear tabla Producto con el nuevo campo tiempoDeResurtido
      db.prepare(`
        CREATE TABLE Producto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          stockMinimo INTEGER NOT NULL DEFAULT 0,
          stockMaximo INTEGER NOT NULL DEFAULT 0,
          tiempoDeResurtido INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Crear tabla Almacen
      db.prepare(`
        CREATE TABLE Almacen (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT UNIQUE NOT NULL,
          ubicacion TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Crear tabla Inventario
      db.prepare(`
        CREATE TABLE Inventario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          productoId INTEGER NOT NULL,
          almacenId INTEGER NOT NULL,
          cantidad INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (productoId) REFERENCES Producto(id),
          FOREIGN KEY (almacenId) REFERENCES Almacen(id),
          UNIQUE(productoId, almacenId)
        )
      `).run();

      // Preparar las sentencias una sola vez fuera del loop
      const insertAlmacen = db.prepare(`
        INSERT INTO Almacen (nombre, ubicacion) 
        VALUES (@nombre, @ubicacion)
      `);

      const insertProducto = db.prepare(`
        INSERT INTO Producto (sku, nombre, descripcion, stockMinimo, stockMaximo, tiempoDeResurtido)
        VALUES (@sku, @nombre, @descripcion, @stockMinimo, @stockMaximo, @tiempoDeResurtido)
      `);

      const insertInventario = db.prepare(`
        INSERT INTO Inventario (productoId, almacenId, cantidad)
        VALUES (@productoId, @almacenId, @cantidad)
      `);

      // Insertar almacenes
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

      // Insertar productos con tiempoDeResurtido
      const productos = [
        { 
          sku: 'KIT90-079', 
          nombre: 'Kit X-Pression "R" CCO Smile System', 
          descripcion: 'Kit ortodóntico completo', 
          stockMinimo: 10, 
          stockMaximo: 100,
          tiempoDeResurtido: 15 // días
        },
        { 
          sku: 'KIT90-089', 
          nombre: 'Kit X-Pression "C" CCO Smile System c/secuencia metálica', 
          descripcion: 'Kit ortodóntico con secuencia metálica', 
          stockMinimo: 15, 
          stockMaximo: 150,
          tiempoDeResurtido: 20 // días
        },
        { 
          sku: '90-085-01', 
          nombre: 'Juego de brackets X-pression "C" CCO c/g.345 .022', 
          descripcion: 'Juego de brackets completo', 
          stockMinimo: 5, 
          stockMaximo: 50,
          tiempoDeResurtido: 10 // días
        }
      ];

      for (const producto of productos) {
        insertProducto.run(producto);
      }

      // Insertar inventario
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