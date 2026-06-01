import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Logo } from './icons.jsx';
import { STATUS_META, nextActions } from '../store.jsx';

const ALL_STATUSES = [
  { id: 'unpaid',    label: 'Sin pago'    },
  { id: 'in_review', label: 'En revisión' },
  { id: 'paid',      label: 'Pagado'      },
  { id: 'delivered', label: 'Entregado'   },
];

function StatusSelect({ v, onAction, disabled }) {
  const meta = STATUS_META[v.status] || STATUS_META.in_lot;
  return (
    <select
      value={v.status}
      disabled={disabled || v.status === 'delivered'}
      onChange={e => !disabled && onAction?.(v, e.target.value)}
      className={`status-select status-select--${meta.tone}`}
    >
      {ALL_STATUSES.map(s => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
import api from '../lib/api.js';

/* Admin UI kit — composite components */

function Sidebar({ active, onNav, role, user, onLogout, isOpen }) {
  const groups = [
    {
      label: "Gestión",
      items: [
        { id: "dashboard",   label: "Dashboard",       icon: "dashboard", roles: ["ADMIN", "MANAGER"] },
        { id: "companies",   label: "Compañías",       icon: "building",  roles: ["SUPER_ADMIN"] },
        { id: "users",       label: "Usuarios",        icon: "users",     roles: ["SUPER_ADMIN"] },
        { id: "vehicles",    label: "Vehículos",       icon: "car",       roles: ["ADMIN", "MANAGER"] },
        { id: "workdays",    label: "Jornadas",        icon: "clock",     roles: ["ADMIN", "SUPER_ADMIN"] },
        { id: "employees",   label: "Empleados",       icon: "users",     roles: ["ADMIN"] },
        { id: "invoices",    label: "Facturas",        icon: "file",      roles: ["ADMIN", "MANAGER"] },
        { id: "methods",       label: "Métodos de pago", icon: "wallet",    roles: ["ADMIN"] },
        { id: "notifications", label: "Notificaciones",  icon: "bell",      roles: ["ADMIN", "MANAGER", "SUPER_ADMIN"] },
      ],
    },
    {
      label: "Análisis",
      items: [
        { id: "reports",  label: "Reportes", icon: "bar", roles: ["ADMIN", "SUPER_ADMIN"] },
      ],
    },
  ];

  const initials = (user?.name || "AD").split(" ").slice(0,2).map(w => w[0] || "").join("").toUpperCase();
  const roleLabels = { SUPER_ADMIN: "Super Admin", ADMIN: "Administrador", MANAGER: "Gerente", ATTENDANT: "Valet" };

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-logo">
        <Logo size="sm" />
      </div>
      <nav className="sidebar-nav">
        {groups.map(g => {
          const visible = g.items.filter(it => it.roles.includes(role));
          if (!visible.length) return null;
          return (
            <div className="sidebar-group" key={g.label}>
              <div className="sidebar-group-label">{g.label}</div>
              {visible.map(it => (
                <button
                  key={it.id}
                  className={`sidebar-item${active === it.id ? " active" : ""}`}
                  onClick={() => onNav(it.id)}
                >
                  <Icon name={it.icon} className="ico" size={18} />
                  {it.label}
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-user-name">{user?.name || "Admin"}</div>
          <div className="sidebar-user-role">{roleLabels[role]}</div>
        </div>
        <button className="icon-btn" title="Cerrar sesión" onClick={onLogout}>
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, onToggleTheme, isDark, user, onNavNotifications, onMenuToggle }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(res => {
          const d = res.data.data;
          // API may return { count: N } or just a number
          const count = typeof d === 'number' ? d : (d?.count ?? d?.unreadCount ?? 0);
          setUnreadCount(count);
        })
        .catch(() => {}); // Silently ignore — badge is non-critical
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications?limit=10&page=1');
      const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) { /* silent */ } finally { setNotifLoading(false); }
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifOpen && !e.target.closest('[data-notif-panel]')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Menú">
        <Icon name="menu" size={20} />
      </button>
      <div className="breadcrumb">
        <span className="crumb-current">{title}</span>
      </div>
      <div className="topbar-actions">
        <div data-notif-panel style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            title="Notificaciones"
            style={{ position: 'relative' }}
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifications(); }}
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 ? (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: '#EF4444',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: 1,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : (
              <span className="badge-dot" />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, width: 'min(340px, calc(100vw - 28px))',
              background: 'var(--admin-elevated)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 1000, overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--admin-text-1)', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                  Notificaciones
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-text-3)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifLoading && (
                  <div style={{ padding: '16px', color: 'var(--admin-text-3)', textAlign: 'center', fontSize: '13px' }}>
                    Cargando...
                  </div>
                )}
                {!notifLoading && notifications.length === 0 && (
                  <div style={{ padding: '24px', color: 'var(--admin-text-3)', textAlign: 'center', fontSize: '13px' }}>
                    Sin notificaciones
                  </div>
                )}
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start',
                      background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.07)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: n.isRead ? 'transparent' : '#6366f1',
                      marginTop: '5px', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--admin-text-1)', fontSize: '13px', fontWeight: n.isRead ? 400 : 600, marginBottom: '2px' }}>
                        {n.title}
                      </div>
                      <div style={{ color: 'var(--admin-text-3)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </div>
                      <div style={{ color: 'var(--slate-600)', fontSize: '11px', marginTop: '3px' }}>
                        {new Date(n.createdAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <button
                  onClick={() => { setNotifOpen(false); if (onNavNotifications) onNavNotifications(); }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' }}
                >
                  Ver todas →
                </button>
              </div>
            </div>
          )}
        </div>
        <button className="icon-btn" title="Cambiar tema" onClick={onToggleTheme}>
          <Icon name={isDark ? "sun" : "moon"} size={18} />
        </button>
      </div>
    </header>
  );
}

function KpiCard({ icon, tone = "blue", trend, trendKind = "up", label, value, sub }) {
  return (
    <div className="glass lift kpi">
      <div className="kpi-top">
        <div className={`kpi-icon ${tone}`}><Icon name={icon} size={20} /></div>
        {trend && <span className={`kpi-trend ${trendKind}`}>{trend}</span>}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function Plate({ children }) {
  return <span className="plate">{children}</span>;
}

function Badge({ tone = "slate", children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function LivePill({ children = "En vivo" }) {
  return <span className="live-pill"><span className="dot" />{children}</span>;
}

function SectionHead({ title, meta, actions }) {
  return (
    <div className="section-head">
      <div>
        <h3>{title}</h3>
        {meta && <div className="meta">{meta}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {meta && !actions && null}
        {actions}
      </div>
    </div>
  );
}

function PageHead({ title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="meta">{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
}

function Modal({ open, onClose, title, description, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast success">
      <span className="ico" style={{ display: 'grid', placeItems: 'center' }}><Icon name="check" size={18} /></span>
      {message}
    </div>
  );
}

function VehicleRow({ v, owner, onAction, disabled, hasOpenRequest }) {
  const meta = STATUS_META[v.status] || STATUS_META.in_lot;
  const actions = nextActions(v.status);
  return (
    <tr>
      <td>
        <div className="car-row">
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Link to={`/admin/ticket/${v.id}`} style={{ textDecoration: 'none' }}>
              <Plate>{v.plate}</Plate>
            </Link>
            {hasOpenRequest && (
              <span style={{
                position: 'absolute', top: -4, right: -8,
                width: 9, height: 9, borderRadius: '50%',
                background: '#EF4444',
                border: '2px solid var(--slate-900, #0F172A)',
                flexShrink: 0,
              }} title="Solicitud abierta" />
            )}
          </div>
          <div>
            <div className="name">{owner?.name || v.ownerName || "—"}</div>
            <div className="sub">{v.brand} {v.model} · {v.color}</div>
          </div>
        </div>
      </td>
      <td>{v.valet}</td>
      <td>{v.checkIn}</td>
      <td><StatusSelect v={v} onAction={onAction} disabled={!!disabled} /></td>
      <td style={{ textAlign: 'right' }}>
        {actions.length > 0
          ? actions.map(a => (
              <button
                key={a.id}
                className="btn btn-primary"
                style={{ padding: '7px 14px', fontSize: 12, opacity: disabled ? 0.6 : 1 }}
                onClick={() => !disabled && onAction?.(v, a.id)}
                disabled={!!disabled}
              >
                {disabled ? '…' : a.label}
              </button>
            ))
          : null}
      </td>
    </tr>
  );
}


export { Sidebar, Topbar, KpiCard, Plate, Badge, LivePill, SectionHead, PageHead, Modal, Toast, VehicleRow };
