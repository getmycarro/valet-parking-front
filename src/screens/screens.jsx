import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Icon, Logo } from '../components/icons.jsx';
import { Sidebar, Topbar, KpiCard, Plate, Badge, LivePill, SectionHead, PageHead, Modal, Toast, VehicleRow } from '../components/ui.jsx';
import { STATUS_META, nextActions, apiStatusToUi, uiStatusToApi, normaliseRecord } from '../store.jsx';
import api from '../lib/api.js';
import { VehicleFields, plateHasMinLetters } from '../components/vehicleFields.jsx';
import { auth } from '../lib/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

/* Admin UI kit — Screen-level views */

const ROLE_PRESETS = {
  super_admin: { name: "Carlos Quintero",  email: "carlos@getmycarro.com",    label: "Super Admin",      desc: "Compañías y usuarios globales" },
  admin:       { name: "María Rodríguez",  email: "maria@hotelpremium.com",   label: "Administrador",    desc: "Operación completa de tu compañía" },
  manager:     { name: "Daniela Suárez",   email: "daniela@hotelpremium.com", label: "Gerente",          desc: "Dashboard + cobros" },
  attendant:   { name: "Luis García",      email: "luis@hotelpremium.com",    label: "Valet",            desc: "Registrar y entregar vehículos" },
};

/* Infer role from email so we don't need a UI picker */
function inferRole(email) {
  const e = (email || "").toLowerCase().trim();
  for (const [key, preset] of Object.entries(ROLE_PRESETS)) {
    if (preset.email === e) return key;
  }
  if (/super|root|owner|founder/.test(e)) return "super_admin";
  if (/^(valet|luis|carlos\.m|andres)/.test(e) || /@.*valet/.test(e)) return "attendant";
  if (/(gerente|manager|daniela)/.test(e)) return "manager";
  return "admin";
}

/* ─── LOGIN ───────────────────────────────────────────── */
function LoginScreen({ onLogin, onBack }) {
  const [showPwd, setShowPwd] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [pwd, setPwd] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, pwd);
      const idToken = await fbUser.getIdToken();
      localStorage.setItem('gmc_token', idToken);

      const profileRes = await api.get('/auth/me');
      const u = profileRes.data.data;
      onLogin({ name: u.name, email: u.email, role: u.role, id: u.id });
    } catch (err) {
      localStorage.removeItem('gmc_token');
      const firebaseErrors = {
        'auth/user-not-found':    'Usuario no encontrado',
        'auth/wrong-password':    'Contraseña incorrecta',
        'auth/invalid-credential':'Correo o contraseña incorrectos',
        'auth/invalid-email':     'Correo inválido',
        'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
      };
      setError(firebaseErrors[err.code] || err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-stage">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <Logo size="lg" />
        </div>
        <h2 style={{ textAlign: 'center' }}>Iniciar sesión</h2>
        <p className="sub" style={{ textAlign: 'center' }}>Accede al panel de control de tu operación</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" required autoFocus />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} required style={{ paddingRight: 40, width: '100%' }} />
              <button type="button" onClick={() => setShowPwd(s => !s)} className="icon-btn" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32 }}>
                <Icon name={showPwd ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate-300)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#3B82F6' }} /> Recordarme
            </label>
            <a href="#" style={{ color: '#60A5FA' }}>¿Olvidaste tu contraseña?</a>
          </div>
          {error && <div style={{ color: '#F87171', fontSize: 13, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, padding: '12px 18px', fontSize: 14 }}>
            {loading ? <><Icon name="loader" size={16} style={{ animation: 'spin 1s linear infinite' }} /> Iniciando sesión…</> : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--slate-400)' }}>
          ¿No tienes cuenta? <a href="#" style={{ color: '#60A5FA', fontWeight: 500 }}>Contacta con ventas</a>
          <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--slate-500)' }}>
            <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', font: 'inherit', padding: 0 }}>← Volver al sitio</button>
          </span>
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────── */
const CHART = [40, 65, 85, 72, 90, 60, 45, 55, 70, 80, 75, 50, 62, 78];

