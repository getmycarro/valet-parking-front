import type { ReactNode } from "react"

interface LoginPageLayoutProps {
  children: ReactNode
}

export function LoginPageLayout({ children }: LoginPageLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-noise)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,199,255,0.10) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>
        {/* Logo and title */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--grad-cta)",
                color: "#fff",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "28px", height: "28px" }}
              >
                <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14M7.5 9.5h9" />
              </svg>
            </span>
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: "var(--text-1)",
                letterSpacing: "-0.025em",
              }}
            >
              GetMy<span style={{ color: "var(--accent)" }}>Carro</span>
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--text-1)",
              margin: "0 0 0.5rem 0",
              letterSpacing: "-0.025em",
            }}
          >
            Iniciar Sesión
          </h1>
          <p style={{ color: "var(--text-2)", margin: 0, fontSize: "0.875rem" }}>
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Login form card */}
        <div
          className="glass-card"
          style={{
            padding: "2.5rem",
            borderRadius: "var(--r-xl)",
          }}
        >
          {children}
        </div>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "var(--text-2)",
            fontSize: "0.875rem",
            margin: "1.5rem 0 0 0",
          }}
        >
          ¿No tienes cuenta?{" "}
          <a
            href="/contact"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Contacta con ventas
          </a>
        </p>
      </div>
    </div>
  )
}
