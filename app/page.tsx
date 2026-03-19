"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Car,
  Smartphone,
  Monitor,
  Building2,
  Barcode,
  Video,
  Printer,
  CreditCard,
  Zap,
  TrendingUp,
  ShieldCheck,
  Receipt,
  Plug,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Star,
  ArrowRight,
  PlayCircle,
  ChevronDown,
  Menu,
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ full, half = false }: { full: number; half?: boolean }) {
  return (
    <div className="flex gap-0.5 text-yellow-400 mb-4">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
      ))}
      {half && (
        <span className="relative inline-block h-4 w-4">
          <Star className="absolute h-4 w-4 stroke-yellow-400" />
          <span className="absolute left-0 top-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
          </span>
        </span>
      )}
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const products = [
  {
    icon: Smartphone,
    name: "getMyCarro Basic",
    description:
      "Aplicación móvil para pequeños estacionamientos. Gestión simple de entradas y salidas desde cualquier smartphone.",
    features: ["Hasta 50 espacios", "App iOS y Android", "Reportes básicos"],
    price: "$29",
    period: "/mes",
    featured: false,
    cta: "Ver más",
  },
  {
    icon: Monitor,
    name: "getMyCarro Pro",
    description:
      "Sistema completo para estacionamientos medianos. Incluye hardware de básculas, cámaras y panel administrativo web.",
    features: [
      "Hasta 500 espacios",
      "Lector de placas (LPR)",
      "Facturación electrónica",
      "Múltiples cajeros",
    ],
    price: "$99",
    period: "/mes",
    featured: true,
    cta: "Ver más",
  },
  {
    icon: Building2,
    name: "getMyCarro Enterprise",
    description:
      "Solución corporativa para múltiples sedes. Integración con sistemas ERP, business intelligence y API completa.",
    features: [
      "Espacios ilimitados",
      "Múltiples locaciones",
      "API y Webhooks",
      "Soporte dedicado 24/7",
    ],
    price: "Custom",
    period: "",
    featured: false,
    cta: "Contactar",
  },
]

const hardware = [
  { icon: Barcode, name: "Lector de Códigos", desc: "Escáner 2D para vales QR y tickets", price: "$199" },
  { icon: Video, name: "Cámara LPR", desc: "Reconocimiento automático de placas", price: "$599" },
  { icon: Printer, name: "Impresora Térmica", desc: "Tickets de alta velocidad 80mm", price: "$149" },
  { icon: CreditCard, name: "Terminal POS", desc: "Pago con tarjeta integrado", price: "$299" },
]

const plansData = {
  monthly: [
    {
      name: "Starter",
      sub: "Para iniciar",
      price: "$29",
      featured: false,
      included: ["1 usuario", "50 vehículos/día", "App móvil básica", "Soporte por email"],
      excluded: ["Reportes avanzados"],
      cta: "Comenzar",
    },
    {
      name: "Business",
      sub: "Para negocios en crecimiento",
      price: "$99",
      featured: true,
      included: [
        "5 usuarios",
        "Vehículos ilimitados",
        "Lector de placas (LPR)",
        "Facturación electrónica",
        "Soporte prioritario",
      ],
      excluded: [],
      cta: "Elegir Plan",
    },
    {
      name: "Enterprise",
      sub: "Solución corporativa",
      price: "Custom",
      featured: false,
      included: [
        "Usuarios ilimitados",
        "Múltiples locaciones",
        "API completa",
        "Personalización total",
        "Gerente de cuenta",
      ],
      excluded: [],
      cta: "Contactar Ventas",
    },
  ],
  yearly: [
    {
      name: "Starter",
      sub: "Para iniciar",
      price: "$23",
      featured: false,
      included: ["1 usuario", "50 vehículos/día", "App móvil básica", "Soporte por email"],
      excluded: ["Reportes avanzados"],
      cta: "Comenzar",
    },
    {
      name: "Business",
      sub: "Para negocios en crecimiento",
      price: "$79",
      featured: true,
      included: [
        "5 usuarios",
        "Vehículos ilimitados",
        "Lector de placas (LPR)",
        "Facturación electrónica",
        "Soporte prioritario",
      ],
      excluded: [],
      cta: "Elegir Plan",
    },
    {
      name: "Enterprise",
      sub: "Solución corporativa",
      price: "Custom",
      featured: false,
      included: [
        "Usuarios ilimitados",
        "Múltiples locaciones",
        "API completa",
        "Personalización total",
        "Gerente de cuenta",
      ],
      excluded: [],
      cta: "Contactar Ventas",
    },
  ],
}

