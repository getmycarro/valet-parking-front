import Link from "next/link"
import { Car, Shield, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo y título */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4">
          <Car className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Valet Parking</h1>
        <p className="text-muted-foreground mt-2 text-lg">Sistema de Gestión Inteligente</p>
      </div>

      {/* Tarjetas de selección de rol */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Tarjeta Encargado */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
          <Link href="/login/encargado" className="block">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <UserCog className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Encargado</CardTitle>
              <CardDescription className="text-muted-foreground">Gestión de vehículos y clientes</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Registrar vehículos</li>
                <li>• Escanear QR</li>
                <li>• Ver autos almacenados</li>
              </ul>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Ingresar como Encargado
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Tarjeta Administrador */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50 cursor-pointer">
          <Link href="/login/admin" className="block">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl text-foreground">Administrador</CardTitle>
              <CardDescription className="text-muted-foreground">Panel de control completo</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configurar pagos</li>
                <li>• Dashboard financiero</li>
                <li>• Gestión de empleados</li>
              </ul>
              <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                Ingresar como Admin
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>© 2026 Valet Parking System. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}
