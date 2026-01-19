"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"

interface LoginFormProps {
  userType: "encargado" | "admin"
}

export function LoginForm({ userType }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
   const router = useRouter()
   const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const baseName =
      formData.email.trim() ||
      (userType === "admin" ? "Administrador" : "Encargado")

    login(baseName, userType)

    setIsLoading(false)

    if (userType === "encargado") {
      router.push("/encargado/dashboard")
    } else {
      router.push("/admin/dashboard")
    }
  }

  const buttonClass =
    userType === "admin"
      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
      : "bg-primary hover:bg-primary/90 text-primary-foreground"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="h-11 bg-card border-input focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="h-11 pr-10 bg-card border-input focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Recordarme
          </Label>
        </div>
        <button type="button" className="text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button type="submit" disabled={isLoading} className={`w-full h-11 ${buttonClass}`}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      {userType === "encargado" && (
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <button type="button" className="text-primary hover:underline">
            Contacta al administrador
          </button>
        </p>
      )}
    </form>
  )
}
