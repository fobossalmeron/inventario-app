import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Almacen } from "@/types/db";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">;

async function parseCSV(csvData: string) {
  const rows = csvData
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [sku, descripcion, stock] = line.split(",").map(val => val.trim());
      return { sku, descripcion, stock };
    });
  return rows;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const almacenId = Number(formData.get('almacenId'));
    
    if (!file || !almacenId) {
      return new Response('Archivo y almacén son requeridos', { status: 400 });
    }

    // Verificar que el almacén existe y mostrar todos los almacenes para debug
    const almacenes = await prisma.almacen.findMany();
    console.log('Almacenes disponibles:', almacenes);

    const almacen = await prisma.almacen.findUnique({
      where: { id: almacenId }
    });

    if (!almacen) {
      return new Response(
        JSON.stringify({
          error: `El almacén ${almacenId} no existe. Almacenes disponibles: ${almacenes.map((a: Almacen) => `${a.id}: ${a.nombre}`).join(', ')}`
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const csvData = await file.text();
    const rows = await parseCSV(csvData);

    await prisma.$transaction(async (tx: TransactionClient) => {
      for (const row of rows) {
        console.log(`Procesando SKU: ${row.sku}`);
        
        // Primero buscar o crear el producto
        const producto = await tx.producto.upsert({
          where: { sku: row.sku },
          create: {
            sku: row.sku,
            descripcion: row.descripcion,
            stockMinimo: 0,
            stockMaximo: 999999
          },
          update: {}
        });

        console.log(`Producto creado/actualizado: ${producto.id}`);

        // Luego actualizar el inventario
        await tx.inventario.upsert({
          where: {
            productoId_almacenId: {
              productoId: producto.id,
              almacenId
            }
          },
          create: {
            productoId: producto.id,
            almacenId,
            cantidad: Number(row.stock)
          },
          update: {
            cantidad: Number(row.stock)
          }
        });

        console.log(`Inventario actualizado para producto ${producto.id} en almacén ${almacenId}`);
      }
    });

    return new Response('Stock actualizado correctamente', { status: 200 });
  } catch (error) {
    console.error('Error detallado:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Error al procesar el archivo', { status: 500 });
  }
} 