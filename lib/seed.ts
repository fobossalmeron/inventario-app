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
          codigo TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
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

      // Preparar la sentencia para insertar almacenes
      const insertAlmacen = db.prepare(`
        INSERT INTO Almacen (codigo, nombre) 
        VALUES (@codigo, @nombre)
      `);

      // Insertar almacenes
      const almacenes = [
        { codigo: '0001-AGV', nombre: 'General para Venta' },
        { codigo: '0002-APROD', nombre: 'Producción' },
        { codigo: '0003-AMAQU', nombre: 'Maquila' },
        { codigo: '0004-APRES', nombre: 'Presoldado' },
        { codigo: '0005-ABCK', nombre: 'Bracket' },
        { codigo: '0006-AGUD', nombre: 'Guadalajara' },
        { codigo: '0007-AGOM', nombre: 'Gómez Farías' },
        { codigo: '0008-AMON', nombre: 'Monterrey' },
        { codigo: '0009-AEM', nombre: 'Empaque' },
        { codigo: '0010-ARM', nombre: 'Recepción de Mercancía' },
        { codigo: '0020-PRES', nombre: 'Préstamos' },

      ];
      
      for (const almacen of almacenes) {
        insertAlmacen.run(almacen);
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