"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function InventoryUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});

  const warehouses = ["Almacén #1", "Almacén #2", "Almacén #3", "Almacén #4", "Almacén #5"];

  const handleDrag = (e: React.DragEvent, warehouseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({ ...dragActive, [warehouseId]: true });
    } else if (e.type === "dragleave") {
      setDragActive({ ...dragActive, [warehouseId]: false });
    }
  };

  const handleDrop = async (e: React.DragEvent, warehouseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [warehouseId]: false });

    const file = e.dataTransfer.files?.[0];
    if (file?.type !== "text/csv") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, sube únicamente archivos CSV.",
      });
      return;
    }
    setFiles({ ...files, [warehouseId]: file });
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    warehouseId: string
  ) => {
    e.preventDefault();
    const file = e.target.files?.[0];

    if (file?.type !== "text/csv") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, sube únicamente archivos CSV.",
      });
      return;
    }
    setFiles({ ...files, [warehouseId]: file });
  };

  const handleConfirm = async (warehouseId: string) => {
    if (!files[warehouseId]) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, selecciona un archivo primero.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", files[warehouseId]!);
    formData.append("almacenId", (warehouses.indexOf(warehouseId) + 1).toString());

    try {
      const response = await fetch("/api/update-stock", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar el inventario");
      }

      toast({
        title: "Éxito",
        description: "Inventario actualizado correctamente",
      });

      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
      <main className="p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse} className="relative">
              <CardHeader>
                <CardTitle>{warehouse}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
                    ${
                      dragActive[warehouse]
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25"
                    }
                    ${files[warehouse] ? "bg-muted/50" : ""}`}
                  onDragEnter={(e) => handleDrag(e, warehouse)}
                  onDragLeave={(e) => handleDrag(e, warehouse)}
                  onDragOver={(e) => handleDrag(e, warehouse)}
                  onDrop={(e) => handleDrop(e, warehouse)}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleChange(e, warehouse)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <div className="text-center">
                    {files[warehouse] ? (
                      <p className="text-sm text-muted-foreground">
                        Archivo seleccionado: {files[warehouse]?.name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Arrastra y suelta tu .CSV aquí o haz click para
                        seleccionarlo
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleConfirm(warehouse)}
                  disabled={!files[warehouse]}
                >
                  Confirmar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
  );
}
