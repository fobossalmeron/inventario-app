import Database from 'better-sqlite3';
import path from 'path';

// Inicializar la conexión a la base de datos
const db = new Database(path.join(process.cwd(), 'data.db'), {
  verbose: console.log
});

// Crear las tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS Producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    stockMinimo INTEGER NOT NULL DEFAULT 0,
    stockMaximo INTEGER NOT NULL DEFAULT 0,
    tiempoDeResurtido INTEGER NOT NULL DEFAULT 7,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Almacen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    ubicacion TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productoId INTEGER NOT NULL,
    almacenId INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productoId) REFERENCES Producto(id),
    FOREIGN KEY (almacenId) REFERENCES Almacen(id),
    UNIQUE(productoId, almacenId)
  );
`);

export default db; 