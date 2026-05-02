"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { ROLE_DEFAULT_REDIRECT } from "@/lib/constants"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const role = await login(formData.email.trim(), formData.password)
      const redirectPath = ROLE_DEFAULT_REDIRECT[role]
      router.push(redirectPath)
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Credenciales inválidas"
      setError(typeof message === "string" ? message : "Credenciales inválidas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="email" style={{ color: "var(--text-1)", fontSize: "0.875rem", fontWeight: 500 }}>
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--border-2)",
            background: "var(--bg-glass)",
            color: "var(--text-1)",
            fontSize: "0.875rem",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="password" style={{ color: "var(--text-1)", fontSize: "0.875rem", fontWeight: 500 }}>
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "0.75rem 2.5rem 0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--border-2)",
              background: "var(--bg-glass)",
              color: "var(--text-1)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--text-2)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
            style={{ accentColor: "var(--accent)" }}
          />
          <span style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Recordarme</span>
        </label>
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.875rem",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem", textAlign: "center", margin: 0 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary"
        style={{
          width: "100%",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.75rem",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          marginTop: "0.5rem",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  )
}
