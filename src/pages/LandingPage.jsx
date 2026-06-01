import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';

export default function LandingPage() {
  const { isDark, toggle } = useTheme();

  return (
    <>
      <header className="site">
        <div className="container nav-inner">
          <a href="#top" className="logo" aria-label="GetMyCarro">
            <span className="logo-mark" style={{ background: '#000', padding: 0 }}>
              <img src="/brand-mark.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', position: 'relative', zIndex: 1 }} />
            </span>
            <span className="logo-text">GetMy<span>Carro</span></span>
          </a>
          <nav className="primary" aria-label="Principal">
            <a href="#b2c">App B2C</a>
            <a href="#b2b">Soluciones B2B</a>
            <a href="#flow">Cómo funciona</a>
            <a href="#contact">Contacto</a>
          </nav>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggle} aria-label="Cambiar tema">
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
            <Link to="/admin" className="btn btn-ghost">Iniciar sesión</Link>
            <a href="#contact" className="btn btn-primary">
              Solicitar demo
              <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="hero-grid"></div>

        <div className="container hero-inner">
          <div className="hero-content">
            <span className="eyebrow"><span className="dot"></span> Nueva era del valet parking · 2026</span>
            <h1>El valet parking,<br /><span className="accent">finalmente inteligente.</span></h1>
            <p>GetMyCarro conecta usuarios, negocios y operadores en una sola plataforma. Solicita tu carro desde la app, paga digitalmente y dale a tu negocio el control total de cada vehículo — en tiempo real.</p>
            <div className="hero-cta">
              <Link to="/admin" className="btn btn-primary">
                Iniciar sesión
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <a href="#b2b" className="btn btn-secondary">Explorar B2B</a>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">−72%</div><div className="stat-label">de tiempo<br />de espera</div></div>
              <div><div className="stat-num">4.9★</div><div className="stat-label">satisfacción<br />de usuarios</div></div>
              <div><div className="stat-num">100%</div><div className="stat-label">operación<br />digitalizada</div></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="float-card fc-1">
              <div className="float-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
              <div><strong>12 vehículos</strong><small>Activos ahora</small></div>
            </div>
            <div className="float-card fc-2">
              <div className="float-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
              <div><strong>Zona VIP</strong><small>4 espacios libres</small></div>
            </div>
            <div className="float-card fc-3">
              <div className="float-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
              <div><strong>3 solicitudes</strong><small>En cola</small></div>
            </div>
            <div className="float-card fc-4">
              <div className="float-card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
              <div><strong>$1,240</strong><small>Facturado hoy</small></div>
            </div>

            <div className="phone">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="app-header">
                  <div><div className="app-greet">Buenos días</div><div className="app-name">Juan Pérez</div></div>
                  <div className="app-avatar">JP</div>
                </div>
                <div className="app-status-card">
                  <div className="app-label">Estado actual</div>
                  <h3>Tu carro viene en camino</h3>
                  <div className="app-progress"><div className="app-progress-fill"></div></div>
                  <div className="app-eta">ETA: 3 minutos</div>
                </div>
                <div className="app-section-title">Acciones rápidas</div>
                <div className="app-action-row">
                  <div className="app-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" /></svg>Solicitar</div>
                  <div className="app-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>Historial</div>
                  <div className="app-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>Pagos</div>
                  <div className="app-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /></svg>Ajustes</div>
                </div>
                <div className="app-section-title">Actividad reciente</div>
                <div className="app-trip-card">
                  <div className="app-car-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M5 17h14M7 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M14 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7M5 13h14" /></svg></div>
                  <div className="app-trip-info"><strong>ABC-123</strong><small>Hoy, 14:30 • Entregado</small></div>
                  <span className="app-trip-tag">Listo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="b2c">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot"></span> Dos lados, una misma plataforma</span>
            <h2>Diseñado para <span className="gradient-text">usuarios y negocios</span></h2>
            <p>Ya sea que estés estacionando tu auto o gestionando un valet completo, GetMyCarro tiene la solución.</p>
          </div>
          <div className="vertical-split">
            <div className="vertical-card vc-b2c">
              <div className="vc-tag">App B2C</div>
              <h3>Para quienes estacionan</h3>
              <p>Solicita tu carro desde el celular, paga digitalmente y rastrea tu vehículo en tiempo real. Sin filas, sin estrés.</p>
              <div className="vc-feature-list">
                {['Solicitud en 1 clic', 'Pagos digitales', 'Tiempo real', 'Historial completo'].map(f => (
                  <div className="vc-feature" key={f}>
                    <span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="vertical-card vc-b2b" id="b2b">
              <div className="vc-tag">Soluciones B2B</div>
              <h3>Para negocios y operadores</h3>
              <p>Control total de tu operación: empleados, facturación, reportes y visualización de ocupación en tiempo real.</p>
              <div className="vc-feature-list">
                {['Dashboard privado', 'Gestión de valets', 'Reportes avanzados', 'Facturación'].map(f => (
                  <div className="vc-feature" key={f}>
                    <span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/admin" className="vc-link">
                Acceder al panel B2B
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="flow">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot"></span> Proceso simple</span>
            <h2><span className="gradient-text">Cómo funciona</span> GetMyCarro</h2>
            <p>De la llegada al retiro, todo el proceso es digital, rápido y transparente.</p>
          </div>
          <div className="flow">
            {[
              { n: 1, t: 'Registro',     d: 'El valet registra el vehículo al llegar' },
              { n: 2, t: 'Notificación', d: 'El usuario recibe confirmación en su app' },
              { n: 3, t: 'Solicitud',    d: 'El usuario pide su carro desde la app' },
              { n: 4, t: 'Preparación',  d: 'El valet prepara el vehículo' },
              { n: 5, t: 'Pago',         d: 'El usuario paga digitalmente' },
              { n: 6, t: 'Entrega',      d: 'El valet entrega el carro en la entrada' },
              { n: 7, t: 'Finalización', d: 'Se cierra el registro y se genera el recibo' },
            ].map(s => (
              <div className="flow-step" key={s.n}>
                <div className="num">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-card">
            <p className="testimonial-quote">"Desde que implementamos GetMyCarro, la satisfacción de nuestros huéspedes ha subido notablemente. Ya no hay filas en el valet y todo es transparente. Sin duda, la mejor inversión para nuestro hotel."</p>
            <div className="testimonial-author">
              <div className="ta-avatar">MR</div>
              <div style={{ textAlign: 'left' }}>
                <div className="ta-name">María Rodríguez</div>
                <div className="ta-role">Gerente General, Hotel Premium</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final" id="contact">
        <div className="container">
          <div className="cta-card">
            <div className="eyebrow"><span className="dot"></span> Comienza hoy</div>
            <h2>Transforma tu valet parking con GetMyCarro</h2>
            <p>Solicita una demo gratuita y descubre cómo nuestra plataforma puede llevar tu negocio al siguiente nivel.</p>
            <div className="cta-buttons">
              <Link to="/admin" className="btn btn-primary">
                Acceder al panel
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <a href="#" className="btn btn-secondary">Hablar con ventas</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot-main">
            <div>
              <a href="#top" className="logo">
                <span className="logo-mark" style={{ background: '#000', padding: 0 }}>
                  <img src="/brand-mark.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', position: 'relative', zIndex: 1 }} />
                </span>
                <span className="logo-text">GetMy<span>Carro</span></span>
              </a>
              <p>El valet parking, finalmente inteligente. Una plataforma única que conecta usuarios, negocios y operadores.</p>
            </div>
            <div className="foot-col">
              <h5>Producto</h5>
              <ul>
                <li><a href="#b2c">App B2C</a></li>
                <li><a href="#b2b">Soluciones B2B</a></li>
                <li><a href="#flow">Cómo funciona</a></li>
                <li><Link to="/admin">Panel de admin</Link></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Compañía</h5>
              <ul>
                <li><a href="#">Sobre nosotros</a></li>
                <li><a href="#">Clientes</a></li>
                <li><a href="#">Carreras</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Recursos</h5>
              <ul>
                <li><a href="#">Documentación</a></li>
                <li><a href="#">Soporte</a></li>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 GetMyCarro · Hecho con cariño en Caracas</span>
            <span>v1.0 · es-VE</span>
          </div>
        </div>
      </footer>
    </>
  );
}
