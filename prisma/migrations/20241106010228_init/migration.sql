-- CreateTable
CREATE TABLE "productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "stockMinimo" INTEGER NOT NULL,
    "stockMaximo" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "almacenes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "inventario" (
    "productoId" INTEGER NOT NULL,
    "almacenId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("productoId", "almacenId"),
    CONSTRAINT "inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventario_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "almacenes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
