import React, { useEffect, useState, useCallback } from 'react';
import { Icon, Logo } from '../components/icons.jsx';
import { KpiCard, Plate, Badge, LivePill, SectionHead, PageHead, Modal, Toast, VehicleRow } from '../components/ui.jsx';
import { normaliseRecord, uiStatusToApi } from '../store.jsx';
import { RegisterVehicleModal, PaymentModal } from './screens.jsx';
import api from '../lib/api.js';

/* Admin UI kit — Role-specific screens (super_admin + attendant) */

/* ─── COMPANIES (super_admin) ───────────────────────── */

function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    api.get('/companies')
      .then(res => {
        if (cancelled) return;
        const raw = res.data.data;
        setCompanies(Array.isArray(raw) ? raw : (raw?.data || []));
      })
      .catch(() => { if (!cancelled) setToast('Error al cargar compañías'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalRevenue = companies.reduce((s, c) => s + (c.revenue || 0), 0);
  const activeCount  = companies.filter(c => c.status === 'ACTIVE' || c.status === 'active').length;
  const flatRate     = companies.filter(c => c.plan?.type === 'FLAT_RATE' || c.planType === 'FLAT_RATE').length;
  const perVehicle   = companies.filter(c => c.plan?.type === 'PER_VEHICLE' || c.planType === 'PER_VEHICLE' || c.plan?.type === 'MIXED' || c.planType === 'MIXED').length;

  const STATUS_TONE  = { ACTIVE: 'green', active: 'green', PENDING: 'amber', pending: 'amber', TRIAL: 'blue', trial: 'blue' };
  const STATUS_LABEL = { ACTIVE: 'Activa', active: 'Activa', PENDING: 'Pendiente', pending: 'Pendiente', TRIAL: 'Trial', trial: 'Trial' };
  const PLAN_TONE    = { FLAT_RATE: 'blue', PER_VEHICLE: 'slate', MIXED: 'amber' };
  const PLAN_LABEL   = { FLAT_RATE: 'Tasa Fija', PER_VEHICLE: 'Por Vehículo', MIXED: 'Mixto' };

  return (
    <div className="page">
      <PageHead
        title="Compañías"
        subtitle="Vista global · todas las cuentas conectadas a la plataforma"
        actions={<button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={14} /> Nueva compañía</button>}
      />

      <div className="kpi-grid-4">
        <KpiCard icon="building" tone="blue"   label="Compañías activas"    value={activeCount}                         sub={`${companies.length} en total`} />
        <KpiCard icon="dollar"   tone="amber"  label="Ingresos del período" value={`$${totalRevenue.toLocaleString()}`} sub="Facturación total" />
        <KpiCard icon="file"     tone="indigo" label="Plan Flat Rate"       value={flatRate}                            sub="compañías en este plan" />
        <KpiCard icon="car"      tone="cyan"   label="Plan Per Vehicle"     value={perVehicle}                          sub="compañías en este plan" />
      </div>

      <div className="glass">
        <SectionHead
          title="Todas las compañías"
          meta={`${companies.length} registradas`}
          actions={<button className="btn btn-ghost"><Icon name="filter" size={14} /> Filtrar</button>}
        />
        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando compañías…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Compañía</th><th>RIF</th><th>Plan</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {companies.length === 0 && (
                  <tr><td colSpan="5"><div className="empty" style={{ padding: 40 }}><Icon name="building" size={42} className="ico" /><p>No hay compañías registradas.</p></div></td></tr>
                )}
                {companies.map(c => {
                  const planType = c.plan?.type || c.planType || '—';
                  const statusKey = c.status || 'active';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="car-row">
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #60A5FA, #6366F1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)' }}>
                            {(c.name || '?')[0]}
                          </div>
                          <span className="name">{c.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.rif || c.code || '—'}</td>
                      <td><Badge tone={PLAN_TONE[planType] || 'slate'}>{PLAN_LABEL[planType] || planType}</Badge></td>
                      <td>
                        <Badge tone={STATUS_TONE[statusKey] || 'slate'}>{STATUS_LABEL[statusKey] || statusKey}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 10px' }}><Icon name="edit" size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={adding} onClose={() => setAdding(false)}
        title="Nueva compañía"
        description="Registra una nueva compañía en la plataforma"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setAdding(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => setAdding(false)}>Crear compañía</button>
        </>}
      >
        <div className="grid-2">
          <div className="field"><label>Nombre</label><input placeholder="Hotel Premium" /></div>
          <div className="field"><label>RIF</label><input placeholder="J-12345678-9" /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Plan</label>
            <select>
              <option value="FLAT_RATE">Flat Rate</option>
              <option value="PER_VEHICLE">Per Vehicle</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Email contacto</label><input type="email" placeholder="contacto@empresa.com" /></div>
        </div>
      </Modal>

      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── USERS (super_admin) ─────────────────────────────── */

function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    api.get('/users')
      .then(res => {
        if (cancelled) return;
        const raw = res.data.data;
        setUsers(Array.isArray(raw) ? raw : (raw?.data || []));
      })
      .catch(() => { if (!cancelled) setToast('Error al cargar usuarios'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const ROLE_TONE  = { SUPER_ADMIN: 'blue', ADMIN: 'slate', MANAGER: 'amber', ATTENDANT: 'indigo', CLIENT: 'green' };
  const ROLE_LABEL = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrador', MANAGER: 'Gerente', ATTENDANT: 'Encargado', CLIENT: 'Cliente' };

  const filtered = users.filter(u => !q || (u.name + u.email + (u.company?.name || '')).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page">
      <PageHead
        title="Usuarios"
        subtitle="Todos los usuarios con acceso al sistema · administradores y gerentes"
        actions={<button className="btn btn-primary"><Icon name="plus" size={14} /> Invitar usuario</button>}
      />

      <div className="glass">
        <div style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--slate-800)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
            <input
              placeholder="Buscar por nombre, email o compañía…"
              value={q} onChange={e => setQ(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'var(--slate-800)', border: '1px solid var(--slate-700)', color: '#fff', fontSize: 13, fontFamily: 'inherit' }}
            />
          </div>
        </div>
        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando usuarios…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Usuario</th><th>Email</th><th>Compañía</th><th>Rol</th><th>Creado</th><th></th></tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="6"><div className="empty" style={{ padding: 40 }}><Icon name="users" size={42} className="ico" /><p>{q ? 'Sin resultados.' : 'No hay usuarios registrados.'}</p></div></td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u.id || u.email}>
                    <td>
                      <div className="car-row">
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #60A5FA, #6366F1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          {(u.name || '?').split(' ').slice(0,2).map(w => w[0]).join('')}
                        </div>
                        <span className="name">{u.name || u.email}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.companyUsers?.[0]?.company?.name || u.company?.name || '—'}</td>
                    <td>
                      <Badge tone={ROLE_TONE[u.role] || 'slate'}>{ROLE_LABEL[u.role] || u.role}</Badge>
                    </td>
                    <td style={{ color: 'var(--slate-400)', fontSize: 13 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-VE') : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px' }}><Icon name="edit" size={14} /></button>
                    </td>
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

/* ─── ATTENDANT DASHBOARD — register + update status, nothing else ───── */

const ATTENDANT_PAGE_SIZE = 25;
const ATTENDANT_STATUS = { active: 'in_lot', ready: 'pending_delivery', unpaid: 'pending_payment', all: undefined };

function AttendantDashboard({ user, onLogout }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regOpen, setRegOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('active');
  const [q, setQ] = useState('');
  const [deferredQ, setDeferredQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, in_lot: 0, pending_delivery: 0, pending_payment: 0, all: 0 });
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

  useEffect(() => {
    const t = setTimeout(() => { setDeferredQ(q.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchVehicles = useCallback(async () => {
    if (!workdayChecked) return;
    if (!activeWorkday) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { page, limit: ATTENDANT_PAGE_SIZE, workdayId: activeWorkday.id };
      const apiStatus = ATTENDANT_STATUS[filter];
      if (apiStatus) params.status = apiStatus;
      if (deferredQ) params.search = deferredQ;
      const res = await api.get('/vehicles', { params });
      const responseBody = res.data;
      const list = Array.isArray(responseBody?.data) ? responseBody.data : (responseBody?.data?.data || []);
      const serverMeta = responseBody?.meta || {};
      setVehicles(list.map(normaliseRecord));
      setPageMeta(m => ({ ...m, ...serverMeta }));
    } catch {
      setToast('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  }, [filter, deferredQ, page, workdayChecked, activeWorkday]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const initials = (user?.name || 'LG').split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase();

  const counts = {
    active: pageMeta.in_lot          ?? 0,
    ready:  pageMeta.pending_delivery ?? 0,
    unpaid: pageMeta.pending_payment  ?? 0,
    all:    pageMeta.all ?? 0,
  };

  const filterDefs = [
    { id: 'active', label: 'En lote' },
    { id: 'ready',  label: 'Listos para entregar' },
    { id: 'unpaid', label: 'Por cobrar' },
    { id: 'all',    label: 'Todos' },
  ];

  const handleAction = async (vehicle, statusId) => {
    if (statusId === 'paid') {
      const hasPending = vehicle._raw?.payments?.some(p => p.status === 'PENDING');
      if (hasPending && !confirm('Este parking tiene un pago sin confirmar, ¿quiere ingresar otro?')) {
        return;
      }
      setPaymentTarget(vehicle);
      return;
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(2,6,23,0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--slate-800)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LivePill>{user?.name || 'Valet'} · En turno</LivePill>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #22C55E, #0A84FF)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {initials}
            </div>
            <button className="btn btn-ghost" onClick={onLogout} style={{ padding: '8px 14px' }}>
              <Icon name="logout" size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="page" style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PageHead
          title={`Buenas, ${user?.name?.split(' ')[0] || 'Valet'}`}
          subtitle="Registra entradas y actualiza el estado de los vehículos en lote."
          actions={<>
            <button className="btn btn-ghost" onClick={fetchVehicles} style={{ padding: '12px 16px', fontSize: 14 }}>
              <Icon name="loader" size={14} /> Actualizar
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 22px', fontSize: 14 }}
              onClick={() => setRegOpen(true)}
              disabled={!activeWorkday}
              title={!activeWorkday ? 'Debe abrir una jornada primero' : undefined}
            >
              <Icon name="plus" size={16} /> Registrar vehículo
            </button>
          </>}
        />

        {!activeWorkday && (
          <div className="workday-alert">
            <Icon name="clock" size={16} />
            No hay jornada activa. Contacta a un administrador para abrir una jornada.
          </div>
        )}

        <div className="kpi-grid-3">
          <KpiCard icon="car"    tone="blue"  label="En lote ahora"       value={counts.active} sub="Vehículos sin entregar" />
          <KpiCard icon="clock"  tone="amber" label="Listos para entregar" value={counts.ready}  sub="Vehículos pagados" />
          <KpiCard icon="dollar" tone="red"   label="Por cobrar"           value={counts.unpaid} sub="Sin pago confirmado" />
        </div>

        <div className="glass">
          <div style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--slate-800)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
              <input
                placeholder="Buscar por placa, nombre o cédula…"
                value={q} onChange={e => setQ(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'var(--slate-800)', border: '1px solid var(--slate-700)', color: '#fff', fontSize: 13, fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filterDefs.map(f => (
                <button key={f.id} className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(f.id); setPage(1); }} style={{ padding: '8px 14px', fontSize: 12 }}>
                  {f.label} <span style={{ opacity: 0.7 }}>· {counts[f.id]}</span>
                </button>
              ))}
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
                <thead><tr><th>Vehículo</th><th>Valet</th><th>Ingreso</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {vehicles.map(v => (
                    <VehicleRow
                      key={v.id}
                      v={v}
                      owner={{ name: v.ownerName, cedula: v.ownerIdNumber }}
                      onAction={handleAction}
                      disabled={actionLoading === v.id}
                    />
                  ))}
                  {vehicles.length === 0 && (
                    <tr><td colSpan="5"><div className="empty" style={{ padding: 50 }}><Icon name="car" size={42} className="ico" /><p>No hay vehículos en esta vista.</p></div></td></tr>
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
      </main>

      <RegisterVehicleModal
        open={regOpen}
        onClose={() => setRegOpen(false)}
        user={user}
        onDone={({ plate }) => { setRegOpen(false); setToast(`Vehículo ${plate} registrado`); fetchVehicles(); }}
      />
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


export { CompaniesScreen, UsersScreen, AttendantDashboard };
