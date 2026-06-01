import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20', page: String(p) });
      if (filter === 'unread') params.set('isRead', 'false');
      const res = await api.get(`/notifications?${params}`);
      const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      const items = Array.isArray(data) ? data : [];
      setNotifications(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length === 20);
      if (!reset) setPage(p + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    setPage(1);
    fetchPage(true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="page">
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--admin-text-1)', margin: 0, fontSize: '20px', fontFamily: 'var(--font-display)' }}>
            Notificaciones
          </h2>
          <button
            onClick={markAllRead}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            Marcar todas como leídas
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[['all', 'Todas'], ['unread', 'No leídas']].map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', padding: 0 }}>
          {loading && notifications.length === 0 && (
            <div style={{ padding: '32px', color: 'var(--admin-text-3)', textAlign: 'center', fontSize: '14px' }}>
              Cargando...
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div style={{ padding: '32px', color: 'var(--admin-text-3)', textAlign: 'center', fontSize: '14px' }}>
              Sin notificaciones
            </div>
          )}
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                padding: '16px',
                borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                flexShrink: 0,
                marginTop: '7px',
                background: n.isRead ? 'transparent' : '#6366f1',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: 'var(--admin-text-1)',
                  fontWeight: n.isRead ? 400 : 600,
                  marginBottom: '4px',
                  fontSize: '14px',
                }}>
                  {n.title}
                </div>
                <div style={{ color: 'var(--admin-text-3)', fontSize: '13px', marginBottom: '4px' }}>
                  {n.message}
                </div>
                <div style={{ color: 'var(--slate-600)', fontSize: '11px' }}>
                  {new Date(n.createdAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {hasMore && !loading && (
          <button
            onClick={() => fetchPage(false)}
            className="btn btn-ghost"
            style={{ marginTop: '12px', width: '100%', fontSize: '13px' }}
          >
            Cargar más
          </button>
        )}
      </div>
    </div>
  );
}
