import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, stockMinimo, stockMaximo } = await req.json();

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        stockMinimo,
        stockMaximo,
      },
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al actualizar límites:", error);
    return NextResponse.json(
      { error: "Error al actualizar límites de stock" },
      { status: 500 }
    );
  }
} 