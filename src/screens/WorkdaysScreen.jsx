import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { KpiCard, Badge, PageHead, SectionHead, Modal, Toast, Plate } from '../components/ui.jsx';
import api from '../lib/api.js';

/* ─── WORKDAYS SCREEN (admin / super_admin) ─────────────────────────────── */

export default function WorkdaysScreen({ user }) {
  const [activeWorkday, setActiveWorkday]     = useState(null);
  const [workdays, setWorkdays]               = useState([]);
  const [stats, setStats]                     = useState({ total: 0, inside: 0, exited: 0 });
  const [isLoading, setIsLoading]             = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCloseModal, setShowCloseModal]   = useState(false);
  const [showOpenModal, setShowOpenModal]     = useState(false);
  const [openPrice, setOpenPrice]             = useState('');
  const [showPriceModal, setShowPriceModal]   = useState(false);
  const [editPrice, setEditPrice]             = useState('');
  const [priceConfirm, setPriceConfirm]       = useState(false);
  const [closeError, setCloseError]           = useState(null);
  const [showResetModal, setShowResetModal]   = useState(false);
  const [resetAck, setResetAck]               = useState(false);
  const [resetError, setResetError]           = useState(null);
  const [toast, setToast]                     = useState(null);
  const [selectedWorkday, setSelectedWorkday] = useState(null);
  const [wdVehicles, setWdVehicles]           = useState([]);
  const [wdVehiclesLoading, setWdVehiclesLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  /* ── fetch helpers ── */

  const fetchStats = useCallback(async (id) => {
    try {
      const res = await api.get(`/workdays/${id}/stats`);
      const raw = res.data.data;
      setStats({
        total:  raw?.total  ?? 0,
        inside: raw?.inside ?? 0,
        exited: raw?.exited ?? 0,
      });
    } catch {
      /* non-critical — leave previous stats */
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeRes, listRes] = await Promise.allSettled([
        api.get('/workdays/active'),
        api.get('/workdays'),
      ]);

      let found = null;
      if (activeRes.status === 'fulfilled') {
        found = activeRes.value.data.data ?? null;
        setActiveWorkday(found);
      } else {
        /* 404 means no active workday — treat as null */
        setActiveWorkday(null);
      }

      if (listRes.status === 'fulfilled') {
        const raw = listRes.value.data.data;
        setWorkdays(Array.isArray(raw) ? raw : (raw?.data ?? []));
      }

      if (found?.id) {
        await fetchStats(found.id);
      } else {
        setStats({ total: 0, inside: 0, exited: 0 });
      }
    } catch {
      setToast('Error al cargar jornadas');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── action handlers ── */

  const handleOpen = () => {
    setOpenPrice('');
    setShowOpenModal(true);
  };

  const confirmOpen = async () => {
    setIsActionLoading(true);
    try {
      const price = parseFloat(openPrice);
      const payload = openPrice.trim() !== '' && price >= 0 ? { valetPrice: price } : {};
      await api.post('/workdays/open', payload);
      setShowOpenModal(false);
      setToast('Jornada abierta correctamente');
      await fetchData();
    } catch (err) {
      setToast(err.response?.data?.message || 'Error al abrir la jornada');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditPrice = () => {
    setEditPrice(activeWorkday?.valetPrice != null ? String(activeWorkday.valetPrice) : '');
    setPriceConfirm(false);
    setShowPriceModal(true);
  };

  const confirmEditPrice = async () => {
    if (!activeWorkday?.id) return;
    setIsActionLoading(true);
    try {
      const price = parseFloat(editPrice);
      const payload = editPrice.trim() !== '' && price >= 0 ? { valetPrice: price } : {};
      await api.patch(`/workdays/${activeWorkday.id}/price`, payload);
      setShowPriceModal(false);
      setPriceConfirm(false);
      setToast('Tarifa de la jornada actualizada');
      await fetchData();
    } catch (err) {
      setToast(err.response?.data?.message || 'Error al actualizar la tarifa');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = () => {
    setCloseError(null);
    setShowCloseModal(true);
  };

  const confirmClose = async () => {
    if (!activeWorkday?.id) return;
    setIsActionLoading(true);
    setCloseError(null);
    try {
      await api.patch(`/workdays/${activeWorkday.id}/close`);
      setShowCloseModal(false);
      setToast('Jornada cerrada correctamente');
      await fetchData();
    } catch (err) {
      setCloseError(err.response?.data?.message || 'Error al cerrar la jornada');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReset = () => {
    setResetError(null);
    setResetAck(false);
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    if (!activeWorkday?.id) return;
    setIsActionLoading(true);
    setResetError(null);
    try {
      await api.post(`/workdays/${activeWorkday.id}/reset`);
      setShowResetModal(false);
      setResetAck(false);
      setToast('Jornada reiniciada — nueva jornada limpia activa');
      await fetchData();
    } catch (err) {
      setResetError(err.response?.data?.message || 'Error al reiniciar la jornada');
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchWorkdayVehicles = async (workdayId) => {
    setWdVehiclesLoading(true);
    try {
      const res = await api.get('/vehicles', { params: { workdayId, limit: 200 } });
      const raw = res.data.data;
      setWdVehicles(Array.isArray(raw) ? raw : (raw?.data || []));
    } catch {
      setWdVehicles([]);
    } finally {
      setWdVehiclesLoading(false);
    }
  };

  /* ── date formatting ── */

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-VE', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('es-VE', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  /* ── render ── */

  return (
    <div className="page">
      <PageHead
        title="Jornadas"
        subtitle="Gestiona las jornadas de trabajo y monitorea la actividad del lote"
      />

      {/* ── active workday banner ── */}
      {isLoading ? (
        <div className="glass" style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--admin-text-3)' }}>
          <Icon name="loader" size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Cargando estado de jornada…</span>
        </div>
      ) : activeWorkday ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'rgba(34,197,94,0.10)',
            border: '1px solid rgba(34,197,94,0.30)',
            borderRadius: 12,
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 8px rgba(34,197,94,0.7)',
                flexShrink: 0,
              }} />
              <span style={{ color: '#22C55E', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-display)' }}>
                Jornada activa desde {formatDate(activeWorkday.openedAt)} · {formatTime(activeWorkday.openedAt)}
                {activeWorkday.valetPrice != null && (
                  <span style={{ marginLeft: 10, color: '#22C55E', fontWeight: 700 }}>
                    · Tarifa ${Number(activeWorkday.valetPrice).toFixed(2)}
                  </span>
                )}
              </span>
            </div>
            {canManage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                  onClick={handleEditPrice}
                  disabled={isActionLoading}
                >
                  <Icon name="wallet" size={14} />
                  Editar tarifa
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                  onClick={handleClose}
                  disabled={isActionLoading}
                >
                  <Icon name="x" size={14} />
                  {isActionLoading ? 'Cerrando…' : 'Cerrar Jornada'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: 13, color: '#F59E0B', borderColor: 'rgba(245,158,11,0.45)' }}
                  onClick={handleReset}
                  disabled={isActionLoading}
                  title="Cierre contundente y nueva jornada limpia (experimental)"
                >
                  <Icon name="alert" size={14} />
                  Reiniciar jornada
                </button>
              </div>
            )}
          </div>

          <div className="kpi-grid-3">
            <KpiCard icon="arrowRight" tone="green" label="Vehículos salidos"   value={stats.exited} sub="Salidas en esta jornada" />
            <KpiCard icon="clock"      tone="amber" label="Total en jornada"    value={stats.total}  sub="Registros en la jornada" />
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(100,116,139,0.10)',
          border: '1px solid rgba(100,116,139,0.25)',
          borderRadius: 12,
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="clock" size={16} style={{ color: 'var(--admin-text-3)' }} />
            <span style={{ color: 'var(--admin-text-2)', fontSize: 14 }}>
              No hay jornada activa
            </span>
          </div>
          {canManage && (
            <button
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: 13 }}
              onClick={handleOpen}
              disabled={isActionLoading}
            >
              <Icon name="plus" size={14} />
              {isActionLoading ? 'Abriendo…' : 'Abrir Jornada'}
            </button>
          )}
        </div>
      )}

      {/* ── workday history table ── */}
      {selectedWorkday ? (
        <div className="glass">
          <SectionHead
            title={`Vehículos · Jornada ${formatDate(selectedWorkday.openedAt)} ${formatTime(selectedWorkday.openedAt)}`}
            meta={wdVehiclesLoading ? 'Cargando…' : `${wdVehicles.length} vehículos`}
            actions={
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedWorkday(null)}>
                <Icon name="arrow" size={14} /> Volver a jornadas
              </button>
            }
          />
          {wdVehiclesLoading ? (
            <div className="empty" style={{ padding: 60 }}>
              <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
              <p>Cargando vehículos…</p>
            </div>
          ) : wdVehicles.length === 0 ? (
            <div className="empty" style={{ padding: 40 }}>
              <Icon name="car" size={42} className="ico" />
              <p>Sin vehículos en esta jornada.</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>N° Ticket</th>
                    <th>Placa</th>
                    <th>Vehículo</th>
                    <th>Estado</th>
                    <th>Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {wdVehicles.map(v => {
                    const STATUS_LABEL = { in_lot: 'En lote', active: 'Sin pago', in_review: 'En revisión', pending_delivery: 'Por entregar', completed: 'Entregado', FREE: 'Entregado', PAID: 'Por entregar', UNPAID: 'Sin pago', PAYMENT_UNDER_REVIEW: 'En revisión' };
                    const STATUS_TONE  = { in_lot: 'blue', active: 'red', in_review: 'amber', pending_delivery: 'amber', completed: 'green', FREE: 'green', PAID: 'amber', UNPAID: 'red', PAYMENT_UNDER_REVIEW: 'amber' };
                    const statusKey = v.status || v.currentStatus;
                    return (
                      <tr key={v.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--admin-text-2)' }}>
                          {v.ticketNumber ? `#${String(v.ticketNumber).padStart(3, '0')}` : '—'}
                        </td>
                        <td>
                          <Link to={`/admin/ticket/${v.id}`} style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13, textDecoration: 'none' }}>
                            {v.plate}
                          </Link>
                        </td>
                        <td style={{ color: 'var(--admin-text-2)', fontSize: 13 }}>{v.brand} {v.model}</td>
                        <td><Badge tone={STATUS_TONE[statusKey] || 'slate'}>{STATUS_LABEL[statusKey] || statusKey || '—'}</Badge></td>
                        <td style={{ color: 'var(--admin-text-3)', fontSize: 12 }}>
                          {v.checkInAt ? new Date(v.checkInAt).toLocaleString('es-VE') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="glass">
          <SectionHead
            title="Historial de jornadas"
            meta={`${workdays.length} registradas`}
          />
          {isLoading ? (
            <div className="empty" style={{ padding: 60 }}>
              <Icon name="loader" size={32} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
              <p>Cargando jornadas…</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Fecha apertura</th>
                    <th>Fecha cierre</th>
                    <th>Total vehículos</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {workdays.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty" style={{ padding: 40 }}>
                          <Icon name="clock" size={42} className="ico" />
                          <p>No hay jornadas registradas.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {workdays.map(w => {
                    const statusTone  = w.status === 'ACTIVE' ? 'green' : 'slate';
                    const statusLabel = w.status === 'ACTIVE' ? 'Activa'  : 'Cerrada';
                    const vehicleCount = w._count?.parkingRecords ?? w.vehicleCount ?? '—';
                    return (
                      <tr key={w.id}>
                        <td style={{ color: 'var(--admin-text-1)', fontSize: 13 }}>
                          {formatDate(w.openedAt)}&nbsp;
                          <span style={{ color: 'var(--admin-text-3)' }}>{formatTime(w.openedAt)}</span>
                        </td>
                        <td style={{ color: 'var(--admin-text-2)', fontSize: 13 }}>
                          {w.closedAt ? (
                            <>
                              {formatDate(w.closedAt)}&nbsp;
                              <span style={{ color: 'var(--admin-text-3)' }}>{formatTime(w.closedAt)}</span>
                            </>
                          ) : '—'}
                        </td>
                        <td style={{ color: 'var(--admin-text-1)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                          {vehicleCount}
                        </td>
                        <td>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setSelectedWorkday(w); fetchWorkdayVehicles(w.id); }}
                          >
                            Ver vehículos
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── edit valet price modal (edit → confirm) ── */}
      <Modal
        open={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title={priceConfirm ? 'Confirmar cambio de tarifa' : 'Editar tarifa de la jornada'}
        description={priceConfirm
          ? 'Confirma el cambio del costo fijo del valet parking para la jornada activa.'
          : 'Modifica el costo fijo en USD. Se usará como monto sugerido en los próximos pagos.'}
        footer={priceConfirm ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setPriceConfirm(false)}
              disabled={isActionLoading}
            >
              Volver
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmEditPrice}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Guardando…' : 'Confirmar cambio'}
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPriceModal(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setPriceConfirm(true)}
              disabled={isActionLoading}
            >
              Continuar
            </button>
          </>
        )}
      >
        {priceConfirm ? (
          <>
            <p style={{ color: 'var(--admin-text-2)', fontSize: 14, lineHeight: 1.6 }}>
              La tarifa pasará de{' '}
              <strong style={{ color: 'var(--admin-text-1)' }}>
                {activeWorkday?.valetPrice != null ? `$${Number(activeWorkday.valetPrice).toFixed(2)}` : 'Sin tarifa'}
              </strong>{' '}a{' '}
              <strong style={{ color: 'var(--admin-text-1)' }}>
                {editPrice.trim() !== '' ? `$${Number(parseFloat(editPrice)).toFixed(2)}` : 'Sin tarifa'}
              </strong>.
            </p>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)', borderRadius: 8, color: 'var(--admin-text-2)', fontSize: 13, lineHeight: 1.5 }}>
              Los pagos ya registrados conservan su monto y <strong>no se modificarán</strong>. El nuevo precio solo aplica como monto sugerido en pagos futuros.
            </div>
          </>
        ) : (
          <div className="field">
            <label>Costo fijo del valet parking (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={editPrice}
              onChange={e => setEditPrice(e.target.value)}
              placeholder="Ej: 5.00 — déjalo vacío para quitar la tarifa"
              autoFocus
            />
            <span style={{ fontSize: 11, color: 'var(--admin-text-3)', marginTop: 4, display: 'block' }}>
              Si lo dejas vacío, la jornada quedará sin tarifa y el monto del pago arrancará vacío.
            </span>
          </div>
        )}
      </Modal>

      {/* ── open workday modal ── */}
      <Modal
        open={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="Abrir jornada"
        description="Define el costo fijo del valet parking para esta jornada (opcional). Se usará como monto sugerido al registrar pagos."
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowOpenModal(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmOpen}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Abriendo…' : 'Abrir jornada'}
            </button>
          </>
        }
      >
        <div className="field">
          <label>Costo fijo del valet parking (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={openPrice}
            onChange={e => setOpenPrice(e.target.value)}
            placeholder="Ej: 5.00 — déjalo vacío si no aplica"
            autoFocus
          />
          <span style={{ fontSize: 11, color: 'var(--admin-text-3)', marginTop: 4, display: 'block' }}>
            Opcional. Si lo dejas vacío, el monto del pago arrancará vacío como hasta ahora.
          </span>
        </div>
      </Modal>

      {/* ── close confirmation modal ── */}
      <Modal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Cerrar jornada"
        description="Esta acción cerrará la jornada activa."
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCloseModal(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmClose}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Cerrando…' : 'Cerrar jornada'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--admin-text-2)', fontSize: 14, lineHeight: 1.6 }}>
          ¿Está seguro? Esta jornada tiene{' '}
          <strong style={{ color: 'var(--admin-text-1)' }}>{stats.total}</strong>{' '}
          vehículos registrados.
        </p>
        {closeError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 8, color: '#F87171', fontSize: 13 }}>
            {closeError}
          </div>
        )}
        <div className="kpi-grid-3" style={{ marginTop: 16, gap: 10 }}>
          <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--admin-text-1)', fontWeight: 700, fontSize: 20, fontFamily: 'var(--font-display)' }}>{stats.inside}</div>
            <div style={{ color: 'var(--admin-text-3)', fontSize: 11, marginTop: 2 }}>En lote</div>
          </div>
          <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--admin-text-1)', fontWeight: 700, fontSize: 20, fontFamily: 'var(--font-display)' }}>{stats.exited}</div>
            <div style={{ color: 'var(--admin-text-3)', fontSize: 11, marginTop: 2 }}>Salidos</div>
          </div>
          <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--admin-text-1)', fontWeight: 700, fontSize: 20, fontFamily: 'var(--font-display)' }}>{stats.total}</div>
            <div style={{ color: 'var(--admin-text-3)', fontSize: 11, marginTop: 2 }}>Total</div>
          </div>
        </div>
      </Modal>

      {/* ── reset workday modal (experimental) ── */}
      <Modal
        open={showResetModal}
        onClose={() => { setShowResetModal(false); setResetAck(false); }}
        title="Reiniciar jornada (experimental)"
        description="Cierre contundente de la jornada y apertura de una nueva, limpia."
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => { setShowResetModal(false); setResetAck(false); }}
              disabled={isActionLoading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmReset}
              disabled={isActionLoading || !resetAck}
            >
              {isActionLoading ? 'Reiniciando…' : 'Reiniciar jornada'}
            </button>
          </>
        }
      >
        <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 8, color: 'var(--admin-text-2)', fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>
            <Icon name="alert" size={16} />
            Función experimental — solo para pruebas
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Se marcarán <strong style={{ color: 'var(--admin-text-1)' }}>TODOS</strong> los vehículos de la jornada como <strong style={{ color: 'var(--admin-text-1)' }}>entregados</strong> (incluyendo los <strong style={{ color: 'var(--admin-text-1)' }}>{stats.inside}</strong> en lote / sin pagar).</li>
            <li>Se cerrará la jornada actual y se abrirá una <strong style={{ color: 'var(--admin-text-1)' }}>jornada nueva y vacía, sin tarifa</strong>.</li>
            <li>Esta acción es <strong style={{ color: 'var(--admin-text-1)' }}>irreversible</strong>.</li>
          </ul>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, cursor: 'pointer', color: 'var(--admin-text-2)', fontSize: 13 }}>
          <input
            type="checkbox"
            checked={resetAck}
            onChange={e => setResetAck(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          Entiendo que esto es experimental e irreversible.
        </label>
        {resetError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 8, color: '#F87171', fontSize: 13 }}>
            {resetError}
          </div>
        )}
      </Modal>

      <Toast message={toast} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
