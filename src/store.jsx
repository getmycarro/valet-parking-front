import React from 'react';

/* Admin UI kit — Shared vehicle + owner store
   The seed data has been removed. Data is now loaded from the real API
   in each screen component. This store is kept for STATUS_META and
   nextActions which are still used by ui.jsx / VehicleRow. */

const VehicleStoreContext = React.createContext(null);

/* ── Status helpers ─────────────────────────────────────────────────────────
   Internal status codes used by the UI ↔ API enum mapping:
     API: UNPAID | PAID | FREE | PAYMENT_UNDER_REVIEW
     UI:  unpaid | paid | delivered | in_review
   The extra "in_lot" tab is a UI-only concept meaning "all non-delivered". */

const STATUS_META = {
  in_lot:    { tone: "blue",  label: "En lote" },
  in_review: { tone: "yellow", label: "En revisión" },
  unpaid:    { tone: "red",   label: "Sin pago" },
  paid:      { tone: "amber", label: "Pagado" },
  delivered: { tone: "green", label: "Entregado" },
};

/* Map API ParkingRecordStatus → UI status key */
function apiStatusToUi(apiStatus) {
  switch (apiStatus) {
    case 'UNPAID':                return 'unpaid';
    case 'PAID':                  return 'paid';
    case 'FREE':                  return 'delivered';
    case 'PAYMENT_UNDER_REVIEW':  return 'in_review';
    default:                      return 'unpaid';
  }
}

/* Map UI status key → API ParkingRecordStatus */
function uiStatusToApi(uiStatus) {
  switch (uiStatus) {
    case 'unpaid':    return 'UNPAID';
    case 'paid':      return 'PAID';
    case 'delivered': return 'FREE';
    case 'in_review': return 'PAYMENT_UNDER_REVIEW';
    default:          return 'UNPAID';
  }
}

/* Next valid action(s) for a given UI status (used by attendant) */
function nextActions(status) {
  if (status === 'unpaid')    return [{ id: 'paid',      label: 'Registrar pago' }];
  if (status === 'paid')      return [{ id: 'delivered', label: 'Entregar' }];
  return [];
}

/* Normalise a raw API ParkingRecord into the shape the UI components expect */
function normaliseRecord(r) {
  return {
    id:       r.id,
    plate:    r.plate     || '',
    brand:    r.brand     || '',
    model:    r.model     || '',
    color:    r.color     || '',
    ownerId:  r.ownerId   || '',
    ownerName: r.owner?.name || r.registerRecord?.name || '',
    ownerIdNumber: r.owner?.idNumber || r.registerRecord?.idNumber || '',
    ticketNumber: r.ticketNumber ?? null,
    titular: r.owner?.name || '',
    valet:    r.checkInValet?.name || r.registerRecord?.name || '—',
    valetId:  r.checkInValet?.id || null,
    checkIn:  r.checkInAt ? new Date(r.checkInAt).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—',
    status:   apiStatusToUi(r.status),
    hasOpenRequest: (r.vehicleRequests?.length ?? 0) > 0,
    _raw:     r,
  };
}

/* ── Provider ──────────────────────────────────────────────────────────────
   Kept minimal — screens manage their own API fetching.
   The provider exists so VehicleRow (in ui.jsx) can still call nextActions
   and STATUS_META without importing from store directly via context. */

function VehicleStoreProvider({ children }) {
  return (
    <VehicleStoreContext.Provider value={{}}>
      {children}
    </VehicleStoreContext.Provider>
  );
}

function useVehicleStore() {
  const ctx = React.useContext(VehicleStoreContext);
  if (ctx === null) throw new Error('useVehicleStore must be used inside <VehicleStoreProvider>');
  return ctx;
}

export { VehicleStoreProvider, useVehicleStore, STATUS_META, nextActions, apiStatusToUi, uiStatusToApi, normaliseRecord };
