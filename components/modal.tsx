"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Producto } from "@/types/db";

interface StockLimitsModalProps {
  item: Producto;
  onConfirm: (stockMinimo: number, stockMaximo: number) => void;
}

export function StockLimitsModal({ item, onConfirm }: StockLimitsModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const stockMinimo = Number(formData.get("stockMinimo"))
    const stockMaximo = Number(formData.get("stockMaximo"))
    onConfirm(stockMinimo, stockMaximo)
  }

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">{item.sku}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {item.descripcion}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockMinimo">Mínimo</Label>
            <Input
              id="stockMinimo"
              name="stockMinimo"
              type="number"
              placeholder="Stock mínimo"
              className="h-12"
              defaultValue={item.stockMinimo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockMaximo">Máximo</Label>
            <Input
              id="stockMaximo"
              name="stockMaximo"
              type="number"
              placeholder="Stock máximo"
              className="h-12"
              defaultValue={item.stockMaximo}
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12">
          Confirmar montos
        </Button>
      </form>
    </DialogContent>
  );
} 