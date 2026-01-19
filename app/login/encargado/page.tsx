import { LoginForm } from "@/components/login-form"
import { Car, UserCog } from "lucide-react"
import Link from "next/link"

export default function EncargadoLoginPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity"
          >
            <Car className="w-8 h-8" />
            <span className="text-xl font-bold">Valet Parking</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Portal del
            <br />
            Encargado
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Gestiona los vehículos de forma eficiente. Registra entradas, escanea códigos QR y mantén el control de
            todos los autos.
          </p>
          <div className="flex gap-4 text-primary-foreground/60 text-sm">
            <span>✓ Registro rápido</span>
            <span>✓ Escaneo QR</span>
            <span>✓ Dashboard en tiempo real</span>
          </div>
        </div>

        <p className="text-primary-foreground/50 text-sm">Sistema de gestión profesional de estacionamiento</p>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary mb-4">
              <Car className="w-8 h-8" />
              <span className="text-xl font-bold">Valet Parking</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <UserCog className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Iniciar Sesión</h2>
            <p className="text-muted-foreground mt-1">Accede al portal de encargado</p>
          </div>

          <LoginForm userType="encargado" />

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
