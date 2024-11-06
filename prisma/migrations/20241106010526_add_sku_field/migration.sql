/*
  Warnings:

  - You are about to drop the column `nombre` on the `productos` table. All the data in the column will be lost.
  - Added the required column `sku` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "descripcion" TEXT,
    "stockMinimo" INTEGER NOT NULL,
    "stockMaximo" INTEGER NOT NULL
);
INSERT INTO "new_productos" ("descripcion", "id", "stockMaximo", "stockMinimo") SELECT "descripcion", "id", "stockMaximo", "stockMinimo" FROM "productos";
DROP TABLE "productos";
ALTER TABLE "new_productos" RENAME TO "productos";
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");
CREATE INDEX "productos_sku_idx" ON "productos"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
