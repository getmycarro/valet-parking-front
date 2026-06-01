import React, { useEffect, useState, useCallback } from 'react';
import { Icon, Logo } from '../components/icons.jsx';
import { Sidebar, Topbar, KpiCard, Plate, Badge, LivePill, SectionHead, PageHead, Modal, Toast, VehicleRow } from '../components/ui.jsx';
import { STATUS_META, nextActions, apiStatusToUi, uiStatusToApi, normaliseRecord } from '../store.jsx';
import api from '../lib/api.js';
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
          setVehicles(list.map(normaliseRecord));
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

  const inLot = vehicles.filter(v => v.status !== 'delivered').length;
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
          <div className="kpi-grid-4">
            <KpiCard icon="car"    tone="blue"   label="Vehículos activos"  value={inLot}         sub="Estado actual del lote" />
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
const TAB_STATUS = { in_lot: 'in_lot', unpaid: 'active', in_review: 'in_review', paid: 'pending_delivery', delivered: 'completed' };

function VehiclesScreen({ onRegister, user }) {
  const [vehicles, setVehicles] = useState([]);
  const [openRequestIds, setOpenRequestIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deferredQ, setDeferredQ] = useState('');
  const [tab, setTab] = useState('in_lot');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, active: 0, in_review: 0, pending_delivery: 0, completed: 0, in_lot: 0, all: 0 });
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [activeWorkday, setActiveWorkday] = useState(null);
  const [workdayChecked, setWorkdayChecked] = useState(false);

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
      setPageMeta(m => ({ ...m, in_lot: 0, active: 0, in_review: 0, pending_delivery: 0, completed: 0 }));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { page, limit: VEHICLES_PAGE_SIZE, status: TAB_STATUS[tab], workdayId: activeWorkday.id };
      if (deferredQ) params.search = deferredQ;
      const [vRes, rRes] = await Promise.allSettled([
        api.get('/vehicles', { params }),
        api.get('/requests', { params: { status: 'PENDING', limit: 200 } }),
      ]);
      if (vRes.status === 'fulfilled') {
        const responseBody = vRes.value.data;
        const list = Array.isArray(responseBody?.data) ? responseBody.data : (responseBody?.data?.data || []);
        const serverMeta = responseBody?.meta || {};
        setVehicles(list.map(normaliseRecord));
        setPageMeta(m => ({ ...m, ...serverMeta }));
      } else {
        setToast('Error al cargar vehículos');
      }
      if (rRes.status === 'fulfilled') {
        const raw = rRes.value.data.data;
        const reqs = Array.isArray(raw) ? raw : (raw?.data || []);
        setOpenRequestIds(new Set(reqs.map(r => r.parkingRecordId)));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, deferredQ, page, workdayChecked, activeWorkday]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const counts = {
    in_lot:    pageMeta.in_lot    ?? 0,
    unpaid:    pageMeta.active    ?? 0,
    in_review: pageMeta.in_review ?? 0,
    paid:      pageMeta.pending_delivery ?? 0,
    delivered: pageMeta.completed ?? 0,
  };

  /* Handle status action — deliver uses checkout endpoint; paid opens PaymentModal */
  const handleAction = async (vehicle, statusId) => {
    if (statusId === 'paid') {
      setPaymentTarget(vehicle);
      return;
    }
    setActionLoading(vehicle.id);
    try {
      if (statusId === 'delivered') {
        const checkOutPayload = {};
        const valetId = user?.id || vehicle.valetId;
        if (valetId) checkOutPayload.checkOutValet = valetId;
        await api.patch(`/vehicles/${vehicle.id}/checkout`, checkOutPayload);
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

  const tabs = [
    { id: 'in_lot',    label: 'En lote',              icon: 'car',    tone: 'blue'  },
    { id: 'unpaid',    label: 'Sin pago',             icon: 'dollar', tone: 'red'   },
    { id: 'in_review', label: 'Por confirmar',        icon: 'clock',  tone: 'amber' },
    { id: 'paid',      label: 'Listos para entregar', icon: 'clock',  tone: 'amber' },
    { id: 'delivered', label: 'Entregados',           icon: 'check',  tone: 'green' },
  ];

  const emptyCopy = {
    in_lot:    'No hay vehículos en lote ahora mismo.',
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
            onClick={() => { setTab(t.id); setPage(1); }}
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
                <tr><th>Vehículo</th><th>Valet</th><th>Ingreso</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <VehicleRow
                    key={v.id}
                    v={v}
                    owner={{ name: v.ownerName, cedula: v.ownerIdNumber }}
                    onAction={handleAction}
                    disabled={actionLoading === v.id}
                    hasOpenRequest={openRequestIds.has(v.id)}
                  />
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan="5"><div className="empty" style={{ padding: 50 }}><Icon name="car" size={42} className="ico" /><p>{deferredQ ? 'Sin resultados para tu búsqueda.' : emptyCopy[tab]}</p></div></td></tr>
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

/* ─── EMPLOYEES ─────────────────────────────────────────── */
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
      setFormErr(err.response?.data?.message || 'Error al guardar empleado');
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
    const type = emp.type === 'VALET' ? 'VALET' : 'ATTENDANT';
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
                    <td><Badge tone={e.type === 'VALET' ? 'blue' : 'slate'}>{e.type}</Badge></td>
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
  const TYPE_LABEL = { ZELLE: 'Zelle', MOBILE_PAYMENT: 'Pago Móvil', BINANCE: 'Binance', CASH: 'Efectivo', CARD: 'Tarjeta' };

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
                    <td><Badge tone={TYPE_TONE[m.type] || 'slate'}>{TYPE_LABEL[m.type] || m.type}</Badge></td>
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
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [reference, setReference] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) return;
    setSelectedMethodId('');
    setAmountUSD('');
    setReference('');
    setImage(null);
    setUploading(false);
    setErr(null);
    setMethodsErr(null);

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
      .catch(() => setMethodsErr('Error al cargar métodos de pago'));
  }, [open]);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append('file', file);
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
      {methodsErr ? (
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
              {methods.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
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
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={uploading}
              style={{ color: 'var(--slate-300)', fontSize: 13 }}
            />
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
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [carBrands, setCarBrands] = useState([]);   // fetched from API
  const [brandKey, setBrandKey] = useState('');      // '' | brand.name | '__manual__'
  const [modelKey, setModelKey] = useState('');      // '' | model.name | '__manual__'

  // Load valets list when modal opens
  useEffect(() => {
    if (!open) return;
    setQuery(''); setSearched(false); setOwner(null); setNewOwner(null); setErr(null);
    setVehicle({ plate: '', brand: '', model: '', color: '' });
    setSelectedVehicleId('');
    setSaving(false);
    setBrandKey('');
    setModelKey('');

    api.get('/vehicles/valets')
      .then(res => {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : [];
        setValets(list);
        if (list.length > 0) setValetId(list[0].id);
      })
      .catch(() => setValets([]));

    api.get('/car-brands')
      .then(res => setCarBrands(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setCarBrands([]));
  }, [open]);

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
    setBrandKey('');
    setModelKey('');
  };

  const plateAlphaCount = (vehicle.plate.match(/[a-zA-Z]/g) || []).length;
  const plateInvalid = !selectedVehicleId && vehicle.plate.trim().length > 0 && plateAlphaCount < 2;
  const plateMissing = !selectedVehicleId && !vehicle.plate.trim();
  const contactMissing = !!(newOwner && !newOwner.email?.trim() && !newOwner.phone?.trim());

  const canSubmit = (() => {
    if (saving) return false;
    if (plateMissing) return false;
    if (plateInvalid) return false;
    if (contactMissing) return false;
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

      if (valetId) payload.valedId = valetId; // note: API field is "valedId" (typo in DTO)

      const res = await api.post('/vehicles/register', payload);
      const plate = res.data.data?.plate || vehicle.plate;
      onDone?.({ plate });
    } catch (e) {
      setErr(e.response?.data?.message || 'Error al registrar vehículo');
    } finally {
      setSaving(false);
    }
  };

  const ownerVehicles = owner?.ownedVehicles || [];

  const handleBrandChange = (val) => {
    if (val === '__manual__') {
      setBrandKey('__manual__');
      setModelKey('__manual__');
      setVehicle(v => ({ ...v, brand: '', model: '' }));
    } else {
      setBrandKey(val);
      setModelKey('');
      setVehicle(v => ({ ...v, brand: val, model: '' }));
    }
  };

  const handleModelChange = (val) => {
    if (val === '__manual__') {
      setModelKey('__manual__');
      setVehicle(v => ({ ...v, model: '' }));
    } else {
      setModelKey(val);
      setVehicle(v => ({ ...v, model: val }));
    }
  };

  const selectedBrandObj = carBrands.find(b => b.name === brandKey);
  const availableModels = selectedBrandObj ? selectedBrandObj.models : [];

  return (
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
                placeholder="Cédula del cliente (ej: V-12345678)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), doSearch())}
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

            {ownerVehicles.length > 0 && (
              <div className="field" style={{ marginTop: 12 }}>
                <label>Vehículo previo (opcional)</label>
                <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: '#fff', padding: '10px 12px', width: '100%', fontFamily: 'inherit' }}>
                  <option value="">— Nuevo vehículo —</option>
                  {ownerVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} · {v.brand} {v.model} ({v.color})</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {newOwner && (
          <div className="reg-new-owner">
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field"><label>Nombre completo</label>
                <input value={newOwner.name} onChange={e => setNewOwner(n => ({ ...n, name: e.target.value }))} placeholder="Juan Pérez" required />
              </div>
              <div className="field"><label>Cédula</label>
                <input value={newOwner.idNumber} onChange={e => setNewOwner(n => ({ ...n, idNumber: e.target.value }))} placeholder="V-12.345.678" required />
              </div>
              <div className="field"><label>Email</label>
                <input type="email" value={newOwner.email} onChange={e => setNewOwner(n => ({ ...n, email: e.target.value }))} placeholder="cliente@ejemplo.com"
                  style={contactMissing && !newOwner.email?.trim() ? { borderColor: '#F87171' } : undefined} />
              </div>
              <div className="field"><label>Teléfono</label>
                <input value={newOwner.phone} onChange={e => setNewOwner(n => ({ ...n, phone: e.target.value }))} placeholder="+58 414 000 0000"
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

        {!(owner && selectedVehicleId) && (
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field"><label>Placa</label>
              <input
                value={vehicle.plate}
                onChange={e => setVehicle(v => ({ ...v, plate: e.target.value.toUpperCase() }))}
                placeholder="ABC-123"
                required
                style={plateInvalid ? { borderColor: '#F87171' } : undefined}
              />
              {plateInvalid && (
                <span style={{ fontSize: 11, color: '#F87171', marginTop: 4, display: 'block' }}>
                  La placa debe tener al menos 2 letras.
                </span>
              )}
            </div>
            <div className="field"><label>Color</label>
              <input value={vehicle.color} onChange={e => setVehicle(v => ({ ...v, color: e.target.value }))} placeholder="Negro" />
            </div>
            {/* MARCA */}
            <div className="field">
              <label>Marca</label>
              {carBrands.length > 0 && brandKey !== '__manual__' ? (
                <select
                  value={brandKey}
                  onChange={e => handleBrandChange(e.target.value)}
                  style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: brandKey ? '#fff' : 'var(--slate-400)', padding: '10px 12px', width: '100%', fontFamily: 'inherit', fontSize: 14 }}
                >
                  <option value="">— Selecciona una marca —</option>
                  {carBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  <option value="__manual__">Otra marca…</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={vehicle.brand}
                    onChange={e => setVehicle(v => ({ ...v, brand: e.target.value }))}
                    placeholder="Escribe la marca"
                    style={{ flex: 1 }}
                    required
                  />
                  {carBrands.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setBrandKey(''); setModelKey(''); setVehicle(v => ({ ...v, brand: '', model: '' })); }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Ver lista
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* MODELO */}
            <div className="field">
              <label>Modelo</label>
              {brandKey && brandKey !== '__manual__' && availableModels.length > 0 && modelKey !== '__manual__' ? (
                <select
                  value={modelKey}
                  onChange={e => handleModelChange(e.target.value)}
                  style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: modelKey ? '#fff' : 'var(--slate-400)', padding: '10px 12px', width: '100%', fontFamily: 'inherit', fontSize: 14 }}
                >
                  <option value="">— Selecciona un modelo —</option>
                  {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  <option value="__manual__">Otro modelo…</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={vehicle.model}
                    onChange={e => setVehicle(v => ({ ...v, model: e.target.value }))}
                    placeholder="Escribe el modelo"
                    style={{ flex: 1 }}
                  />
                  {brandKey && brandKey !== '__manual__' && availableModels.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setModelKey(''); setVehicle(v => ({ ...v, model: '' })); }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Ver lista
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {valets.length > 0 && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Valet asignado</label>
            <select value={valetId} onChange={e => setValetId(e.target.value)} style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8, color: '#fff', padding: '10px 12px', width: '100%', fontFamily: 'inherit' }}>
              {valets.map(vl => <option key={vl.id} value={vl.id}>{vl.name}</option>)}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
}


export { LoginScreen, DashboardScreen, VehiclesScreen, EmployeesScreen, EmployeeFormModal, RegisterVehicleModal, PaymentModal, PaymentMethodsScreen, ROLE_PRESETS, inferRole };
