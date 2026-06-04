import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { PageHead, Plate, Badge } from '../components/ui.jsx';
import { STATUS_META, normaliseRecord, uiStatusToApi } from '../store.jsx';
import api from '../lib/api.js';

const STATUS_LABELS = {
  in_lot: 'En lote', in_review: 'En revisión',
  unpaid: 'Sin pago', paid: 'Pagado', delivered: 'Entregado',
};

function generateTicketHTML(vehicle) {
  const v = vehicle._raw;
  const ticketNum = v.ticketNumber ? `#${String(v.ticketNumber).padStart(3, '0')}` : '—';
  const statusLabel = STATUS_LABELS[vehicle.status] || vehicle.status;
  const checkIn = vehicle.checkIn || new Date(v.checkInAt).toLocaleString('es-VE');
  const checkOut = v.checkOutAt ? new Date(v.checkOutAt).toLocaleString('es-VE') : null;

  const rows = (fields) =>
    fields
      .filter(Boolean)
      .map(([lbl, val]) => `<tr><td class="lbl">${lbl}</td><td class="val">${val || '—'}</td></tr>`)
      .join('');

  const commonRows = rows([
    ['Propietario', v.registerRecord?.name],
    ['Cédula', v.registerRecord?.idNumber],
    ['Vehículo', [v.brand, v.model, v.color].filter(Boolean).join(' · ')],
    ['Entrada', checkIn],
    ['Valet entrada', v.checkInValet?.name],
    checkOut && ['Salida', checkOut],
    checkOut && ['Valet salida', v.checkOutValet?.name],
    ['Estado', statusLabel],
  ]);

  const notesRow = v.notes ? rows([['Notas', v.notes]]) : '';

  const makePage = (copyLabel, extra, isLast) => `
    <div class="page${isLast ? ' last' : ''}">
      <div class="header">
        <span class="brand">GetMyCarro</span>
        <span class="ticket-num">${ticketNum}</span>
      </div>
      <div class="copy-label">${copyLabel}</div>
      <div class="plate">${vehicle.plate}</div>
      <table class="grid">${commonRows}${extra}</table>
      ${isLast ? `
        <div class="signature">
          <div class="signature-label">Firma del cliente</div>
          <div class="signature-underline"></div>
        </div>` : ''}
      <div class="footer">${isLast ? 'Copia interna — GetMyCarro' : 'Gracias por usar GetMyCarro'}</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ticket ${ticketNum} — ${vehicle.plate}</title>
<style>
  @page { size: A4; margin: 18mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, -apple-system, sans-serif; color: #0A0E16; background: #fff; font-size: 13px; }
  .page { border-top: 4px solid #0A84FF; padding-top: 18px; page-break-after: always; min-height: 240mm; display: flex; flex-direction: column; }
  .page.last { page-break-after: auto; }
  .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .brand { font-size: 22px; font-weight: 700; color: #0A84FF; letter-spacing: -0.5px; }
  .ticket-num { font-size: 18px; font-weight: 700; color: #4A5160; }
  .copy-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; color: #94A3B8; text-transform: uppercase; margin-bottom: 18px; }
  .plate { font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; font-size: 38px; font-weight: 700; letter-spacing: 4px; display: inline-block; padding: 6px 16px; border: 2px solid #0A0E16; border-radius: 6px; margin-bottom: 22px; }
  .grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .grid tr { border-bottom: 1px solid #E2E8F0; }
  .grid td { padding: 9px 4px; vertical-align: top; }
  .lbl { color: #64748B; font-size: 12px; width: 38%; }
  .val { font-weight: 500; }
  .signature { margin-top: auto; padding-top: 28px; display: flex; align-items: flex-end; gap: 10px; }
  .signature-label { font-size: 12px; color: #64748B; white-space: nowrap; }
  .signature-underline { flex: 1; border-bottom: 1px solid #0A0E16; height: 22px; }
  .footer { margin-top: 20px; font-size: 11px; color: #94A3B8; text-align: center; }
</style>
</head>
<body>
  ${makePage('COPIA DEL CLIENTE', '', false)}
  ${makePage('COPIA DE LA EMPRESA', notesRow, true)}
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;
}

const HISTORY_STATUS = {
  PENDING:     { tone: 'amber', label: 'Pendiente'   },
  IN_PROGRESS: { tone: 'blue',  label: 'En proceso'  },
  COMPLETED:   { tone: 'green', label: 'Completado'  },
  CANCELLED:   { tone: 'red',   label: 'Cancelado'   },
  READ:        { tone: 'slate', label: 'Leído'       },
  UNREAD:      { tone: 'blue',  label: 'No leído'    },
};

function HistoryStatusBadge({ status }) {
  const s = HISTORY_STATUS[status] || { tone: 'slate', label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export default function TicketDetailScreen({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [uploadRefError, setUploadRefError] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showBs, setShowBs] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/vehicles/${id}`);
      setVehicle(normaliseRecord(res.data.data));
    } catch {
      setError('No se pudo cargar el ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setHistoryLoading(true);
    try {
      const [rRes, nRes] = await Promise.allSettled([
        api.get('/requests', { params: { parkingRecordId: id, limit: 100 } }),
        api.get('/notifications', { params: { parkingRecordId: id, limit: 100 } }),
      ]);
      const reqs = rRes.status === 'fulfilled'
        ? (() => { const r = rRes.value.data.data; return Array.isArray(r) ? r : (r?.data || []); })()
        : [];
      const notifs = nRes.status === 'fulfilled'
        ? (() => { const n = nRes.value.data.data; return Array.isArray(n) ? n : (n?.data || []); })()
        : [];

      const mapped = [
        ...reqs.map(r => ({
          id: `req-${r.id}`,
          kind: 'request',
          title: 'Solicitud de búsqueda',
          message: r.objectDescription
            ? `"${r.objectDescription}"${r.notes ? ` — ${r.notes}` : ''}`
            : (r.notes || '—'),
          status: r.status,
          createdAt: r.createdAt,
          actor: r.requestedBy?.name || null,
        })),
        ...notifs.map(n => ({
          id: `notif-${n.id}`,
          kind: 'notification',
          title: n.title || n.type || 'Notificación',
          message: n.message || '',
          status: n.isRead ? 'READ' : 'UNREAD',
          createdAt: n.createdAt,
          actor: n.triggeredBy?.name || null,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setHistory(mapped);
    } finally {
      setHistoryLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVehicle(); fetchHistory(); }, [fetchVehicle, fetchHistory]);

  const updatePayment = async (paymentId, status) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      await api.patch(`/payments/${paymentId}/status`, { status });
      await fetchVehicle();
    } catch (e) {
      setPaymentError(e.response?.data?.message || 'Error al actualizar el pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStatusChange = async (newUiStatus) => {
    if (!vehicle || newUiStatus === vehicle.status) return;
    setStatusUpdating(true);
    setStatusError(null);
    try {
      if (newUiStatus === 'delivered') {
        await api.patch(`/vehicles/${id}/checkout`, {});
      } else {
        await api.patch(`/vehicles/${id}/status`, { status: uiStatusToApi(newUiStatus) });
      }
      await fetchVehicle();
    } catch (e) {
      setStatusError(e.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setStatusUpdating(false);
    }
  };

  function handlePrint() {
    const html = generateTicketHTML(vehicle);
    const win = window.open('', '_blank', 'width=820,height=640');
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  async function handleCallToCounter() {
    setCallLoading(true);
    setCallError(null);
    try {
      await api.post('/notifications/approach-counter', { parkingRecordId: id });
    } catch (e) {
      setCallError(e?.response?.data?.message ?? 'No se pudo enviar la notificación.');
    } finally {
      setCallLoading(false);
    }
  }

  const handleReferenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingRef(true);
    setUploadRefError(null);
    try {
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      cloudForm.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: cloudForm }
      );
      if (!cloudRes.ok) throw new Error('Error al subir a Cloudinary');
      const { secure_url, public_id } = await cloudRes.json();
      await api.post(`/payment-references/${id}`, { imageUrl: secure_url, publicId: public_id });
      await fetchVehicle();
    } catch (err) {
      setUploadRefError(err.response?.data?.message || err.message || 'Error al subir imagen');
    } finally {
      setUploadingRef(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="glass empty" style={{ padding: 80 }}>
          <Icon name="loader" size={36} className="ico" style={{ animation: 'spin 1s linear infinite' }} />
          <p>Cargando ticket…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="page">
        <div className="glass empty" style={{ padding: 80 }}>
          <Icon name="car" size={48} className="ico" />
          <p>{error || 'Ticket no encontrado.'}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    );
  }

  const v = vehicle._raw;
  const meta = STATUS_META[vehicle.status] || STATUS_META.in_lot;
  const canUpload = user?.role === 'ADMIN' || user?.role === 'ATTENDANT';
  const refs = v.paymentReferences || [];

  return (
    <div className="page">
      <PageHead
        title={v.ticketNumber ? `#${String(v.ticketNumber).padStart(3, '0')} · ${vehicle.plate}` : `Ticket — ${vehicle.plate}`}
        subtitle={`${v.brand} ${v.model} · ${v.color}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handlePrint} disabled={!vehicle}>
              <Icon name="printer" size={14} /> Imprimir
            </button>
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>
              <Icon name="arrow" size={14} /> Volver
            </button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass grid-2" style={{ padding: 24 }}>
          {v.ticketNumber && (
            <div>
              <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>N° de ticket</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>#{String(v.ticketNumber).padStart(3, '0')}</div>
            </div>
          )}
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Placa</div>
            <Plate>{v.plate}</Plate>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Estado</div>
            <select
              value={vehicle.status}
              disabled={statusUpdating || vehicle.status === 'delivered'}
              onChange={e => handleStatusChange(e.target.value)}
              className={`status-select status-select--${meta.tone}`}
            >
              <option value="unpaid">Sin pago</option>
              <option value="in_review">En revisión</option>
              <option value="paid">Pagado</option>
              <option value="delivered">Entregado</option>
            </select>
            {statusUpdating && <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>Guardando…</div>}
            {statusError && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{statusError}</div>}
            {vehicle && vehicle.status !== 'delivered' && user?.role !== 'CLIENT' && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCallToCounter}
                  disabled={callLoading}
                >
                  {callLoading ? 'Enviando…' : 'Llamar a caja'}
                </button>
                {callError && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{callError}</div>}
              </div>
            )}
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Vehículo</div>
            <div>{v.brand} {v.model} · {v.color}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Propietario</div>
            <div>{v.registerRecord?.name || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Cédula</div>
            <div>{v.registerRecord?.idNumber || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Ingreso</div>
            <div>{vehicle.checkIn}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Valet entrada</div>
            <div>{v.checkInValet?.name || '—'}</div>
          </div>
          {v.checkOutAt && <>
            <div>
              <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Salida</div>
              <div>{new Date(v.checkOutAt).toLocaleString('es-VE')}</div>
            </div>
            <div>
              <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Valet salida</div>
              <div>{v.checkOutValet?.name || '—'}</div>
            </div>
          </>}
          {v.notes && (
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ color: 'var(--slate-400)', fontSize: 12, marginBottom: 4 }}>Notas</div>
              <div>{v.notes}</div>
            </div>
          )}
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, color: 'var(--slate-300)' }}>Pagos</h4>
            {v.payments?.length > 0 && (
              <button
                onClick={() => setShowBs(s => !s)}
                style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--slate-600)', background: 'transparent', color: 'var(--slate-300)', cursor: 'pointer' }}
              >
                {showBs ? 'Ver en $' : 'Ver en Bs'}
              </button>
            )}
          </div>
          {paymentError && (
            <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>
              {paymentError}
            </div>
          )}
          {(!v.payments || v.payments.length === 0) ? (
            <p style={{ color: 'var(--slate-400)', fontSize: 13 }}>Sin pagos registrados.</p>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Método</th><th>Monto</th><th>Referencia</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  {v.payments.map(p => (
                    <React.Fragment key={p.id}>
                      <tr>
                        <td>{p.paymentMethod?.name || '—'}</td>
                        <td>
                          {showBs && p.amountBs != null
                            ? `Bs ${Number(p.amountBs).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : showBs && p.exchangeRate != null
                              ? `Bs ${(p.amountUSD * p.exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `$${p.amountUSD}`}
                          {showBs && p.exchangeRate != null && (
                            <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 2 }}>tasa {p.exchangeRate.toFixed(2)}</div>
                          )}
                          {showBs && p.exchangeRate == null && <span style={{ fontSize: 11, color: 'var(--slate-500)' }}> (sin tasa)</span>}
                        </td>
                        <td>{p.reference || '—'}</td>
                        <td>
                          <Badge tone={p.status === 'RECEIVED' ? 'green' : p.status === 'CANCELLED' ? 'red' : 'yellow'}>
                            {p.status === 'RECEIVED' ? 'Aprobado' : p.status === 'CANCELLED' ? 'Rechazado' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {p.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-primary" disabled={paymentLoading}
                                onClick={() => updatePayment(p.id, 'RECEIVED')}
                                style={{ padding: '4px 10px', fontSize: 12 }}>Aprobar</button>
                              <button className="btn btn-ghost" disabled={paymentLoading}
                                onClick={() => updatePayment(p.id, 'CANCELLED')}
                                style={{ padding: '4px 10px', fontSize: 12 }}>Rechazar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {p.image && (
                        <tr key={`${p.id}-img`}>
                          <td colSpan={5} style={{ paddingBottom: 12, paddingTop: 4 }}>
                            <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 4 }}>Comprobante:</div>
                            <img
                              src={p.image}
                              alt="Comprobante de pago"
                              style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, border: '1px solid var(--slate-700)', display: 'block' }}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--slate-300)' }}>Referencias de pago</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {refs.length === 0 && <p style={{ color: 'var(--slate-400)', fontSize: 13 }}>Sin referencias cargadas.</p>}
            {refs.map(r => (
              <img
                key={r.id}
                src={r.imageUrl}
                alt="referencia"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                onClick={() => setLightboxSrc(r.imageUrl)}
              />
            ))}
          </div>
          {canUpload && (
            <label className="btn btn-ghost" style={{ marginTop: 12 }}>
              {uploadingRef ? 'Subiendo…' : 'Subir referencia'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleReferenceUpload}
                disabled={uploadingRef}
              />
            </label>
          )}
          {uploadRefError && <p style={{ color: 'red', marginTop: 8 }}>{uploadRefError}</p>}
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--slate-300)' }}>Historial</h4>
          {historyLoading ? (
            <p style={{ color: 'var(--slate-400)', fontSize: 13 }}>Cargando historial…</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--slate-400)', fontSize: 13 }}>Sin actividad registrada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {history.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: idx < history.length - 1 ? '1px solid var(--slate-800)' : 'none',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: item.kind === 'request' ? '#3B82F6' : '#6366F1',
                    }} />
                    {idx < history.length - 1 && (
                      <div style={{ flex: 1, width: 2, background: 'var(--slate-800)', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--slate-500)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                        {new Date(item.createdAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    {item.message && (
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--slate-400)', lineHeight: 1.5 }}>{item.message}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <HistoryStatusBadge status={item.status} />
                      {item.actor && (
                        <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>por {item.actor}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
        >
          <img
            src={lightboxSrc}
            alt="referencia ampliada"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
