export interface Producto {
  id: number;
  sku: string;
  descripcion?: string | null;
  stockMinimo: number;
  stockMaximo: number;
  inventarios?: Inventario[];
}

export interface Almacen {
  id: number;
  nombre: string;
  inventarios?: Inventario[];
}

export interface Inventario {
  productoId: number;
  almacenId: number;
  cantidad: number;
  producto?: Producto;
  almacen?: Almacen;
}

// DTOs para crear nuevos registros
export interface CreateProductoInput {
  sku: string;
  descripcion?: string;
  stockMinimo: number;
  stockMaximo: number;
}

export interface CreateAlmacenInput {
  nombre: string;
}

export interface UpdateInventarioInput {
  productoId: number;
  almacenId: number;
  cantidad: number;
} 