const featuresList = [
  { icon: Zap, title: "Entrada Rápida", desc: "Proceso de entrada en menos de 10 segundos con escaneo automático de placas." },
  { icon: TrendingUp, title: "Analytics en Tiempo Real", desc: "Dashboard con ocupación, ingresos y estadísticas de uso instantáneas." },
  { icon: Smartphone, title: "App Móvil", desc: "Gestiona tu estacionamiento desde cualquier lugar con nuestras apps nativas." },
  { icon: ShieldCheck, title: "Seguridad Avanzada", desc: "Encriptación de datos, backups automáticos y cumplimiento GDPR." },
  { icon: Receipt, title: "Múltiples Métodos de Pago", desc: "Efectivo, tarjeta de crédito, débito, wallets digitales y criptomonedas." },
  { icon: Plug, title: "Integraciones", desc: "Conecta con SAP, Oracle, Salesforce y más de 100 aplicaciones." },
]

const testimonials = [
  {
    stars: 5,
    half: false,
    quote: "Redujimos el tiempo de espera en un 60%. La implementación fue rápida y el soporte técnico es excelente.",
    initials: "MR",
    name: "Miguel Rodríguez",
    company: "Parking Centro, Madrid",
  },
  {
    stars: 5,
    half: false,
    quote: "La versión Enterprise nos permitió centralizar la gestión de nuestras 12 sedes. Increíble ROI en 3 meses.",
    initials: "AL",
    name: "Ana López",
    company: "Grupo Estacionamientos MX",
  },
  {
    stars: 4,
    half: true,
    quote: "Perfecto para nuestro hotel. La integración con nuestro PMS fue seamless. Muy recomendado.",
    initials: "JP",
    name: "Juan Pérez",
    company: "Hotel Plaza, Buenos Aires",
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const revealRefs = useRef<(HTMLElement | null)[]>([])

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active")
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Mensaje enviado", { description: "Nos pondremos en contacto contigo pronto." })
  }

  const plans = plansData[billing]

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans antialiased transition-colors duration-300">

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                <Car className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black gradient-text tracking-tight">getMyCarro</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
                  Enterprise Solutions
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {["#productos", "#precios", "#caracteristicas", "#contacto"].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {["Productos", "Precios", "Características", "Contacto"][i]}
                </a>
              ))}
              <ThemeToggle />
              <Link
                href="/login"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-sm"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Mobile button */}
            <button
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {["#productos", "#precios", "#caracteristicas", "#contacto"].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {["Productos", "Precios", "Características", "Contacto"][i]}
                </a>
              ))}
              <div className="flex items-center gap-3 px-3 pt-2">
                <ThemeToggle />
                <Link
                  href="/login"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-10 dark:opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 pointer-events-none" />

        {/* Floating blobs */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl animate-float-delayed" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="hero-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8"
            style={{ animationDelay: "0s" }}
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Nueva Versión 3.0 Disponible
          </div>

          <h1
            className="hero-slide-up text-5xl md:text-7xl font-black mb-6 leading-tight"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block text-slate-900 dark:text-white">Gestión Inteligente</span>
            <span className="block gradient-text mt-2">de Parking</span>
          </h1>

          <p
            className="hero-slide-up text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 font-light"
            style={{ animationDelay: "0.2s" }}
          >
            Sistemas profesionales de valet parking para empresas.
            Desde pequeños estacionamientos hasta complejos corporativos.
          </p>

          <div
            className="hero-slide-up flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#productos"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <span>Ver Productos</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/login"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3"
            >
              <PlayCircle className="h-5 w-5 text-blue-500" />
              <span>Acceder al Sistema</span>
            </Link>
          </div>

          {/* Stats */}
          <div
            className="hero-slide-up mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: "500+", label: "Clientes Activos" },
              { value: "2M+", label: "Vales Generados" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Soporte Técnico" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">{s.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-slate-400" />
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="productos" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={addReveal} className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Nuestros <span className="gradient-text">Productos</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Soluciones completas adaptadas a cualquier tamaño de operación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => (
              <div
                key={p.name}
                ref={addReveal}
                className={`feature-card reveal group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border transition-all duration-300 ${
                  p.featured
                    ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-4 relative"
                    : "border-slate-100 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-500/50"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Más Popular
                  </div>
                )}
                <div
                  className={`feature-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                    p.featured
                      ? "bg-blue-600"
                      : "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-600"
                  }`}
                >
                  <p.icon
                    className={`h-7 w-7 transition-colors ${
                      p.featured
                        ? "text-white"
                        : "text-blue-600 dark:text-blue-400 group-hover:text-white"
                    }`}
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{p.description}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="check-item flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {p.price}
                    <span className="text-sm text-slate-500 font-normal">{p.period}</span>
                  </span>
                  <Link
                    href="/login"
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-sm ${
                      p.featured
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HARDWARE ── */}
      <section className="py-24 bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={addReveal} className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Hardware <span className="gradient-text">Compatible</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Equipamiento profesional para completar tu sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardware.map((h) => (
              <div
                key={h.name}
                ref={addReveal}
                className="glass-card reveal rounded-2xl p-6 text-center group hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <h.icon className="h-14 w-14 text-slate-400" />
                </div>
                <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{h.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{h.desc}</p>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{h.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={addReveal} className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Planes y <span className="gradient-text">Precios</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Elige el plan que mejor se adapte a tu negocio
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-sm ${
                  billing === "monthly"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-sm ${
                  billing === "yearly"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Anual{" "}
                <span className="text-xs text-emerald-500 font-bold ml-1">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                ref={addReveal}
                className={`price-card reveal bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl relative ${
                  plan.featured
                    ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:scale-105 z-10"
                    : "border border-slate-200 dark:border-slate-700"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Recomendado
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{plan.sub}</p>
                </div>
                <div className="mb-6">
                  <span
                    className={`text-5xl font-black ${
                      plan.featured ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-slate-500 dark:text-slate-400 text-base">/mes</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.included.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.excluded.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-sm">
                      <X className="h-4 w-4 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full py-3 rounded-xl font-bold text-center transition-all duration-300 text-sm ${
                    plan.featured
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                      : plan.name === "Enterprise"
                      ? "border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
                      : "border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="caracteristicas" className="py-24 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={addReveal} className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Características <span className="gradient-text">Destacadas</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tu estacionamiento profesionalmente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresList.map((f) => (
              <div
                key={f.title}
                ref={addReveal}
                className="reveal feature-card bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="feature-icon w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                  <f.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{f.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={addReveal} className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                ref={addReveal}
                className="reveal bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700"
              >
                <Stars full={t.stars} half={t.half} />
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={addReveal}
            className="reveal bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
              ¿Listo para modernizar tu estacionamiento?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
              Accede ahora y comienza a gestionar tu servicio de valet de forma profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg"
              >
                Iniciar Sesión
              </Link>
              <a
                href="#contacto"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Hablar con Ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contacto" className="py-24 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div ref={addReveal} className="reveal">
              <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
                Contacta con <span className="gradient-text">nosotros</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                ¿Tienes preguntas? Nuestro equipo está listo para ayudarte a encontrar la
                solución perfecta para tu negocio.
              </p>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "ventas@getmycarro.com" },
                  { icon: Phone, label: "Teléfono", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Oficinas", value: "Madrid, España | Miami, USA" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div ref={addReveal} className="reveal bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Tu empresa"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Producto de interés
                  </label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-sm">
                    <option>getMyCarro Basic</option>
                    <option>getMyCarro Pro</option>
                    <option>getMyCarro Enterprise</option>
                    <option>Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="¿Cómo podemos ayudarte?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all resize-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-black gradient-text">getMyCarro</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm text-sm leading-relaxed">
                Soluciones tecnológicas avanzadas para la gestión inteligente de
                estacionamientos. Desde 2018 transformando la movilidad urbana.
              </p>
              <div className="flex space-x-3">
                {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Productos</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {["getMyCarro Basic", "getMyCarro Pro", "getMyCarro Enterprise", "Hardware"].map((item) => (
                  <li key={item}>
                    <a href="#productos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {["Sobre Nosotros", "Casos de Éxito", "Blog", "Trabaja con Nosotros"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} getMyCarro. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              {["Privacidad", "Términos", "Cookies"].map((item) => (
                <a key={item} href="#" className="hover:text-blue-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
