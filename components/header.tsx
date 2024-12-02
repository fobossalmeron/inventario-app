"use client";

import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { useState, useEffect } from "react";
import { Almacen } from "@/types/db";
import { Suspense } from "react";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlmacenes() {
      try {
        const response = await fetch("/api/almacenes");
        if (!response.ok) throw new Error("Error al cargar almacenes");
        const data = await response.json();
        setAlmacenes(data);
      } catch (error) {
        console.error("Error al cargar almacenes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlmacenes();
  }, []);

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-20">
          <div className="h-8 w-auto text-[#3792e6] flex items-center justify-center font-medium text-xl">
            Inventario Borgatta
          </div>
        </div>
        <Button 
          variant="default" 
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          Actualizar inventario
        </Button>
      </div>
      <Suspense fallback={null}>
        <UploadModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          almacenes={almacenes}
        />
      </Suspense>
    </header>
  );
}