function DashboardScreen({ onRegister, onAction }) {
  const [vehicles, setVehicles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [vRes, pRes] = await Promise.allSettled([
          api.get('/vehicles', { params: { limit: 100 } }),
          api.get('/payments', { params: { limit: 100 } }),
        ]);
        if (cancelled) return;
        if (vRes.status === 'fulfilled') {
          const raw = vRes.value.data.data;
          const list = Array.isArray(raw) ? raw : (raw?.data || []);
          const STATUS_ORDER = { unpaid: 0, in_review: 1, paid: 2, delivered: 3 };
        const normalised = list.map(normaliseRecord);
        if (tab === 'in_lot') {
          normalised.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
        }
        setVehicles(normalised);
        }
        if (pRes.status === 'fulfilled') {
          const raw = pRes.value.data.data;
          setPayments(Array.isArray(raw) ? raw : (raw?.data || []));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toDateString();
  const cobradosHoy = payments.filter(p => new Date(p.createdAt || p.date).toDateString() === today).length;
  const recent = vehicles.slice(0, 6);

  return (
    <div className="page">
      <PageHead
        title="Dashboard"
        subtitle="Vista general de tu operación"
        actions={<>
          <LivePill />
          <button className="btn btn-primary" onClick={onRegister}><Icon name="plus" size={14} /> Registrar vehículo</button>
        </>}
      />

      {loading ? (
        <div className="glass empty" style={{ padding: 60 }}><Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} /><p>Cargando datos…</p></div>
      ) : (
        <>
          <div className="kpi-grid-3">
            <KpiCard icon="dollar" tone="amber"  label="Cobros hoy"         value={cobradosHoy}   sub="Pagos registrados hoy" />
            <KpiCard icon="users"  tone="indigo" label="Total registros"    value={vehicles.length} sub="En este período" />
            <KpiCard icon="check"  tone="cyan"   label="Entregados"         value={vehicles.filter(v => v.status === 'delivered').length} sub="Vehículos con checkout" />
          </div>

          <div className="dashboard-split">
            <div className="glass">
              <SectionHead title="Vehículos recientes" meta="Últimas entradas" actions={<button className="btn btn-ghost"><Icon name="filter" size={14} /> Filtrar</button>} />
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr><th>Vehículo</th><th>Valet</th><th>Ingreso</th><th>Estado</th><th></th></tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 && (
                      <tr><td colSpan="5"><div className="empty" style={{ padding: 40 }}><p>No hay registros recientes.</p></div></td></tr>
                    )}
                    {recent.map(v => (
                      <VehicleRow key={v.id} v={v} owner={{ name: v.ownerName, cedula: v.ownerIdNumber }} onAction={onAction} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass">
              <SectionHead title="Ocupación por hora" meta="Actividad reciente" />
              <div className="chart">
                {CHART.map((h, i) => (
                  <div key={i} className={`chart-bar${i % 2 === 0 ? ' alt' : ''}`} style={{ height: h + '%' }} />
                ))}
              </div>
              <div className="chart-labels">
                <span>08:00</span><span>11:00</span><span>14:00</span><span>17:00</span><span>20:00</span>
              </div>
              <div style={{ padding: '0 22px 20px', borderTop: '1px solid var(--slate-800)', marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--slate-400)' }}>Sin pago</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{vehicles.filter(v => v.status === 'unpaid').length} vehículos</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: 13, borderTop: '1px solid var(--slate-800)' }}>
                  <span style={{ color: 'var(--slate-400)' }}>Listos para entregar</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{vehicles.filter(v => v.status === 'paid').length} vehículos</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── VEHICLES ──────────────────────────────────────────── */
const VEHICLES_PAGE_SIZE = 25;
const TAB_STATUS = { unpaid: 'active', in_review: 'in_review', paid: 'pending_delivery', delivered: 'completed' };

function VehiclesScreen({ onRegister, user, refreshKey = 0 }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deferredQ, setDeferredQ] = useState('');
  const [tab, setTab] = useState('unpaid');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, active: 0, in_review: 0, pending_delivery: 0, completed: 0, all: 0 });
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [activeWorkday, setActiveWorkday] = useState(null);
  const [workdayChecked, setWorkdayChecked] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    api.get('/workdays/active')
      .then(res => setActiveWorkday(res.data.data ?? null))
      .catch(() => {})
      .finally(() => setWorkdayChecked(true));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Debounce search → reset to page 1 on change
  useEffect(() => {
    const t = setTimeout(() => { setDeferredQ(q.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchVehicles = useCallback(async () => {
    if (!workdayChecked) return;
    if (!activeWorkday) {
      setVehicles([]);
      setPageMeta(m => ({ ...m, active: 0, in_review: 0, pending_delivery: 0, completed: 0 }));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { page, limit: VEHICLES_PAGE_SIZE, status: TAB_STATUS[tab], workdayId: activeWorkday.id };
      if (deferredQ) params.search = deferredQ;
      if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder; }
      const vRes = await api.get('/vehicles', { params }).catch(err => ({ error: err }));
      if (!vRes.error) {
        const responseBody = vRes.data;
        const list = Array.isArray(responseBody?.data) ? responseBody.data : (responseBody?.data?.data || []);
        const serverMeta = responseBody?.meta || {};
        const normalised = list.map(normaliseRecord);
        setVehicles(normalised);
        setPageMeta(m => ({ ...m, ...serverMeta }));
      } else {
        setToast('Error al cargar vehículos');
      }
    } finally {
      setLoading(false);
    }
  }, [tab, deferredQ, page, workdayChecked, activeWorkday, refreshKey, sortBy, sortOrder]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const counts = {
    unpaid:    pageMeta.active    ?? 0,
    in_review: pageMeta.in_review ?? 0,
    paid:      pageMeta.pending_delivery ?? 0,
    delivered: pageMeta.completed ?? 0,
  };

  /* Handle status action — deliver uses checkout endpoint; paid opens PaymentModal */
  const handleAction = async (vehicle, statusId) => {
    if (statusId === 'paid') {
      const hasApproved = vehicle._raw?.payments?.some(p => p.status === 'RECEIVED');
      if (!hasApproved) {
        // No hay pago aprobado → abrir modal para registrar uno (se auto-aprueba)
        const hasPending = vehicle._raw?.payments?.some(p => p.status === 'PENDING');
        if (hasPending && !confirm('Este parking tiene un pago sin confirmar, ¿quiere ingresar otro?')) {
          return;
        }
        setPaymentTarget(vehicle);
        return;
      }
      // Ya tiene pago aprobado → transición directa, sin modal
    }
    setActionLoading(vehicle.id);
    try {
      if (statusId === 'delivered') {
        await api.patch(`/vehicles/${vehicle.id}/checkout`, {});
      } else {
        await api.patch(`/vehicles/${vehicle.id}/status`, {
          status: uiStatusToApi(statusId),
        });
      }
      const labels = { delivered: 'entregado' };
      setToast(`Vehículo ${vehicle.plate} ${labels[statusId] || 'actualizado'}`);
      await fetchVehicles();
    } catch (err) {
      setToast(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setActionLoading(null);
    }
  };

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }

  const tabs = [
    { id: 'unpaid',    label: 'Sin pago',             icon: 'dollar', tone: 'red'   },
    { id: 'in_review', label: 'Por confirmar',        icon: 'clock',  tone: 'amber' },
    { id: 'paid',      label: 'Listos para entregar', icon: 'clock',  tone: 'amber' },
    { id: 'delivered', label: 'Entregados',           icon: 'check',  tone: 'green' },
  ];

  const emptyCopy = {
    unpaid:    'Ningún vehículo pendiente de pago.',
    in_review: 'Ningún pago por confirmar.',
    paid:      'Ningún vehículo listo para entregar.',
    delivered: 'Aún no hay entregas hoy.',
  };

  return (
    <div className="page">
      <PageHead
        title="Vehículos"
        subtitle="Operación en tiempo real — agrupados por estado"
        actions={<>
          <button className="btn btn-ghost" onClick={fetchVehicles} title="Actualizar"><Icon name="loader" size={14} /> Actualizar</button>
          <button
            className="btn btn-primary"
            onClick={onRegister}
            disabled={!activeWorkday}
            title={!activeWorkday ? 'Debe abrir una jornada primero' : undefined}
          >
            <Icon name="plus" size={14} /> Registrar vehículo
          </button>
        </>}
      />

      {!activeWorkday && (
        <div className="workday-alert" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="clock" size={16} />
          <span style={{ flex: 1 }}>No hay jornada activa. Abra una jornada para poder registrar vehículos.</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={async () => {
              try {
                await api.post('/workdays/open');
                const res = await api.get('/workdays/active');
                setActiveWorkday(res.data.data ?? null);
              } catch (e) {
                alert(e.response?.data?.message || 'Error al abrir jornada');
              }
            }}
          >
            Abrir jornada
          </button>
        </div>
      )}

      <div className="status-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`status-tab status-tab-${t.tone}${tab === t.id ? ' active' : ''}`}
            onClick={() => { setTab(t.id); setPage(1); setSortBy(null); setSortOrder('asc'); }}
          >
            <span className="status-tab-icon"><Icon name={t.icon} size={16} /></span>
            <span className="status-tab-text">
              <span className="status-tab-label">{t.label}</span>
              <span className="status-tab-count">{counts[t.id]} {counts[t.id] === 1 ? 'vehículo' : 'vehículos'}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="glass">
        <div style={{ padding: 18, borderBottom: '1px solid var(--slate-800)' }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
            <input
              placeholder="Buscar por placa, marca, modelo, nombre o cédula…"
              value={q} onChange={e => setQ(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'var(--slate-800)', border: '1px solid var(--slate-700)', color: '#fff', fontSize: 13, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando vehículos…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th style={{cursor:'pointer'}} onClick={() => handleSort('ticketNumber')}>
                    Ticket {sortBy==='ticketNumber' ? (sortOrder==='asc' ? '▲' : '▼') : '↕'}
                  </th>
                  <th>Titular</th>
                  <th style={{cursor:'pointer'}} onClick={() => handleSort('valetName')}>
                    Valet {sortBy==='valetName' ? (sortOrder==='asc' ? '▲' : '▼') : '↕'}
                  </th>
                  <th style={{cursor:'pointer'}} onClick={() => handleSort('checkInAt')}>
                    Ingreso {sortBy==='checkInAt' ? (sortOrder==='asc' ? '▲' : '▼') : '↕'}
                  </th>
                  <th>Estado</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <VehicleRow
                    key={v.id}
                    v={v}
                    owner={{ name: v.ownerName, cedula: v.ownerIdNumber }}
                    onAction={handleAction}
                    disabled={actionLoading === v.id}
                    hasOpenRequest={v.hasOpenRequest}
                  />
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan="7"><div className="empty" style={{ padding: 50 }}><Icon name="car" size={42} className="ico" /><p>{deferredQ ? 'Sin resultados para tu búsqueda.' : emptyCopy[tab]}</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {pageMeta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--slate-800)' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13, opacity: page <= 1 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            <span style={{ color: 'var(--slate-400)', fontSize: 13 }}>Página {page} de {pageMeta.totalPages}</span>
            <button disabled={page >= pageMeta.totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13, opacity: page >= pageMeta.totalPages ? 0.4 : 1 }}>
              Siguiente →
            </button>
          </div>
        )}
      </div>

      <PaymentModal
        open={!!paymentTarget}
        vehicle={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onDone={() => {
          const plate = paymentTarget?.plate;
          setPaymentTarget(null);
          setToast(`Pago registrado para ${plate} — pendiente de confirmación`);
          fetchVehicles();
        }}
      />
      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* Etiquetas de tipo de método de pago — usadas por PaymentMethodsScreen y PaymentModal */
const PAYMENT_TYPE_LABEL = { ZELLE: 'Zelle', MOBILE_PAYMENT: 'Pago Móvil', BINANCE: 'Binance', CASH: 'Efectivo', CARD: 'Tarjeta' };

/* ─── EMPLOYEES ─────────────────────────────────────────── */
const EMPLOYEE_TYPE_LABEL = { VALET: 'Valet', ATTENDANT: 'Encargado', ADMIN: 'Administrador', MANAGER: 'Gerente' };
const EMPTY_EMPLOYEE = { id: null, name: '', idNumber: '', type: 'VALET', email: '' };

function EmployeeFormModal({ open, onClose, onSave, onDelete, employee }) {
  const [form, setForm] = React.useState(employee || EMPTY_EMPLOYEE);
  const [saving, setSaving] = React.useState(false);
  const [formErr, setFormErr] = React.useState(null);

  React.useEffect(() => {
    if (open) { setForm(employee || EMPTY_EMPLOYEE); setFormErr(null); }
  }, [open, employee]);

  const isEditing = !!employee?.id;
  const set = (key, v) => setForm(f => ({ ...f, [key]: v }));

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.name.trim() || !form.idNumber.trim()) { setFormErr('Nombre y cédula son obligatorios'); return; }
    if (form.type === 'ATTENDANT' && !form.email.trim()) { setFormErr('El email es obligatorio para Attendants'); return; }
    setSaving(true);
    setFormErr(null);
    try {
      await onSave(form);
    } catch (err) {
      const msg = err.response?.data?.message;
      setFormErr(Array.isArray(msg) ? msg[0] : (msg || 'Error al guardar empleado'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title={isEditing ? 'Editar empleado' : 'Nuevo empleado'}
      description={isEditing ? 'Actualiza los datos del empleado.' : 'Completa los datos del empleado a registrar.'}
      footer={<>
        {isEditing && (
          <button className="btn btn-danger" onClick={() => onDelete?.(form)} style={{ marginRight: 'auto' }}>
            <Icon name="trash" size={14} /> Eliminar
          </button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear empleado'}
        </button>
      </>}
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <div className="field"><label>Nombre completo</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan García" required />
          </div>
          <div className="field"><label>Cédula de identidad</label>
            <input value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="V-12.345.678" required />
          </div>
        </div>

        <div className="field">
          <label>Rol</label>
          <div className="role-seg">
            <button type="button" className={`role-seg-pill${form.type === 'VALET' ? ' active' : ''}`} onClick={() => set('type', 'VALET')}>
              <Icon name="car" size={16} />
              <div className="role-seg-text">
                <span className="role-seg-name">Valet</span>
                <span className="role-seg-desc">Estaciona y entrega vehículos</span>
              </div>
            </button>
            <button type="button" className={`role-seg-pill${form.type === 'ATTENDANT' ? ' active' : ''}`} onClick={() => set('type', 'ATTENDANT')}>
              <Icon name="user" size={16} />
              <div className="role-seg-text">
                <span className="role-seg-name">Attendant</span>
                <span className="role-seg-desc">Atiende al cliente y cobra</span>
              </div>
            </button>
          </div>
        </div>

        <div className="field"><label>Email {form.type === 'ATTENDANT' ? '(requerido)' : '(opcional)'}</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="empleado@hotel.com" />
        </div>

        {formErr && (
          <div style={{ color: '#F87171', fontSize: 13, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
            {formErr}
          </div>
        )}
      </form>
    </Modal>
  );
}

function EmployeesScreen() {
  const [employees, setEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const raw = res.data.data;
      setEmployees(Array.isArray(raw) ? raw : (raw?.data || []));
    } catch {
      setToast('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const valetCount  = employees.filter(e => e.type === 'VALET').length;
  const attCount    = employees.filter(e => e.type === 'ATTENDANT').length;

  const save = async (emp) => {
    const payload = { name: emp.name, idNumber: emp.idNumber, type: emp.type };
    if (emp.email) payload.email = emp.email;
    await api.post('/employees', payload);
    setToast(`Empleado ${emp.name} creado`);
    setEditing(null);
    await fetchEmployees();
  };

  const remove = async (emp) => {
    if (!confirm(`¿Eliminar a ${emp.name}?`)) return;
    const type = emp.type;
    try {
      await api.delete(`/employees/${emp.id}?type=${type}`);
      setToast(`Empleado ${emp.name} eliminado`);
      setEditing(null);
      await fetchEmployees();
    } catch (err) {
      setToast(err.response?.data?.message || 'Error al eliminar empleado');
    }
  };

  return (
    <div className="page">
      <PageHead
        title="Empleados"
        subtitle="Valets y attendants asignados a tu compañía"
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Icon name="plus" size={14} /> Nuevo empleado</button>}
      />

      <div className="kpi-grid-4">
        <KpiCard icon="users" tone="blue"   label="Total empleados" value={employees.length} sub="Registrados en compañía" />
        <KpiCard icon="car"   tone="green"  label="Valets"          value={valetCount}       sub="Estacionan vehículos" />
        <KpiCard icon="user"  tone="indigo" label="Attendants"      value={attCount}         sub="Atienden al cliente" />
        <KpiCard icon="clock" tone="amber"  label="Roles activos"   value={valetCount + attCount} sub="Valets + Attendants" />
      </div>

      <div className="glass">
        <SectionHead title="Equipo" meta={`${employees.length} empleados`} />
        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando empleados…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Empleado</th><th>Cédula</th><th>Rol</th><th>Email</th><th></th></tr></thead>
              <tbody>
                {employees.length === 0 && (
                  <tr><td colSpan="5"><div className="empty" style={{ padding: 40 }}><Icon name="users" size={42} className="ico" /><p>No hay empleados registrados.</p></div></td></tr>
                )}
                {employees.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="car-row">
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #60A5FA, #6366F1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          {(e.name || '?').split(' ').slice(0,2).map(w => w[0]).join('')}
                        </div>
                        <span className="name">{e.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{e.idNumber}</td>
                    <td><Badge tone={e.type === 'VALET' ? 'blue' : 'slate'}>{EMPLOYEE_TYPE_LABEL[e.type] || e.type}</Badge></td>
                    <td>{e.email || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px', color: '#F87171' }} onClick={() => remove(e)} title="Eliminar empleado">
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={save}
        onDelete={remove}
        employee={editing && editing.id ? editing : null}
      />
      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── PAYMENT METHODS (ADMIN) ───────────────────────────── */
function PaymentMethodsScreen() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    api.get('/payments/methods')
      .then(res => {
        if (cancelled) return;
        const raw = res.data.data;
        setMethods(Array.isArray(raw) ? raw : (raw?.data || []));
      })
      .catch(() => { if (!cancelled) setToast('Error al cargar métodos de pago'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const TYPE_TONE = { ZELLE: 'blue', MOBILE_PAYMENT: 'cyan', BINANCE: 'amber', CASH: 'green', CARD: 'indigo' };

  return (
    <div className="page">
      <PageHead title="Métodos de pago" subtitle="Métodos de pago disponibles en tu compañía" />
      <div className="glass">
        <SectionHead title="Métodos registrados" meta={`${methods.length} métodos`} />
        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando métodos…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Nombre</th><th>Tipo</th><th>Detalle</th><th>Estado</th></tr></thead>
              <tbody>
                {methods.length === 0 && (
                  <tr><td colSpan="4"><div className="empty" style={{ padding: 40 }}><Icon name="wallet" size={42} className="ico" /><p>No hay métodos de pago registrados.</p></div></td></tr>
                )}
                {methods.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{m.name || '—'}</td>
                    <td><Badge tone={TYPE_TONE[m.type] || 'slate'}>{PAYMENT_TYPE_LABEL[m.type] || m.type}</Badge></td>
                    <td style={{ color: 'var(--slate-400)', fontSize: 13 }}>{m.detail || m.accountNumber || '—'}</td>
                    <td><Badge tone={m.isActive ? 'green' : 'slate'}>{m.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── PAYMENT MODAL — operator registers a payment for a vehicle ─── */
function PaymentModal({ open, vehicle, onClose, onDone }) {
  const [methods, setMethods] = useState([]);
  const [methodsErr, setMethodsErr] = useState(null);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [reference, setReference] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks and reset camera state
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  // Attach stream to video element once it mounts (cameraActive becomes true)
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Cleanup on unmount — turn off camera light
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    setSelectedMethodId('');
    setAmountUSD('');
    setReference('');
    setImage(null);
    setUploading(false);
    setErr(null);
    setMethods([]);
    setMethodsErr(null);
    setLoadingMethods(true);
    setExchangeRate(null);

    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(d => setExchangeRate(d.promedio ?? null))
      .catch(() => {});

    // Pre-cargar el monto con la tarifa fija de la jornada activa (editable)
    api.get('/workdays/active')
      .then(res => {
        const price = res.data.data?.valetPrice;
        if (price != null) setAmountUSD(String(price));
      })
      .catch(() => {});

    api.get('/payments/methods')
      .then(res => {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        if (list.length === 0) {
          setMethodsErr('No hay métodos de pago disponibles. Configúralos en Métodos de pago.');
        } else {
          setMethods(list);
          setSelectedMethodId(list[0].id);
        }
      })
      .catch(() => setMethodsErr('Error al cargar métodos de pago'))
      .finally(() => setLoadingMethods(false));
  }, [open]);

  const uploadImage = async (fileOrBlob) => {
    if (!fileOrBlob) return;
    setUploading(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append('file', fileOrBlob, 'captura.jpg');
      form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');
      setImage(data.secure_url);
    } catch {
      setErr('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhoto = (e) => {
    uploadImage(e.target.files[0]);
  };

  const startCamera = async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setErr('No se pudo acceder a la cámara. Revisa los permisos del navegador o usa "Subir archivo".');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      stopCamera();
      if (blob) await uploadImage(blob);
    }, 'image/jpeg', 0.9);
  };

  const canSubmit = !submitting && !uploading && !!selectedMethodId && parseFloat(amountUSD) > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const payload = {
        parkingRecordId: vehicle.id,
        paymentMethodId: selectedMethodId,
        amountUSD: parseFloat(amountUSD),
        fee: 0,
        validation: 'AUTOMATIC',
      };
      if (exchangeRate) {
        payload.exchangeRate = exchangeRate;
        payload.amountBs = parseFloat(amountUSD) * exchangeRate;
      }
      if (reference.trim()) payload.reference = reference.trim();
      if (image) payload.image = image;

      await api.post('/payments', payload);
      onDone?.();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title="Registrar pago"
      description={vehicle ? `Registrar pago para el vehículo ${vehicle.plate} — quedará pendiente de confirmación.` : ''}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {submitting ? 'Registrando…' : 'Registrar pago'}
        </button>
      </>}
    >
      {loadingMethods ? (
        <div className="empty" style={{ padding: 40 }}>
          <Icon name="loader" size={28} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 8 }}>Cargando métodos de pago…</p>
        </div>
      ) : methodsErr ? (
        <div style={{ color: '#F87171', fontSize: 13, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
          {methodsErr}
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Método de pago</label>
            <select
              value={selectedMethodId}
              onChange={e => setSelectedMethodId(e.target.value)}
              required
              style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: '#fff', padding: '10px 12px', width: '100%', fontFamily: 'inherit' }}
            >
              {methods.map(m => <option key={m.id} value={m.id}>{m.name} ({PAYMENT_TYPE_LABEL[m.type] || m.type})</option>)}
            </select>
          </div>

          <div className="field">
            <label>Monto (USD)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amountUSD}
              onChange={e => setAmountUSD(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          {exchangeRate && (
            <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: -6, marginBottom: 2 }}>
              Tasa: Bs {exchangeRate.toFixed(2)} / $1
              {parseFloat(amountUSD) > 0 && (
                <> · <strong style={{ color: 'var(--slate-300)' }}>
                  Bs {(parseFloat(amountUSD) * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong></>
              )}
            </div>
          )}

          <div className="field">
            <label>Referencia <span style={{ color: 'var(--slate-500)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Número de confirmación de transferencia"
            />
          </div>

          <div className="field">
            <label>Foto del comprobante <span style={{ color: 'var(--slate-500)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {!cameraActive ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={uploading}
                  onClick={startCamera}
                >
                  📷 Tomar foto
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Subir archivo
                </button>
              </div>
            ) : (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', borderRadius: 12, background: 'var(--slate-800)', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={capturePhoto}
                  >
                    📸 Capturar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={stopCamera}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {uploading && (
              <span style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4, display: 'block' }}>
                Subiendo imagen…
              </span>
            )}
            {image && !uploading && (
              <div style={{ marginTop: 8 }}>
                <img src={image} alt="Comprobante" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--slate-700)' }} />
              </div>
            )}
          </div>

          {err && (
            <div style={{ color: '#F87171', fontSize: 13, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
              {err}
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

/* ─── REGISTER VEHICLE MODAL — search owner via API, create if new ─── */
function parseApiError(error) {
  const msg = error?.response?.data?.message;
  if (Array.isArray(msg)) {
    const map = {
      'email must be an email': 'El email ingresado no es válido.',
      'email must be a string': 'El email ingresado no es válido.',
    };
    return msg.map(m => map[m] || m).join(' ');
  }
  return msg || 'Error al registrar vehículo';
}

function RegisterVehicleModal({ open, onClose, onDone, user }) {
  const [valets, setValets] = useState([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [owner, setOwner] = useState(null);       // found existing user+vehicles
  const [newOwner, setNewOwner] = useState(null); // form for new owner
  const [vehicle, setVehicle] = useState({ plate: '', brand: '', model: '', color: '' });
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [valetId, setValetId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [usedTickets, setUsedTickets] = useState([]);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errToast, setErrToast] = useState(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  // Load valets list when modal opens
  useEffect(() => {
    if (!open) return;
    setQuery(''); setSearched(false); setOwner(null); setNewOwner(null); setErr(null);
    setVehicle({ plate: '', brand: '', model: '', color: '' });
    setSelectedVehicleId('');
    setSaving(false);
    setShowVehiclePicker(false);
    setTicketNumber('');

    api.get('/vehicles/active-tickets')
      .then(res => setUsedTickets(Array.isArray(res.data.data?.used) ? res.data.data.used : []))
      .catch(() => setUsedTickets([]));

    api.get('/vehicles/valets')
      .then(res => {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : [];
        setValets(list);
        if (list.length > 0) setValetId(list[0].id);
      })
      .catch(() => setValets([]));
  }, [open]);

  useEffect(() => {
    if (!errToast) return;
    const t = setTimeout(() => setErrToast(null), 3000);
    return () => clearTimeout(t);
  }, [errToast]);

  const doSearch = async () => {
    if (!query.trim()) { setErr('Ingresa una cédula para buscar'); return; }
    setErr(null);
    setSearching(true);
    try {
      const res = await api.get('/vehicles/user-vehicles', { params: { idNumber: query.trim() } });
      const data = res.data.data;
      setSearched(true);
      if (data) {
        setOwner(data);
        setNewOwner(null);
        setShowVehiclePicker((data.ownedVehicles?.length || 0) > 0);
      } else {
        setOwner(null);
        setNewOwner({ name: '', idNumber: query.trim(), email: '', phone: '' });
      }
    } catch {
      setSearched(true);
      setOwner(null);
      setNewOwner({ name: '', idNumber: query.trim(), email: '', phone: '' });
    } finally {
      setSearching(false);
    }
  };

  const reset = () => {
    setQuery(''); setSearched(false); setOwner(null); setNewOwner(null); setErr(null); setSelectedVehicleId('');
    setVehicle({ plate: '', brand: '', model: '', color: '' });
    setShowVehiclePicker(false);
  };

  const plateInvalid = !selectedVehicleId && vehicle.plate.trim().length > 0 && !plateHasMinLetters(vehicle.plate);
  const plateMissing = !selectedVehicleId && !vehicle.plate.trim();
  const contactMissing = !!(newOwner && !newOwner.email?.trim() && !newOwner.phone?.trim());
  const ticketTaken = ticketNumber.trim() !== '' && usedTickets.includes(Number(ticketNumber));

  const canSubmit = (() => {
    if (saving) return false;
    if (plateMissing) return false;
    if (plateInvalid) return false;
    if (contactMissing) return false;
    if (ticketTaken) return false;
    if (owner) return true;
    if (newOwner && newOwner.name.trim() && newOwner.idNumber.trim()) return true;
    return false;
  })();

  const submit = async () => {
    if (!canSubmit) return;
    if (plateInvalid) { setErr('La placa debe contener al menos 2 caracteres alfabéticos.'); return; }
    setSaving(true);
    setErr(null);
    try {
      const payload = {};

      if (owner) {
        payload.userId = owner.id;
        if (selectedVehicleId) {
          payload.vehicleId = selectedVehicleId;
        } else {
          payload.plate  = vehicle.plate;
          payload.brand  = vehicle.brand;
          payload.model  = vehicle.model;
          payload.color  = vehicle.color;
        }
      } else if (newOwner) {
        payload.idNumber = newOwner.idNumber;
        payload.name     = newOwner.name;
        payload.email    = newOwner.email || undefined;
        payload.plate    = vehicle.plate;
        payload.brand    = vehicle.brand;
        payload.model    = vehicle.model;
        payload.color    = vehicle.color;
      }

      if (valetId) payload.valetId = valetId;
      if (ticketNumber.trim() !== '') payload.ticketNumber = Number(ticketNumber);

      const res = await api.post('/vehicles/register', payload);
      const plate = res.data.data?.plate || vehicle.plate;
      onDone?.({ plate });
    } catch (e) {
      const msg = parseApiError(e);
      setErr(msg);
      setErrToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const ownerVehicles = owner?.ownedVehicles || [];

  const handleSelectPreviousVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) {
      setVehicle({ plate: '', brand: '', model: '', color: '' });
    } else {
      const v = ownerVehicles.find(v => v.id === vehicleId);
      if (v) {
        setVehicle({ plate: v.plate ?? '', brand: v.brand ?? '', model: v.model ?? '', color: v.color ?? '' });
      }
    }
  };

  return (
    <>
    <Modal
      open={open} onClose={onClose}
      title="Registrar vehículo"
      description="Busca al cliente por cédula o regístralo si es nuevo, luego completa los datos del vehículo."
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {saving ? 'Registrando…' : 'Registrar entrada'}
        </button>
      </>}
    >
      <div className="reg-section">
        <div className="reg-section-label">1 · Cliente</div>

        {!owner && !newOwner && (
          <div className="reg-search">
            <div style={{ position: 'relative', flex: 1 }}>
              <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
              <input
                placeholder="Cédula del cliente (ej: 12345678)"
                value={query}
                onChange={e => setQuery(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), doSearch())}
                inputMode="numeric"
                autoFocus
                style={{ width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, background: 'var(--slate-800)', border: '1px solid var(--slate-700)', color: '#fff', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>
            <button className="btn btn-primary" type="button" onClick={doSearch} disabled={searching}>
              {searching ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        )}

        {err && <div className="reg-error">{err}</div>}

        {searched && !owner && newOwner && (
          <div className="reg-hint reg-hint-warning">
            <Icon name="plus" size={14} />
            <div>
              <strong>Cliente no registrado.</strong>
              <span> Completa los datos para crearlo junto con el vehículo.</span>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>Buscar de nuevo</button>
          </div>
        )}

        {owner && (
          <>
            <div className="reg-owner-card">
              <div className="reg-owner-avatar">{(owner.name || '?').split(' ').slice(0,2).map(w => w[0]).join('')}</div>
              <div className="reg-owner-info">
                <div className="reg-owner-name">{owner.name}</div>
                <div className="reg-owner-meta">
                  <span>{owner.idNumber}</span>
                  {owner.email && <><span className="reg-dot">·</span><span>{owner.email}</span></>}
                </div>
              </div>
              <Badge tone="green"><Icon name="check" size={11} strokeWidth={3} /> Existente</Badge>
              <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>Cambiar</button>
            </div>

            {ownerVehicles.length > 0 && !selectedVehicleId && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => setShowVehiclePicker(v => !v)}
              >
                <Icon name="car" size={15} />
                {showVehiclePicker ? 'Ocultar vehículos' : 'Ver vehículos registrados'}
              </button>
            )}

            {showVehiclePicker && ownerVehicles.length > 0 && !selectedVehicleId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {ownerVehicles.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    className="reg-vehicle-card"
                    onClick={() => { handleSelectPreviousVehicle(v.id); setShowVehiclePicker(false); }}
                  >
                    <div className="reg-vehicle-plate">{v.plate}</div>
                    <div className="reg-vehicle-meta">{[v.brand, v.model].filter(Boolean).join(' ')}{v.color ? ` · ${v.color}` : ''}</div>
                  </button>
                ))}
              </div>
            )}

            {selectedVehicleId && (
              <div className="reg-hint" style={{ marginTop: 10 }}>
                <Icon name="check" size={14} />
                <span>Vehículo seleccionado: <strong>{vehicle.plate}</strong>{vehicle.brand ? ` — ${vehicle.brand} ${vehicle.model}` : ''}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { handleSelectPreviousVehicle(''); setShowVehiclePicker(false); }}
                >
                  Cambiar
                </button>
              </div>
            )}

            {ownerVehicles.length === 0 && !selectedVehicleId && (
              <div className="reg-hint" style={{ marginTop: 10 }}>
                <Icon name="car" size={14} />
                <span>Sin vehículos previos. Completa los datos del vehículo en la sección siguiente.</span>
              </div>
            )}
          </>
        )}

        {newOwner && (
          <div className="reg-new-owner">
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Nombre completo</label>
                <input value={newOwner.name} onChange={e => setNewOwner(n => ({ ...n, name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '') }))} placeholder="Juan Pérez" required />
              </div>
              <div className="field"><label>Cédula</label>
                <input value={newOwner.idNumber} onChange={e => setNewOwner(n => ({ ...n, idNumber: e.target.value }))} placeholder="V-12.345.678" required />
              </div>
              <div className="field"><label>Email</label>
                <input type="email" value={newOwner.email} onChange={e => setNewOwner(n => ({ ...n, email: e.target.value }))} placeholder="cliente@ejemplo.com"
                  style={contactMissing && !newOwner.email?.trim() ? { borderColor: '#F87171' } : undefined} />
              </div>
              <div className="field"><label>Teléfono</label>
                <input value={newOwner.phone} onChange={e => setNewOwner(n => ({ ...n, phone: e.target.value.replace(/[^0-9+\s-]/g, '') }))} placeholder="+58 414 000 0000" inputMode="tel"
                  style={contactMissing && !newOwner.phone?.trim() ? { borderColor: '#F87171' } : undefined} />
              </div>
              {contactMissing && (
                <span style={{ fontSize: 11, color: '#F87171', marginTop: 4, display: 'block', gridColumn: '1/-1' }}>
                  Debes ingresar al menos un correo electrónico o un teléfono.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="reg-section" style={{
        opacity: (owner || (newOwner && newOwner.name && newOwner.idNumber)) ? 1 : 0.4,
        pointerEvents: (owner || (newOwner && newOwner.name && newOwner.idNumber)) ? 'auto' : 'none',
        transition: 'opacity 0.3s'
      }}>
        <div className="reg-section-label">2 · Vehículo</div>

        {!selectedVehicleId && (
          <VehicleFields
            value={vehicle}
            onChange={setVehicle}
            onInteract={() => setSelectedVehicleId('')}
            requireBrand
          />
        )}

        {valets.length > 0 && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Valet asignado</label>
            <select value={valetId} onChange={e => setValetId(e.target.value)} style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: '#fff', padding: '10px 12px', width: '100%', fontFamily: 'inherit' }}>
              {valets.map(vl => <option key={vl.id} value={vl.id}>{vl.name}</option>)}
            </select>
          </div>
        )}

        <div className="field" style={{ marginTop: 12 }}>
          <label>Número de ticket (opcional)</label>
          <input
            value={ticketNumber}
            onChange={e => setTicketNumber(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Se autogenera si lo dejas vacío"
            inputMode="numeric"
            style={ticketTaken ? { borderColor: '#F87171' } : undefined}
          />
          {ticketTaken && (
            <span style={{ fontSize: 11, color: '#F87171', marginTop: 4, display: 'block' }}>
              El número {ticketNumber} ya está en uso. Elige uno libre.
            </span>
          )}
          {usedTickets.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4, display: 'block' }}>
              Ocupados: {usedTickets.join(', ')}
            </span>
          )}
        </div>
      </div>
    </Modal>
    <Toast message={errToast} tone="error" />
    </>
  );
}


/* ─── REPORTS SCREEN ─────────────────────────────────── */
function ReportsScreen() {
  const today = new Date();
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly' | 'jornada'
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [exportErr, setExportErr] = useState(null);
  // Jornada tab state
  const [workdayMode, setWorkdayMode] = useState('range'); // 'range' | 'single'
  const [workdayReport, setWorkdayReport] = useState([]);
  const [workdayLoading, setWorkdayLoading] = useState(false);
  const [workdays, setWorkdays] = useState([]);
  const [selectedWorkdayId, setSelectedWorkdayId] = useState('');
  const [workdayDateFrom, setWorkdayDateFrom] = useState('');
  const [workdayDateTo, setWorkdayDateTo] = useState('');
  const [workdayDownloading, setWorkdayDownloading] = useState(false);

  // Compute date range for the current view
  const getDateRange = () => {
    if (viewMode === 'daily') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      return {
        dateFrom: `${selectedMonth}-01`,
        dateTo: `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`,
      };
    } else {
      return {
        dateFrom: `${selectedYear}-01-01`,
        dateTo: `${selectedYear}-12-31`,
      };
    }
  };

  useEffect(() => {
    if (viewMode === 'jornada') return;
    const { dateFrom, dateTo } = getDateRange();
    setLoading(true);
    api.get('/payments', { params: { dateFrom, dateTo, limit: 5000, status: 'RECEIVED' } })
      .then(res => {
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setPayments(list);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [viewMode, selectedMonth, selectedYear]);

  // Load workdays list for the selector when switching to jornada view
  useEffect(() => {
    if (viewMode !== 'jornada') return;
    if (workdays.length > 0) return;
    Promise.allSettled([
      api.get('/workdays', { params: { limit: 50, status: 'CLOSED' } }),
      api.get('/workdays/active'),
    ]).then(([closedRes, activeRes]) => {
      const closed = closedRes.status === 'fulfilled'
        ? (() => { const raw = closedRes.value.data?.data; return Array.isArray(raw) ? raw : (raw?.data || []); })()
        : [];
      const active = activeRes.status === 'fulfilled' && activeRes.value.data?.data
        ? [activeRes.value.data.data]
        : [];
      // Active first, then closed sorted newest-first
      setWorkdays([...active, ...closed]);
    });
  }, [viewMode]);

  // Aggregate by day (1-31) or month (0-11)
  const aggregated = (() => {
    if (viewMode === 'daily') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const byDay = {};
      payments.forEach(p => {
        const d = new Date(p.createdAt || p.date);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
          const day = d.getDate();
          byDay[day] = (byDay[day] || 0) + (p.amountUSD || 0);
        }
      });
      return Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        value: byDay[i + 1] || 0,
      }));
    } else {
      const year = parseInt(selectedYear, 10);
      const byMonth = {};
      payments.forEach(p => {
        const d = new Date(p.createdAt || p.date);
        if (d.getFullYear() === year) {
          const m = d.getMonth();
          byMonth[m] = (byMonth[m] || 0) + (p.amountUSD || 0);
        }
      });
      const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return Array.from({ length: 12 }, (_, i) => ({
        label: MONTHS[i],
        value: byMonth[i] || 0,
      }));
    }
  })();

  const maxValue = Math.max(...aggregated.map(d => d.value), 0.01);
  const totalEarned = payments.reduce((s, p) => s + (p.amountUSD || 0), 0);
  const avgPayment = payments.length > 0 ? totalEarned / payments.length : 0;

  // Navigation helpers
  const prevPeriod = () => {
    if (viewMode === 'daily') {
      const d = new Date(selectedMonth + '-01');
      d.setMonth(d.getMonth() - 1);
      setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      setSelectedYear(y => String(parseInt(y) - 1));
    }
  };
  const nextPeriod = () => {
    if (viewMode === 'daily') {
      const d = new Date(selectedMonth + '-01');
      d.setMonth(d.getMonth() + 1);
      setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      setSelectedYear(y => String(parseInt(y) + 1));
    }
  };

  const periodLabel = viewMode === 'daily'
    ? new Date(selectedMonth + '-15').toLocaleDateString('es-VE', { month: 'long', year: 'numeric' })
    : selectedYear;

  // Jornada: fetch report
  const fetchWorkdayReport = async () => {
    setWorkdayLoading(true);
    try {
      let params = '';
      if (workdayMode === 'single' && selectedWorkdayId) {
        params = `workdayId=${selectedWorkdayId}`;
      } else if (workdayMode === 'range' && (workdayDateFrom || workdayDateTo)) {
        const parts = [];
        if (workdayDateFrom) parts.push(`dateFrom=${workdayDateFrom}`);
        if (workdayDateTo) parts.push(`dateTo=${workdayDateTo}`);
        params = parts.join('&');
      }
      if (!params) return;
      const res = await api.get(`/workdays/report?${params}`);
      const data = res.data?.data ?? res.data ?? [];
      setWorkdayReport(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setWorkdayLoading(false);
    }
  };

  // Jornada: download XLSX
  const downloadWorkdayXlsx = async () => {
    setWorkdayDownloading(true);
    try {
      let params = '';
      if (workdayMode === 'single' && selectedWorkdayId) {
        params = `workdayId=${selectedWorkdayId}`;
      } else {
        const parts = [];
        if (workdayDateFrom) parts.push(`dateFrom=${workdayDateFrom}`);
        if (workdayDateTo) parts.push(`dateTo=${workdayDateTo}`);
        params = parts.join('&');
      }
      const res = await api.get(`/workdays/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_jornadas.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setWorkdayDownloading(false);
    }
  };

  // Payments XLSX download
  const downloadXlsx = async () => {
    if (!exportDateFrom || !exportDateTo) { setExportErr('Selecciona un rango de fechas'); return; }
    setDownloading(true);
    setExportErr(null);
    try {
      const params = { dateFrom: exportDateFrom, dateTo: exportDateTo };
      if (exportStatus) params.status = exportStatus;
      const res = await api.get('/payments/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ganancias_${exportDateFrom}_${exportDateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportErr('Error al generar el reporte. Intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page">
      <PageHead title="Reportes" subtitle="Visualiza tus ganancias y descarga reportes de facturación." />

      {/* View toggle + period navigation */}
      <div className="glass" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['daily', 'monthly'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`btn ${viewMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                {mode === 'daily' ? 'Por día' : 'Por mes'}
              </button>
            ))}
            <button
              onClick={() => setViewMode('jornada')}
              className={`btn ${viewMode === 'jornada' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              Por Jornada
            </button>
          </div>
          {viewMode !== 'jornada' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-ghost" onClick={prevPeriod} style={{ padding: '6px 12px' }}>‹</button>
              <span style={{ fontWeight: 600, color: '#fff', minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>
                {periodLabel}
              </span>
              <button className="btn btn-ghost" onClick={nextPeriod} style={{ padding: '6px 12px' }}>›</button>
            </div>
          )}
        </div>

        {viewMode === 'jornada' ? (
          <div>
            {/* Jornada sub-mode toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setWorkdayMode('range')}
                className={workdayMode === 'range' ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ fontSize: 13, padding: '6px 14px', borderRadius: 20 }}
              >
                Rango de fechas
              </button>
              <button
                onClick={() => setWorkdayMode('single')}
                className={workdayMode === 'single' ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ fontSize: 13, padding: '6px 14px', borderRadius: 20 }}
              >
                Una jornada
              </button>
            </div>

            {workdayMode === 'range' ? (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <input type="date" value={workdayDateFrom} onChange={e => setWorkdayDateFrom(e.target.value)}
                  className="input" style={{ width: 160 }} />
                <input type="date" value={workdayDateTo} onChange={e => setWorkdayDateTo(e.target.value)}
                  className="input" style={{ width: 160 }} />
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <select value={selectedWorkdayId} onChange={e => setSelectedWorkdayId(e.target.value)}
                  className="input" style={{ width: 280 }}>
                  <option value="">— Seleccionar jornada —</option>
                  {workdays.map(w => (
                    <option key={w.id} value={w.id}>
                      {new Date(w.openedAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                      {w.status === 'ACTIVE' ? ' (Activa)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button onClick={fetchWorkdayReport} className="btn btn-primary" style={{ fontSize: 13 }}
                disabled={workdayLoading}>
                {workdayLoading ? 'Cargando...' : 'Generar reporte'}
              </button>
              <button onClick={downloadWorkdayXlsx} className="btn btn-secondary" style={{ fontSize: 13 }}
                disabled={workdayDownloading || workdayReport.length === 0}>
                {workdayDownloading ? 'Descargando...' : 'Descargar XLSX'}
              </button>
            </div>

            {/* Results table */}
            {workdayReport.length > 0 && (() => {
              const sumUSD = workdayReport.reduce((s, r) => s + r.totalUSD, 0);
              const sumBs  = workdayReport.reduce((s, r) => s + r.totalBs, 0);
              const fmtDate = (d) => d ? new Date(d).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : '—';
              const fmtNum  = (n) => typeof n === 'number' ? n.toFixed(2) : '—';
              return (
                <div className="glass" style={{ borderRadius: 12, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {['Apertura','Cierre','Tickets','Pagos','Total USD','Total Bs','Tasa Prom.'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--admin-text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workdayReport.map((r, i) => (
                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--admin-text-1)', whiteSpace: 'nowrap' }}>{fmtDate(r.openedAt)}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--admin-text-3)', whiteSpace: 'nowrap' }}>{fmtDate(r.closedAt)}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--admin-text-1)' }}>{r.ticketsTotal}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--admin-text-1)' }}>{r.paymentsCount}</td>
                          <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 600 }}>${fmtNum(r.totalUSD)}</td>
                          <td style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 600 }}>Bs {fmtNum(r.totalBs)}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--admin-text-3)' }}>{r.avgExchangeRate ? fmtNum(r.avgExchangeRate) : '—'}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)', background: 'rgba(99,102,241,0.08)' }}>
                        <td colSpan={4} style={{ padding: '10px 14px', color: 'var(--admin-text-1)', fontWeight: 700 }}>TOTALES</td>
                        <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 700 }}>${sumUSD.toFixed(2)}</td>
                        <td style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 700 }}>Bs {sumBs.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {!workdayLoading && workdayReport.length === 0 && (
              <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-3)', fontSize: 14, borderRadius: 12 }}>
                Selecciona un filtro y presiona "Generar reporte"
              </div>
            )}
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total cobrado', value: `$${totalEarned.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Pagos recibidos', value: payments.length },
                { label: 'Promedio por pago', value: `$${avgPayment.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--slate-800)', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--slate-400)' }}>Cargando datos…</div>
            ) : (
              <>
                <div className="chart" style={{ alignItems: 'flex-end', position: 'relative' }}>
                  {aggregated.map((d, i) => {
                    const pct = Math.max((d.value / maxValue) * 100, d.value > 0 ? 4 : 1);
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }} title={`$${d.value.toFixed(2)}`}>
                        <div
                          className={`chart-bar${i % 2 === 0 ? '' : ' alt'}`}
                          style={{ height: `${pct}%`, width: '100%', opacity: d.value > 0 ? 0.85 : 0.2 }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 0', overflowX: 'hidden' }}>
                  {aggregated
                    .filter((_, i) => aggregated.length <= 12 || i % Math.ceil(aggregated.length / 12) === 0)
                    .map((d, i) => (
                      <span key={i} style={{ fontSize: 11, color: 'var(--slate-500)' }}>{d.label}</span>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* XLSX export panel */}
      <div className="glass" style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Descargar reporte de facturación</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="field">
            <label>Desde</label>
            <input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Hasta</label>
            <input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)} />
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={exportStatus} onChange={e => setExportStatus(e.target.value)} style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: exportStatus ? '#fff' : 'var(--slate-400)', padding: '10px 12px', fontFamily: 'inherit', fontSize: 14 }}>
              <option value="">Todos</option>
              <option value="RECEIVED">Aprobados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={downloadXlsx} disabled={downloading} style={{ height: 44, whiteSpace: 'nowrap' }}>
            {downloading ? 'Generando…' : '⬇ Descargar XLSX'}
          </button>
        </div>
        {exportErr && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#F87171', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
            {exportErr}
          </div>
        )}
      </div>
    </div>
  );
}

export { LoginScreen, DashboardScreen, VehiclesScreen, EmployeesScreen, EmployeeFormModal, RegisterVehicleModal, PaymentModal, PaymentMethodsScreen, ReportsScreen, ROLE_PRESETS, inferRole };
