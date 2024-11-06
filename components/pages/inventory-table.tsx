"use client"

import Link from "next/link"
import { AlertTriangle, ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface InventoryItem {
  sku: string
  description: string
  warehouse1: number
  warehouse2: number
  warehouse3: number
  warehouse4: number
  warehouse5: number
  total: number
  minStock: number
  maxStock: number
}

export default function Component() {
  const inventoryData: InventoryItem[] = [
    {
      sku: "4-KIT-NOVA BOR",
      description: "Caja para kit Nova Metálico",
      warehouse1: 740,
      warehouse2: 740,
      warehouse3: 740,
      warehouse4: 740,
      warehouse5: 740,
      total: 37000,
      minStock: 35000,
      maxStock: 40000,
    },
    {
      sku: "5-KIT-NOVA SIL",
      description: "Caja para kit Nova Silver",
      warehouse1: 500,
      warehouse2: 500,
      warehouse3: 500,
      warehouse4: 500,
      warehouse5: 500,
      total: 25000,
      minStock: 30000,
      maxStock: 50000,
    },
    {
      sku: "6-KIT-NOVA GOL",
      description: "Caja para kit Nova Gold",
      warehouse1: 1000,
      warehouse2: 1000,
      warehouse3: 1000,
      warehouse4: 1000,
      warehouse5: 1000,
      total: 50000,
      minStock: 40000,
      maxStock: 45000,
    },
  ]

  const checkStockStatus = (item: InventoryItem) => {
    if (item.total <= item.minStock) {
      return "min"
    }
    if (item.total >= item.maxStock) {
      return "max"
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              IV
            </div>
            <Link href="/inventario" className="text-lg font-semibold hover:underline">
              Ver inventario
            </Link>
          </div>
          <Button className="ml-auto" variant="default">
            Actualizar
          </Button>
        </div>
      </header>
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
                <TableHead>Descripción</TableHead>
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
              {inventoryData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.warehouse1.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.warehouse2.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.warehouse3.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.warehouse4.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.warehouse5.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{item.total.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {checkStockStatus(item) === "min" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Mínimo alcanzado
                      </Badge>
                    )}
                    {checkStockStatus(item) === "max" && (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
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
    </div>
  )
}