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
import { Producto, Almacen } from "@/types/db";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "react-intersection-observer";


interface InventoryItem extends Omit<Producto, 'id'> {
  id: number;
  warehouse1: number;
  warehouse2: number;
  warehouse3: number;
  warehouse4: number;
  warehouse5: number;
  warehouse6: number;
  warehouse7: number;
  warehouse8: number;
  warehouse9: number;
  warehouse10: number;
  tiempoDeResurtido: number;
  total: number;
  almacenId?: number;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Producto | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const ITEMS_PER_PAGE = 50;

  async function fetchData(pageNum = 1, append = false) {
    try {
      setIsLoadingMore(append);
      setIsLoading(!append);

      const [inventoryResponse, almacenesResponse] = await Promise.all([
        fetch(`/api/stock?page=${pageNum}&limit=${ITEMS_PER_PAGE}`),
        !append ? fetch("/api/almacenes") : Promise.resolve(null)
      ]);

      if (!inventoryResponse.ok || (!append && !almacenesResponse?.ok)) {
        throw new Error("Error al cargar los datos");
      }

      const [inventoryData, almacenesData] = await Promise.all([
        inventoryResponse.json(),
        !append ? almacenesResponse?.json() : Promise.resolve(null)
      ]);

      setInventory(prev => append ? [...prev, ...inventoryData.items] : inventoryData.items);
      setHasMore(inventoryData.hasMore);
      if (!append && almacenesData) {
        setAlmacenes(almacenesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      setPage(prev => prev + 1);
      fetchData(page + 1, true);
    }
  }, [inView, hasMore, isLoadingMore]);

  const checkStockStatus = (item: InventoryItem) => {
    if (item.stockMinimo != null && item.total <= item.stockMinimo) return "min";
    if (item.stockMaximo != null && item.total >= item.stockMaximo) return "max";
    return null;
  };

  const handleConfirm = async (stockMinimo: number, stockMaximo: number, tiempoDeResurtido: number) => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch("/api/update-stock-limits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedItem.id,
          stockMinimo: Number(stockMinimo),
          stockMaximo: Number(stockMaximo),
          tiempoDeResurtido: Number(tiempoDeResurtido)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar límites");
      }

      await fetchData(); // Recargar datos
      toast({
        title: "Éxito",
        description: `Datos actualizados correctamente para: ${selectedItem.sku}`,
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

  if (isLoading) return (
    <div className="p-4 pt-20">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-2 w-64 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[shimmer_1s_ease-in-out_infinite] w-1/2" 
               style={{
                 animation: 'shimmer 1s ease-in-out infinite',
                 background: 'linear-gradient(to right, transparent 0%, #3B82F6 50%, transparent 100%)',
               }}
          />
        </div>
        <p className="text-sm text-gray-500">Cargando inventario...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <main className="p-4 md:p-6">
      <div className="rounded-md border max-h-[80vh] overflow-auto relative">
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
              {almacenes.map((almacen) => (
                <TableHead key={almacen.id} className="text-right whitespace-nowrap">
                  {almacen.codigo.replace(/^0+/, '')}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Alerta</TableHead>
              <TableHead className="text-right">Resurtido</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow 
                key={item.sku}
                className={item.sku.startsWith('GCP') ? 'bg-blue-50' : ''}
              >
                <TableCell className="font-medium whitespace-nowrap">{item.sku}</TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate hover:text-clip hover:whitespace-normal hover:overflow-visible">
                    {item.descripcion}
                  </div>
                </TableCell>
                {almacenes.map((almacen) => (
                  <TableCell key={almacen.id} className="text-right">
                    {(item[`warehouse${almacen.id}` as keyof typeof item] || 0).toLocaleString()}
                  </TableCell>
                ))}
                <TableCell className="text-right font-medium">{(item.total || 0).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  {checkStockStatus(item) === "min" && (
                    <Badge variant="destructive" className="gap-2 p-2 pointer-events-none whitespace-nowrap">
                      <AlertTriangle className="h-4 w-4" />
                      Mínimo alcanzado
                    </Badge>
                  )}
                  {checkStockStatus(item) === "max" && (
                    <Badge variant="warning" className="gap-2 p-2 pointer-events-none whitespace-nowrap">
                      <AlertTriangle className="h-4 w-4" />
                      Máximo alcanzado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{item.tiempoDeResurtido} días</TableCell>
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
                          Editar
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {hasMore && (
              <TableRow ref={ref}>
                <TableCell colSpan={8 + almacenes.length} className="text-center p-4">
                  {isLoadingMore ? (
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">
                        Cargando más productos...
                      </span>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            )}
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