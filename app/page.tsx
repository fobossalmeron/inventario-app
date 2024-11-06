"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  sku: string;
  description: string;
  warehouse1: number;
  warehouse2: number;
  warehouse3: number;
  warehouse4: number;
  warehouse5: number;
  total: number;
  minStock: number;
  maxStock: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchInventory() {
    try {
      const response = await fetch("/api/stock");
      if (!response.ok) {
        throw new Error("Error al cargar el inventario");
      }
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const checkStockStatus = (item: InventoryItem) => {
    if (item.total <= item.minStock) return "min";
    if (item.total >= item.maxStock) return "max";
    return null;
  };

  if (isLoading) return <div className="p-4">Cargando inventario...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <main className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  SKU
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="truncate hover:text-clip hover:whitespace-normal">
                  Descripción
                </div>
              </TableHead>
              <TableHead className="text-right">Almacén #1</TableHead>
              <TableHead className="text-right">Almacén #2</TableHead>
              <TableHead className="text-right">Almacén #3</TableHead>
              <TableHead className="text-right">Almacén #4</TableHead>
              <TableHead className="text-right">Almacén #5</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Alerta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow 
                key={item.sku} 
                className={item.sku.startsWith('GCP') ? 'bg-blue-50' : ''}
              >
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate hover:text-clip hover:whitespace-normal hover:overflow-visible">
                    {item.description}
                  </div>
                </TableCell>
                <TableCell className="text-right">{(item.warehouse1 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse2 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse3 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse4 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse5 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">{item.total.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  {checkStockStatus(item) === "min" && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-5 w-5" />
                      Mínimo alcanzado
                    </Badge>
                  )}
                  {checkStockStatus(item) === "max" && (
                    <Badge variant="warning" className="gap-2 p-2">
                      <AlertTriangle className="h-4 w-4" />
                      Máximo alcanzado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>
                        Min: {item.minStock.toLocaleString()}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Max: {item.maxStock.toLocaleString()}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DialogTrigger asChild>
                        <DropdownMenuItem>Fijar min/max</DropdownMenuItem>
                      </DialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Establecer límites de stock</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="min" className="text-right">
                            Stock mínimo
                          </Label>
                          <Input
                            id="min"
                            type="number"
                            className="col-span-3"
                            placeholder="Ingrese el stock mínimo"
                            defaultValue={item.minStock}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="max" className="text-right">
                            Stock máximo
                          </Label>
                          <Input
                            id="max"
                            type="number"
                            className="col-span-3"
                            placeholder="Ingrese el stock máximo"
                            defaultValue={item.maxStock}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Guardar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}