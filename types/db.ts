export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  stockMinimo: number;
  stockMaximo: number;
  tiempoDeResurtido: number;
  createdAt: string;
  updatedAt: string;
}

export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventario {
  id: number;
  productoId: number;
  almacenId: number;
  cantidad: number;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
  almacen?: Almacen;
}

export interface CreateInventarioDTO {
  productoId: number;
  almacenId: number;
  cantidad: number;
}

export interface UpdateInventarioDTO extends CreateInventarioDTO {
  id?: number;
} 