"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StockLimitsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (minStock: number, maxStock: number) => void
}

export default function Component({
  open,
  onOpenChange,
  onConfirm,
}: StockLimitsModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const minStock = Number(formData.get("minStock"))
    const maxStock = Number(formData.get("maxStock"))
    onConfirm(minStock, maxStock)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">4-KIT-NOVA BOR</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Caja para kit Nova Metálico</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock">Mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                placeholder="Mínimo"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStock">Máximo</Label>
              <Input
                id="maxStock"
                name="maxStock"
                type="number"
                placeholder="Máximo"
                className="h-12"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12">
            Confirmar montos
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}