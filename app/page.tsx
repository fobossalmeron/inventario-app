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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { StockLimitsModal } from "@/components/modal";
import { Producto } from "@/types/db";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";


interface InventoryItem extends Omit<Producto, 'id'> {
  id: number;
  warehouse1: number;
  warehouse2: number;
  warehouse3: number;
  warehouse4: number;
  warehouse5: number;
  total: number;
  almacenId?: number;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Producto | null>(null);

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
    if (item.stockMinimo != null && item.total <= item.stockMinimo) return "min";
    if (item.stockMaximo != null && item.total >= item.stockMaximo) return "max";
    return null;
  };

  const handleConfirm = async (stockMinimo: number, stockMaximo: number) => {
    if (!selectedItem) return;
    
    try {
      console.log('Enviando datos:', { id: selectedItem.id, stockMinimo, stockMaximo }); // Debug

      const response = await fetch("/api/update-stock-limits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedItem.id,
          stockMinimo: Number(stockMinimo),
          stockMaximo: Number(stockMaximo)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar límites");
      }

      await fetchInventory(); // Recargar datos
      toast({
        title: "Éxito",
        description: `Límites actualizados correctamente para: ${selectedItem.sku}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setSelectedItem(null);
    }
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
                    {item.descripcion}
                  </div>
                </TableCell>
                <TableCell className="text-right">{(item.warehouse1 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse2 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse3 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse4 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.warehouse5 || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">{(item.total || 0).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  {checkStockStatus(item) === "min" && (
                    <Badge variant="destructive" className="gap-2 p-2 pointer-events-none">
                      <AlertTriangle className="h-4 w-4" />
                      Mínimo alcanzado
                    </Badge>
                  )}
                  {checkStockStatus(item) === "max" && (
                    <Badge variant="warning" className="gap-2 p-2 pointer-events-none">
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
                      <DropdownMenuItem>
                        Min: {item.stockMinimo?.toLocaleString()}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Max: {item.stockMaximo?.toLocaleString()}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setSelectedItem(item)}>
                        <Button variant="default" className="w-full justify-start">
                          Fijar min/max
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <StockLimitsModal 
            item={selectedItem} 
            onConfirm={handleConfirm}
          />
        )}
      </Dialog>
    </main>
  );
}