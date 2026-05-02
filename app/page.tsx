"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const recentVehicles = [
  { plate: "ABC-123", name: "Juan Pérez", status: "green", statusText: "Entregado" },
  { plate: "XYZ-789", name: "María López", status: "yellow", statusText: "Pagado" },
  { plate: "DEF-456", name: "Carlos Ruiz", status: "red", statusText: "Sin pago" },
  { plate: "GHI-012", name: "Ana Torres", status: "blue", statusText: "En revisión" },
];

const sectors = [
  { icon: "hotel", name: "Hoteles", desc: "Lujo y conveniencia" },
  { icon: "restaurant", name: "Restaurantes", desc: "Experiencia completa" },
  { icon: "hospital", name: "Hospitales", desc: "Emergencias ágiles" },
  { icon: "casino", name: "Casinos", desc: "Premium 24/7" },
  { icon: "shopping", name: "Centros Comerciales", desc: "Gran escala" },
  { icon: "airport", name: "Aeropuertos", desc: "Larga estancia" },
  { icon: "event", name: "Eventos", desc: "Temporadas altas" },
];

const chartHeights = [40, 65, 85, 72, 90, 60, 45, 55, 70, 80, 75, 50];

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HEADER */}
      <header id="siteHeader" className={scrolled ? "scrolled" : ""}>
        <div className="container nav-inner">
          <a href="#top" className="logo" aria-label="GetMyCarro">
            <span className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14M7.5 9.5h9" />
              </svg>
            </span>
            <span className="logo-text">GetMy<span>Carro</span></span>
          </a>

          <nav className="primary" aria-label="Principal">
            <a href="#b2c">App B2C</a>
            <a href="#b2b">Soluciones B2B</a>
            <a href="#flow">Cómo funciona</a>
            <a href="#benefits">Beneficios</a>
            <a href="#contact">Contacto</a>
          </nav>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Cambiar tema">
              <span className="knob">
                <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            </button>
            <a href="/login" className="btn btn-ghost">
               Iniciar sesión
             </a>
             <a href="#contact" className="btn btn-primary">
               Solicitar demo
               <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                 <path d="M5 12h14M13 5l7 7-7 7" />
               </svg>
             </a>
            <button className="menu-toggle" aria-label="Menú" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span></span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="container mt-4 pb-4">
            <nav className="flex flex-col gap-2">
              <a href="#b2c" className="p-2 rounded-lg hover:bg-accent/10">App B2C</a>
              <a href="#b2b" className="p-2 rounded-lg hover:bg-accent/10">Soluciones B2B</a>
              <a href="#flow" className="p-2 rounded-lg hover:bg-accent/10">Cómo funciona</a>
              <a href="#benefits" className="p-2 rounded-lg hover:bg-accent/10">Beneficios</a>
              <a href="#contact" className="p-2 rounded-lg hover:bg-accent/10">Contacto</a>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="hero-grid"></div>

        <div className="container hero-inner">
          <div className="hero-content reveal">
            <span className="eyebrow"><span className="dot"></span> Nueva era del valet parking · 2026</span>
            <h1>El valet parking,<br /><span className="accent">finalmente inteligente.</span></h1>
            <p>GetMyCarro conecta usuarios, negocios y operadores en una sola plataforma. Solicita tu carro desde la app, paga digitalmente y dale a tu negocio el control total de cada vehículo — en tiempo real.</p>

            <div className="hero-cta">
              <a href="#b2c" className="btn btn-primary">
                Ver solución B2C
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#b2b" className="btn btn-secondary">Explorar B2B</a>
            </div>

            <div className="hero-stats">
              <div>
                <div className="stat-num">−72%</div>
                <div className="stat-label">de tiempo<br />de espera</div>
              </div>
              <div>
                <div className="stat-num">4.9★</div>
                <div className="stat-label">satisfacción<br />de usuarios</div>
              </div>
              <div>
                <div className="stat-num">100%</div>
                <div className="stat-label">operación<br />digitalizada</div>
              </div>
            </div>
          </div>

          {/* PHONE MOCKUP */}
          <div className="hero-visual reveal">
            {/* Floating cards */}
            <div className="float-card fc-1">
              <div className="float-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <strong>12 vehículos</strong>
                <small>Activos ahora</small>
              </div>
            </div>
            <div className="float-card fc-2">
              <div className="float-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 8c-1.1 0-2 1.1-2 2.5S12 16 12 16s2-4.4 2-5.5S13.1 8 12 8z" />
                  <circle cx="12" cy="22" r="1" />
                </svg>
              </div>
              <div>
                <strong>Zona VIP</strong>
                <small>4 espacios libres</small>
              </div>
            </div>
            <div className="float-card fc-3">
              <div className="float-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <strong>3 solicitudes</strong>
                <small>En cola</small>
              </div>
            </div>
            <div className="float-card fc-4">
              <div className="float-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <strong>$1,240</strong>
                <small>Facturado hoy</small>
              </div>
            </div>

            {/* Phone */}
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="app-header">
                  <div>
                    <div className="app-greet">Buenos días</div>
                    <div className="app-name">Juan Pérez</div>
                  </div>
                  <div className="app-avatar">JP</div>
                </div>

                <div className="app-status-card">
                  <div className="app-label">Estado actual</div>
                  <h3>Tu carro viene en camino</h3>
                  <div className="app-progress">
                    <div className="app-progress-fill"></div>
                  </div>
                  <div className="app-eta">ETA: 3 minutos</div>
                </div>

                <div className="app-section-title">Acciones rápidas</div>
                <div className="app-action-row">
                  <div className="app-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14M7.5 9.5h9" />
                    </svg>
                    Solicitar
                  </div>
                  <div className="app-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Historial
                  </div>
                  <div className="app-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Pagos
                  </div>
                  <div className="app-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Ajustes
                  </div>
                </div>

                <div className="app-section-title">Actividad reciente</div>
                <div className="app-trip-card">
                  <div className="app-car-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                    </svg>
                  </div>
                  <div className="app-trip-info">
                    <strong>ABC-123</strong>
                    <small>Hoy, 14:30 • Entregado</small>
                  </div>
                  <span className="app-trip-tag">Listo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED-BY MARQUEE */}
      <section className="marquee-section">
        <div className="container">
          <div className="marquee-label">Tecnología confiada por</div>
          <div className="marquee">
            <div className="marquee-track">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div className="marquee-item" key={`m1-${i}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  Hotel Premium
                </div>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div className="marquee-item" key={`m2-${i}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  Hotel Premium
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VERTICAL SPLIT (B2C / B2B) */}
      <section className="section" id="b2c">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Dos lados, una misma plataforma</span>
            <h2>Diseñado para <span className="gradient-text">usuarios y negocios</span></h2>
            <p>Ya sea que estés estacionando tu auto o gestionando un valet parking completo, GetMyCarro tiene la solución.</p>
          </div>

          <div className="vertical-split reveal-stagger">
            {/* B2C Card */}
            <div className="vertical-card vc-b2c">
              <div className="vc-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                </svg>
                APP B2C
              </div>
              <h3>Para quienes estacionan</h3>
              <p>Solicita tu carro desde el celular, paga digitalmente y rastrea tu vehículo en tiempo real. Sin filas, sin estrés.</p>
              <div className="vc-feature-list">
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Solicitud en 1 clic
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Pagos digitales
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Tiempo real
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Historial completo
                </div>
              </div>
              <a href="#contact" className="vc-link">
                Conocer la App B2C
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* B2B Card */}
            <div className="vertical-card vc-b2b" id="b2b">
              <div className="vc-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                SOLUCIONES B2B
              </div>
              <h3>Para negocios y operadores</h3>
              <p>Control total de tu operación: empleados, facturación, reportes y visualización de ocupación en tiempo real.</p>
              <div className="vc-feature-list">
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Dashboard privado
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Gestión de valets
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Reportes avanzados
                </div>
                <div className="vc-feature">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Facturación
                </div>
              </div>
              <a href="#contact" className="vc-link">
                Explorar soluciones B2B
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID (B2C) */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Experiencia de usuario</span>
            <h2>App B2C: <span className="gradient-text">todo en tu bolsillo</span></h2>
            <p>Descubre cómo la app mejora la experiencia de estacionamiento con tecnología inteligente.</p>
          </div>

          <div className="feature-grid reveal-stagger">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                </svg>
              </div>
              <h4>Solicitud instantánea</h4>
              <p>Un toque y tu carro va en camino. Olvídate de hacer fila o esperar en recepción.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h4>Pagos integrados</h4>
              <p>Paga con Zelle, Binance, tarjeta o efectivo. Todo registrado digitalmente.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4>Mapa en vivo</h4>
              <p>Ve dónde está tu vehículo y cuánto tiempo falta para que llegue a la entrada.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4>Historial completo</h4>
              <p>Revisa todos tus estacionamientos, pagos y tiempos de espera.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h4>Notificaciones</h4>
              <p>Recibe alertas cuando tu carro esté listo o cuando haya novedades.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4>Multi-vehículo</h4>
              <p>Registra todos tus autos y elige cuál necesitas en cada momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* B2B MODELS */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Modelos de negocio</span>
            <h2>Soluciones <span className="gradient-text">flexibles para tu valet</span></h2>
            <p>Elige el modelo que mejor se adapte a tu operación. Escalable, modular y 100% digital.</p>
          </div>

          <div className="b2b-models reveal-stagger">
            <div className="model-card featured">
              <div className="model-num">Modelo 1</div>
              <h3>Valet Parking Completo</h3>
              <p>Tu negocio usa toda la plataforma: dashboard privado, app para valets, pagos digitales, reportes, facturación y gestión de empleados.</p>
              <div className="model-features">
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Dashboard privado completo
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  App para valets incluida
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Facturación automática
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Reportes y analítica
                </div>
              </div>
              <a href="#contact" className="btn btn-primary">Solicitar demo</a>
            </div>

            <div className="model-card">
              <div className="model-num">Modelo 2</div>
              <h3>Solo App B2C</h3>
              <p>Ofrecemos solo la app para tus usuarios. Los valets operan de forma tradicional, pero los clientes disfrutan de la experiencia digital.</p>
              <div className="model-features">
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  App B2C para usuarios
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Pagos digitales
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Notificaciones push
                </div>
                <div className="model-feature">
                  <span className="ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Historial para clientes
                </div>
              </div>
              <a href="#contact" className="btn btn-secondary">Más información</a>
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="section" id="flow">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Proceso simple</span>
            <h2><span className="gradient-text">Cómo funciona</span> GetMyCarro</h2>
            <p>De la llegada al retiro, todo el proceso es digital, rápido y transparente.</p>
          </div>

          <div className="flow reveal-stagger">
            <div className="flow-step">
              <div className="num">1</div>
              <h4>Registro</h4>
              <p>El valet registra el vehículo al llegar</p>
            </div>
            <div className="flow-step">
              <div className="num">2</div>
              <h4>Notificación</h4>
              <p>El usuario recibe confirmación en su app</p>
            </div>
            <div className="flow-step">
              <div className="num">3</div>
              <h4>Solicitud</h4>
              <p>El usuario pide su carro desde la app</p>
            </div>
            <div className="flow-step">
              <div className="num">4</div>
              <h4>Preparación</h4>
              <p>El valet prepara el vehículo</p>
            </div>
            <div className="flow-step">
              <div className="num">5</div>
              <h4>Pago</h4>
              <p>El usuario paga digitalmente</p>
            </div>
            <div className="flow-step">
              <div className="num">6</div>
              <h4>Entrega</h4>
              <p>El valet entrega el carro en la entrada</p>
            </div>
            <div className="flow-step">
              <div className="num">7</div>
              <h4>Finalización</h4>
              <p>Se cierra el registro y se genera el recibo</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="benefits">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Beneficios</span>
            <h2>Ventajas para <span className="gradient-text">todos los actores</span></h2>
            <p>GetMyCarro mejora la experiencia de usuarios, negocios y operadores por igual.</p>
          </div>

          <div className="benefits reveal-stagger">
            <div className="benefit-block users">
              <div className="b-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Para Usuarios</h3>
              <div className="b-sub">Experiencia premium sin filas</div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Menos tiempo de espera
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Pagos digitales seguros
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Rastreo en tiempo real
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Historial de estacionamientos
                </li>
              </ul>
            </div>

            <div className="benefit-block business">
              <div className="b-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3>Para Negocios</h3>
              <div className="b-sub">Control total de tu operación</div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Dashboard privado en tiempo real
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Facturación automática
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Gestión de empleados
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Reportes detallados
                </li>
              </ul>
            </div>

            <div className="benefit-block operators">
              <div className="b-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                </svg>
              </div>
              <h3>Para Operadores</h3>
              <div className="b-sub">Gestiona múltiples valets</div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  App dedicada para valets
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Control de asistencia
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Comisiones calculadas
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Soporte 24/7
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section className="dashboard-section">
        <div className="container reveal">
          <div className="section-head">
            <span className="eyebrow"><span className="dot"></span> Dashboard privado</span>
            <h2>Tu operación <span className="gradient-text">bajo control</span></h2>
            <p>Monitoriza vehículos, pagos, valets y ocupación en tiempo real desde cualquier dispositivo.</p>
          </div>

          <div className="dashboard-frame">
            <div className="dash-topbar">
              <div className="dash-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="dash-url">app.getmycarro.com/dashboard</div>
            </div>

            <div className="dash-body">
              <div className="dash-sidebar">
                <div className="dash-side-section">Principal</div>
                <a href="#" className="dash-side-link active">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </a>
                <a href="#" className="dash-side-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                  </svg>
                  Vehículos
                </a>
                <a href="#" className="dash-side-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Empleados
                </a>
                <a href="#" className="dash-side-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pagos
                </a>
                <div className="dash-side-section">Configuración</div>
                <a href="#" className="dash-side-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Ajustes
                </a>
              </div>

              <div className="dash-main">
                <div className="dash-header-row">
                  <div>
                    <h3>Dashboard</h3>
                    <div className="meta">Vista general de tu operación</div>
                  </div>
                  <div className="live-pill">
                    <span className="dot"></span>
                    En vivo
                  </div>
                </div>

                <div className="dash-kpis">
                  <div className="kpi">
                    <div className="kpi-label">
                      <span className="ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" />
                        </svg>
                      </span>
                      Vehículos activos
                    </div>
                    <div className="kpi-value">12</div>
                    <div className="kpi-trend">↓ 2 vs ayer</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">
                      <span className="ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </span>
                      Facturado hoy
                    </div>
                    <div className="kpi-value">$1,240</div>
                    <div className="kpi-trend">↑ 18% vs ayer</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">
                      <span className="ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </span>
                      Valets activos
                    </div>
                    <div className="kpi-value">5</div>
                    <div className="kpi-trend">Estable</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">
                      <span className="ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                      Tiempo promedio
                    </div>
                    <div className="kpi-value">8 min</div>
                    <div className="kpi-trend down">↓ 32% vs mes anterior</div>
                  </div>
                </div>

                <div className="dash-bottom">
                  <div className="dash-card">
                    <h4>Vehículos recientes</h4>
                    <div className="table-row head">
                      <div>Vehículo</div>
                      <div>Placa</div>
                      <div>Estado</div>
                      <div>Acción</div>
                    </div>
                    {recentVehicles.map((v, i) => (
                      <div className="table-row" key={i}>
                        <div className="car-cell">
                          <span className="plate">{v.plate}</span>
                          <span className="name">{v.name}</span>
                        </div>
                        <div>{v.plate}</div>
                        <div>
                          <span className={`badge ${v.status}`}>{v.statusText}</span>
                        </div>
                        <div>
                          <a href="#" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                            Ver
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dash-card">
                    <h4>Ocupación por hora</h4>
                    <div className="chart">
                      {chartHeights.map((h, i) => (
                        <div key={i} className={`chart-bar ${i % 2 === 0 ? "alt" : ""}`} style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      <span>8am</span>
                      <span>12pm</span>
                      <span>4pm</span>
                      <span>8pm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> Industrias</span>
            <h2>Ideal para <span className="gradient-text">todo tipo de negocio</span></h2>
            <p>Desde hoteles hasta restaurantes, GetMyCarro se adapta a tu industria.</p>
          </div>

          <div className="sectors reveal-stagger">
            {sectors.map((s, i) => (
              <div className="sector" key={i}>
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {s.icon === "hotel" && <path d="M3 21V7l9-4 9 4v14M8 21v-6h8v6M7 7v1M11 7v1M15 7v1" />}
                    {s.icon === "restaurant" && <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v1M21 15V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v10M21 15a2 2 0 0 1 0 4h-6a2 2 0 0 1 0-4" />}
                    {s.icon === "hospital" && <path d="M3 21V7l9-4 9 4v14M8 21v-6h8v6M7 7v1M11 7v1M15 7v1M7 11v1M11 11v1M15 11v1M7 15v1M11 15v1M15 15v1" />}
                    {s.icon === "casino" && <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />}
                    {s.icon === "shopping" && <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />}
                    {s.icon === "airport" && <path d="M17.8 19.2L16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L9 12l-7.8 3.8a2 2 0 0 1 .8 3l4.2-1.1 6.8 5.3a2 2 0 0 0 3-1.8z" />}
                    {s.icon === "event" && <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />}
                  </svg>
                </div>
                <strong>{s.name}</strong>
                <small>{s.desc}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-card reveal">
            <p className="testimonial-quote">
              "Desde que implementamos GetMyCarro, la satisfacción de nuestros huéspedes ha subido notablemente. Ya no hay filas en el valet y todo es transparente. Sin duda, la mejor inversión para nuestro hotel."
            </p>
            <div className="testimonial-author">
              <div className="ta-avatar">MR</div>
              <div>
                <div className="ta-name">María Rodríguez</div>
                <div className="ta-role">Gerente General, Hotel Premium</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final" id="contact">
        <div className="container">
          <div className="cta-card reveal">
            <div className="eyebrow"><span className="dot"></span> Comienza hoy</div>
            <h2>Transforma tu valet parking con GetMyCarro</h2>
            <p>Solicita una demo gratuita y descubre cómo nuestra plataforma puede llevar tu negocio al siguiente nivel.</p>
            <div className="cta-buttons">
              <a href="#" className="btn btn-primary">
                Solicitar demo gratuita
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#" className="btn btn-secondary">Habla con ventas</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-main">
            <div>
              <a href="#top" className="logo" aria-label="GetMyCarro">
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14M7.5 9.5h9" />
                  </svg>
                </span>
                <span className="logo-text">GetMy<span>Carro</span></span>
              </a>
              <p>La plataforma de valet parking más avanzada. Conectamos usuarios, negocios y operadores en una sola aplicación inteligente.</p>
            </div>
            <div className="foot-col">
              <h5>Producto</h5>
              <ul>
                <li><a href="#b2c">App B2C</a></li>
                <li><a href="#b2b">Soluciones B2B</a></li>
                <li><a href="#flow">Cómo funciona</a></li>
                <li><a href="#">Precios</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Empresa</h5>
              <ul>
                <li><a href="#">Sobre nosotros</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Carreras</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Legal</h5>
              <ul>
                <li><a href="#">Términos y condiciones</a></li>
                <li><a href="#">Política de privacidad</a></li>
                <li><a href="#">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 GetMyCarro. Todos los derechos reservados.</span>
            <div className="foot-social">
              <a href="#" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
