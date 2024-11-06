import { PrismaClient } from '@prisma/client';
import { CreateProductoInput } from '@/types/db';

const prisma = new PrismaClient();

const INITIAL_DATA = [
  {
    sku: "KIT90-079",
    descripcion: "Kit X-Pression \"R\" CCO Smile System",
    stockMinimo: 10,
    stockMaximo: 100,
    stock: 23
  },
  {
    sku: "KIT90-089",
    descripcion: "Kit X-Pression \"C\" CCO Smile System c/secuencia metálica",
    stockMinimo: 10,
    stockMaximo: 100,
    stock: 45
  },
  {
    sku: "90-085-01",
    descripcion: "Juego de brackets X-pression \"C\" CCO c/g.345 .022",
    stockMinimo: 10,
    stockMaximo: 100,
    stock: 12
  },
  {
    sku: "90-069-01",
    descripcion: "X-pression R Roth Mini",
    stockMinimo: 10,
    stockMaximo: 100,
    stock: 34
  },
  {
    sku: "KIT-TUBOS SS",
    descripcion: "Kit de Tubos CCO Smile System",
    stockMinimo: 10,
    stockMaximo: 100,
    stock: 7
  }
];

async function main() {
  // Limpiar la base de datos
  await prisma.inventario.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.almacen.deleteMany();

  // Crear los 5 almacenes
  const almacenes = await Promise.all(
    Array.from({ length: 5 }, (_, i) => 
      prisma.almacen.create({
        data: {
          nombre: `Almacén #${i + 1}`
        }
      })
    )
  );

  // Insertar productos e inventario inicial solo en el primer almacén
  for (const item of INITIAL_DATA) {
    const productoInput: CreateProductoInput = {
      sku: item.sku,
      descripcion: item.descripcion,
      stockMinimo: item.stockMinimo,
      stockMaximo: item.stockMaximo
    };

    const producto = await prisma.producto.create({
      data: productoInput
    });

    await prisma.inventario.create({
      data: {
        productoId: producto.id,
        almacenId: almacenes[0].id,
        cantidad: item.stock
      }
    });
  }

  console.log('Base de datos inicializada con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 