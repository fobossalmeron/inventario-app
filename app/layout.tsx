import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link";
import { Button } from "@/components/ui/button";


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sistema de Inventario",
  description: "Sistema de gestión de inventario y almacenes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-background`}>
      <header className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-20">
          <Link href="/">
            <div className="h-8 w-auto rounded-full bg-slate-900 flex items-center justify-center text-primary-foreground font-medium text-lg px-3 hover:bg-white hover:text-black transition-colors">
              Inventario app
            </div>
          </Link>
          </div>
          <Link href="/actualizar-almacen">
            <Button className="ml-auto" variant="default">
              Actualizar almacén
            </Button>
          </Link>
        </div>
      </header>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
