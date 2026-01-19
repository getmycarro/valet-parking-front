import { LoginForm } from "@/components/login-form"
import { Car, Shield } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent flex-col justify-between p-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent-foreground hover:opacity-80 transition-opacity"
          >
            <Car className="w-8 h-8" />
            <span className="text-xl font-bold">Valet Parking</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-accent-foreground leading-tight">
            Panel de
            <br />
            Administración
          </h1>
          <p className="text-accent-foreground/80 text-lg max-w-md">
            Control total del sistema. Gestiona pagos, revisa el dashboard financiero y administra tu equipo de trabajo.
          </p>
          <div className="flex gap-4 text-accent-foreground/60 text-sm">
            <span>✓ Dashboard completo</span>
            <span>✓ Gestión de pagos</span>
            <span>✓ Reportes financieros</span>
          </div>
        </div>

        <p className="text-accent-foreground/50 text-sm">Acceso restringido solo para administradores</p>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-accent mb-4">
              <Car className="w-8 h-8" />
              <span className="text-xl font-bold">Valet Parking</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <Shield className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Acceso Administrador</h2>
            <p className="text-muted-foreground mt-1">Panel de control del sistema</p>
          </div>

          <LoginForm userType="admin" />

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
