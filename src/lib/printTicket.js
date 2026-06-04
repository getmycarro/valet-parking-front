const STATUS_LABELS = {
  in_lot: 'En lote', in_review: 'En revisión',
  unpaid: 'Sin pago', paid: 'Pagado', delivered: 'Entregado',
};

export function generateTicketHTML(vehicle) {
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
