import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { PageHead, SectionHead, Badge, Plate, Modal, Toast, KpiCard, VehicleRow } from '../components/ui.jsx';
import { normaliseRecord, nextActions, STATUS_META } from '../store.jsx';
import api from '../lib/api.js';

const CLIENTS_PAGE_SIZE = 25;

/* ─── Error banner ───────────────────────── */
function FormError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: '#F87171', fontSize: 13, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
      {msg}
    </div>
  );
}

/* ─── Edit client modal ──────────────────── */
function EditClientModal({ open, onClose, client, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', idNumber: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open && client) {
      setForm({
        name:     client.name     || '',
        email:    client.email    || '',
        phone:    client.phone    || '',
        idNumber: client.idNumber || '',
      });
      setErr(null);
    }
  }, [open, client]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.name.trim()) { setErr('El nombre es obligatorio'); return; }
    setSaving(true);
    setErr(null);
    try {
      const payload = {};
      if (form.name.trim())     payload.name     = form.name.trim();
      if (form.email.trim())    payload.email    = form.email.trim();
      if (form.phone.trim())    payload.phone    = form.phone.trim();
      if (form.idNumber.trim()) payload.idNumber = form.idNumber.trim();
      await api.patch(`/users/client/${client.id}`, payload);
      onSaved?.();
    } catch (e2) {
      const msg = e2.response?.data?.message;
      setErr(Array.isArray(msg) ? msg[0] : (msg || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar cliente"
      description="Actualiza los datos del cliente."
      footer={<>
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </>}
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <div className="field">
            <label>Nombre completo</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan García" required />
          </div>
          <div className="field">
            <label>Cédula</label>
            <input value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="V-12.345.678" />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="cliente@email.com" />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+58 412 0000000" />
          </div>
        </div>
        <FormError msg={err} />
      </form>
    </Modal>
  );
}

/* ─── Add vehicle modal ──────────────────── */
function AddVehicleModal({ open, onClose, ownerId, onSaved }) {
  const [form, setForm] = useState({ plate: '', brand: '', model: '', color: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) { setForm({ plate: '', brand: '', model: '', color: '' }); setErr(null); }
  }, [open]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.plate.trim()) { setErr('La placa es obligatoria'); return; }
    setSaving(true);
    setErr(null);
    try {
      const payload = { plate: form.plate.trim().toUpperCase() };
      if (form.brand.trim()) payload.brand = form.brand.trim();
      if (form.model.trim()) payload.model = form.model.trim();
      if (form.color.trim()) payload.color = form.color.trim();
      await api.post(`/vehicles/owner/${ownerId}/vehicle`, payload);
      onSaved?.();
    } catch (e2) {
      const msg = e2.response?.data?.message;
      setErr(Array.isArray(msg) ? msg[0] : (msg || 'Error al agregar vehículo'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar vehículo"
      description="Registra un vehículo para este cliente."
      footer={<>
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Agregar vehículo'}
        </button>
      </>}
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label>Placa</label>
          <input
            value={form.plate}
            onChange={e => set('plate', e.target.value.toUpperCase())}
            placeholder="ABC-123"
            required
            style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Marca <span style={{ color: 'var(--slate-500)', fontWeight: 400 }}>(opcional)</span></label>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota" />
          </div>
          <div className="field">
            <label>Modelo <span style={{ color: 'var(--slate-500)', fontWeight: 400 }}>(opcional)</span></label>
            <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Corolla" />
          </div>
        </div>
        <div className="field">
          <label>Color <span style={{ color: 'var(--slate-500)', fontWeight: 400 }}>(opcional)</span></label>
          <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Blanco" />
        </div>
        <FormError msg={err} />
      </form>
    </Modal>
  );
}

/* ─── Client detail view ─────────────────── */
function ClientDetailView({ client: initialClient, onBack, setToast }) {
  const [client, setClient] = useState(initialClient);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const res = await api.get(`/vehicles/by-owner/${client.id}`);
      const raw = res.data.data;
      setVehicles(Array.isArray(raw) ? raw : (raw?.data || []));
    } catch {
      /* silent — empty state shown */
    } finally {
      setVehiclesLoading(false);
    }
  }, [client.id]);

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/vehicles', {
        params: { ownerId: client.id, status: 'all', page, limit: 15 },
      });
      const body = res.data;
      const list = Array.isArray(body?.data) ? body.data : (body?.data?.data || []);
      const meta = body?.meta || body?.data?.meta || {};
      setHistory(list.map(normaliseRecord));
      setHistoryTotalPages(meta.totalPages ?? 1);
      setHistoryPage(page);
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false);
    }
  }, [client.id]);

  useEffect(() => {
    fetchVehicles();
    fetchHistory(1);
  }, [fetchVehicles, fetchHistory]);

  const handleDeleteVehicle = async (v) => {
    if (!window.confirm(`¿Eliminar el vehículo ${v.plate}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(v.id);
    try {
      await api.delete(`/vehicles/owner/${client.id}/vehicle/${v.id}`);
      setToast('Vehículo eliminado');
      fetchVehicles();
    } catch (e) {
      const msg = e.response?.data?.message;
      setToast(Array.isArray(msg) ? msg[0] : (msg || 'Error al eliminar el vehículo'));
    } finally {
      setDeletingId(null);
    }
  };

  const initials = (client.name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="page">
      <PageHead
        title={client.name || 'Cliente'}
        subtitle={client.email || client.idNumber || ''}
        actions={
          <button className="btn btn-ghost" onClick={onBack}>
            <Icon name="arrowRight" size={14} style={{ transform: 'rotate(180deg)' }} /> Volver
          </button>
        }
      />

      {/* Client info card */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h4 style={{ margin: 0, fontSize: 15, color: 'var(--slate-300)' }}>Datos del cliente</h4>
          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setEditOpen(true)}>
            <Icon name="edit" size={13} /> Editar
          </button>
        </div>
        <div className="grid-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, gridColumn: '1/-1' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #60A5FA, #6366F1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>{client.name}</div>
              <div style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>
                <Badge tone="blue" style={{ fontSize: 11 }}>Cliente</Badge>
              </div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Cédula</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{client.idNumber || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 13 }}>{client.email || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Teléfono</div>
            <div style={{ fontSize: 13 }}>{client.phone || '—'}</div>
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="glass">
        <SectionHead
          title="Vehículos"
          meta={vehiclesLoading ? 'Cargando…' : `${vehicles.length} registrados`}
          actions={
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setAddVehicleOpen(true)}>
              <Icon name="plus" size={13} /> Agregar vehículo
            </button>
          }
        />
        {vehiclesLoading ? (
          <div className="empty" style={{ padding: 40 }}>
            <Icon name="loader" size={28} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando vehículos…</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty" style={{ padding: 40 }}>
            <Icon name="car" size={40} className="ico" />
            <p>Sin vehículos registrados.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Placa</th><th>Marca</th><th>Modelo</th><th>Color</th><th></th></tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v.plate}</td>
                    <td>{v.brand || '—'}</td>
                    <td>{v.model || '—'}</td>
                    <td>{v.color || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 12, color: '#F87171' }}
                        disabled={deletingId === v.id}
                        onClick={() => handleDeleteVehicle(v)}
                        title="Eliminar vehículo"
                      >
                        <Icon name="trash" size={13} /> {deletingId === v.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History */}
      <div className="glass">
        <SectionHead title="Historial de tickets" meta={historyLoading ? 'Cargando…' : `${history.length} registros`} />
        {historyLoading ? (
          <div className="empty" style={{ padding: 40 }}>
            <Icon name="loader" size={28} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando historial…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty" style={{ padding: 40 }}>
            <Icon name="file" size={40} className="ico" />
            <p>Sin tickets registrados para este cliente.</p>
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Vehículo</th><th>Ticket</th><th>Valet</th><th>Ingreso</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  {history.map(v => {
                    const meta = STATUS_META[v.status] || STATUS_META.in_lot;
                    return (
                      <tr key={v.id}>
                        <td>
                          <div className="car-row">
                            <Link to={`/admin/ticket/${v.id}`} style={{ textDecoration: 'none' }}>
                              <Plate>{v.plate}</Plate>
                            </Link>
                            <div>
                              <div className="name">{v.brand} {v.model}</div>
                              <div className="sub">{v.color}</div>
                            </div>
                          </div>
                        </td>
                        <td>{v.ticketNumber ?? '—'}</td>
                        <td>{v.valet || '—'}</td>
                        <td>{v.checkIn}</td>
                        <td><Badge tone={meta.tone}>{meta.label}</Badge></td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/admin/ticket/${v.id}`} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, textDecoration: 'none' }}>
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {historyTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--slate-800)' }}>
                <button
                  disabled={historyPage <= 1}
                  onClick={() => fetchHistory(historyPage - 1)}
                  className="btn btn-ghost"
                  style={{ padding: '6px 14px', fontSize: 13, opacity: historyPage <= 1 ? 0.4 : 1 }}
                >
                  ← Anterior
                </button>
                <span style={{ color: 'var(--slate-400)', fontSize: 13 }}>Página {historyPage} de {historyTotalPages}</span>
                <button
                  disabled={historyPage >= historyTotalPages}
                  onClick={() => fetchHistory(historyPage + 1)}
                  className="btn btn-ghost"
                  style={{ padding: '6px 14px', fontSize: 13, opacity: historyPage >= historyTotalPages ? 0.4 : 1 }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <EditClientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
        onSaved={async () => {
          setEditOpen(false);
          try {
            const res = await api.get(`/users/clients`, { params: { search: client.idNumber || client.email, limit: 1 } });
            const list = res.data.data?.data ?? res.data.data ?? [];
            const updated = Array.isArray(list) ? list[0] : null;
            if (updated) setClient(updated);
          } catch { /* use stale client data if refetch fails */ }
          setToast('Datos del cliente actualizados');
        }}
      />
      <AddVehicleModal
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        ownerId={client.id}
        onSaved={() => {
          setAddVehicleOpen(false);
          setToast('Vehículo agregado');
          fetchVehicles();
        }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── Clients list view ──────────────────── */
export default function ClientsScreen() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deferredQ, setDeferredQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // 400ms debounce
  useEffect(() => {
    const t = setTimeout(() => { setDeferredQ(q.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: CLIENTS_PAGE_SIZE };
      if (deferredQ) params.search = deferredQ;
      const res = await api.get('/users/clients', { params });
      const body = res.data;
      const list = Array.isArray(body?.data) ? body.data : (body?.data?.data || []);
      const meta = body?.meta || body?.data?.meta || {};
      setClients(list);
      setTotalPages(meta.totalPages ?? 1);
    } catch {
      setToast('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [deferredQ, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  if (selected) {
    return (
      <>
        <ClientDetailView
          client={selected}
          onBack={() => setSelected(null)}
          setToast={setToast}
        />
        <Toast message={toast} />
      </>
    );
  }

  return (
    <div className="page">
      <PageHead
        title="Clientes"
        subtitle="Clientes registrados en la plataforma"
      />

      <div className="glass">
        <div style={{ padding: 18, borderBottom: '1px solid var(--slate-800)' }}>
          <div style={{ position: 'relative' }}>
            <Icon
              name="search"
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }}
            />
            <input
              placeholder="Buscar por nombre, cédula, email o teléfono…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'var(--slate-800)', border: '1px solid var(--slate-700)', color: '#fff', fontSize: 13, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty" style={{ padding: 60 }}>
            <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando clientes…</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Cliente</th><th>Cédula</th><th>Email</th><th>Teléfono</th><th></th></tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty" style={{ padding: 50 }}>
                        <Icon name="person-card" size={42} className="ico" />
                        <p>{deferredQ ? 'Sin resultados para tu búsqueda.' : 'No hay clientes registrados.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map(c => {
                    const initials = (c.name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                    return (
                      <tr
                        key={c.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(c)}
                      >
                        <td>
                          <div className="car-row">
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #60A5FA, #6366F1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                              {initials}
                            </div>
                            <span className="name">{c.name}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.idNumber || '—'}</td>
                        <td style={{ fontSize: 13 }}>{c.email || '—'}</td>
                        <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setSelected(c); }}>
                            Ver →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--slate-800)' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="btn btn-ghost"
              style={{ padding: '6px 14px', fontSize: 13, opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Anterior
            </button>
            <span style={{ color: 'var(--slate-400)', fontSize: 13 }}>Página {page} de {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn btn-ghost"
              style={{ padding: '6px 14px', fontSize: 13, opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
