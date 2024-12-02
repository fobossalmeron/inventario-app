"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Almacen } from "@/types/db";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  almacenes: Almacen[];
}

export function UploadModal({ open, onOpenChange, almacenes }: UploadModalProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [detectedAlmacen, setDetectedAlmacen] = useState<Almacen | null>(null);

  const detectAlmacen = async (file: File) => {
    try {
      const firstLine = await readFirstLine(file);
      const match = firstLine.match(/"Valuación de Inventarios","([^"]+)"/);
      
      if (!match) {
        throw new Error("Formato de archivo no válido");
      }

      const codigoAlmacen = match[1].trim();
      const almacen = almacenes.find(a => a.codigo === codigoAlmacen);

      if (!almacen) {
        throw new Error(
          `No se encontró el almacén con código ${codigoAlmacen}. ` +
          `Almacenes disponibles: ${almacenes.map(a => a.codigo).join(', ')}`
        );
      }

      setDetectedAlmacen(almacen);
      return almacen;
    } catch (error) {
      console.error("Error al detectar almacén:", error);
      throw error;
    }
  };

  const readFirstLine = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        resolve(firstLine);
      };
      reader.onerror = reject;
      reader.readAsText(file, 'latin1');
    });
  };

  const handleFile = async (file: File) => {
    if (file?.type !== "text/csv") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, sube únicamente archivos CSV.",
      });
      return;
    }

    try {
      await detectAlmacen(file);
      setFile(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el archivo",
      });
      setFile(null);
      setDetectedAlmacen(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleConfirm = async () => {
    if (!file || !detectedAlmacen) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, selecciona un archivo válido.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("almacenId", detectedAlmacen.id.toString());

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

      // Limpiar estado y cerrar modal
      setFile(null);
      setDetectedAlmacen(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Inventario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {detectedAlmacen && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Almacén detectado:</p>
              <p className="text-sm">{detectedAlmacen.codigo} - {detectedAlmacen.nombre}</p>
            </div>
          )}

          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
              ${dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}
              ${file ? "bg-muted/50" : ""}`}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="text-center">
              {file ? (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {file.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Arrastra y suelta tu .CSV aquí o haz click para seleccionarlo
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!file || !detectedAlmacen}
            className="w-full"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 