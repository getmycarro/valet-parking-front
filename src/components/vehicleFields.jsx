import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

/* Shared vehicle data entry: plate / color / brand / model.
   Used by the check-in modal (RegisterVehicleModal) and the client-detail
   "Agregar vehículo" modal (AddVehicleModal) so both stay identical. */

export const CAR_COLORS = [
  { label: 'Blanco',    hex: '#FFFFFF' },
  { label: 'Negro',     hex: '#111111' },
  { label: 'Gris',      hex: '#6B7280' },
  { label: 'Plata',     hex: '#C0C0C0' },
  { label: 'Rojo',      hex: '#EF4444' },
  { label: 'Azul',      hex: '#3B82F6' },
  { label: 'Azul osc.', hex: '#1E3A5F' },
  { label: 'Verde',     hex: '#22C55E' },
  { label: 'Amarillo',  hex: '#EAB308' },
  { label: 'Naranja',   hex: '#F97316' },
  { label: 'Marrón',    hex: '#92400E' },
  { label: 'Beige',     hex: '#D4B896' },
  { label: 'Vino',      hex: '#7F1D1D' },
];

export function plateHasMinLetters(plate) {
  return ((plate || '').match(/[a-zA-Z]/g) || []).length >= 2;
}

const selectStyle = (filled) => ({
  background: 'var(--slate-800)', border: '1px solid var(--slate-700)', borderRadius: 8,
  color: filled ? '#fff' : 'var(--slate-400)', padding: '10px 12px', width: '100%',
  fontFamily: 'inherit', fontSize: 14,
});

export function VehicleFields({ value, onChange, onInteract, requireBrand = false }) {
  const [carBrands, setCarBrands] = useState([]);
  const [brandKey, setBrandKey] = useState('');   // '' | brand.name | '__manual__'
  const [modelKey, setModelKey] = useState('');   // '' | model.name | '__manual__'

  useEffect(() => {
    api.get('/car-brands')
      .then(res => setCarBrands(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setCarBrands([]));
  }, []);

  const touch = () => { onInteract?.(); };
  const patch = (next) => { touch(); onChange({ ...value, ...next }); };

  const handleBrandChange = (val) => {
    if (val === '__manual__') {
      setBrandKey('__manual__');
      setModelKey('__manual__');
      patch({ brand: '', model: '' });
    } else {
      setBrandKey(val);
      setModelKey('');
      patch({ brand: val, model: '' });
    }
  };

  const handleModelChange = (val) => {
    if (val === '__manual__') {
      setModelKey('__manual__');
      patch({ model: '' });
    } else {
      setModelKey(val);
      patch({ model: val });
    }
  };

  const selectedBrandObj = carBrands.find(b => b.name === brandKey);
  const availableModels = selectedBrandObj ? selectedBrandObj.models : [];

  const plateInvalid = value.plate.trim().length > 0 && !plateHasMinLetters(value.plate);
  const isKnownColor = !!CAR_COLORS.find(c => c.label === value.color);

  return (
    <div className="grid-2" style={{ gap: 12 }}>
      <div className="field"><label>Placa</label>
        <input
          value={value.plate}
          onChange={e => patch({ plate: e.target.value.toUpperCase() })}
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

      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label>Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 6 }}>
          {CAR_COLORS.map(c => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => patch({ color: c.label })}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: value.color === c.label ? '3px solid #60A5FA' : '2px solid var(--slate-600)',
                background: c.hex, cursor: 'pointer', flexShrink: 0,
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => patch({ color: '' })}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--slate-600)', background: 'transparent', color: 'var(--slate-300)', cursor: 'pointer' }}
          >
            Otro
          </button>
        </div>
        {value.color && isKnownColor && (
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 4 }}>
            Seleccionado: <strong style={{ color: 'var(--slate-200)' }}>{value.color}</strong>
          </div>
        )}
        {(!value.color || !isKnownColor) && (
          <input
            value={value.color}
            onChange={e => patch({ color: e.target.value })}
            placeholder="Escribe el color"
            style={{ marginTop: 4 }}
          />
        )}
      </div>

      {/* MARCA */}
      <div className="field">
        <label>Marca</label>
        {carBrands.length > 0 && brandKey !== '__manual__' ? (
          <select
            value={brandKey}
            onChange={e => handleBrandChange(e.target.value)}
            style={selectStyle(!!brandKey)}
          >
            <option value="">— Selecciona una marca —</option>
            {carBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            <option value="__manual__">Otra marca…</option>
          </select>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={value.brand}
              onChange={e => patch({ brand: e.target.value })}
              placeholder="Escribe la marca"
              style={{ flex: 1 }}
              required={requireBrand}
            />
            {carBrands.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setBrandKey(''); setModelKey(''); patch({ brand: '', model: '' }); }}
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
            style={selectStyle(!!modelKey)}
          >
            <option value="">— Selecciona un modelo —</option>
            {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            <option value="__manual__">Otro modelo…</option>
          </select>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={value.model}
              onChange={e => patch({ model: e.target.value })}
              placeholder="Escribe el modelo"
              style={{ flex: 1 }}
            />
            {brandKey && brandKey !== '__manual__' && availableModels.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setModelKey(''); patch({ model: '' }); }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Ver lista
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
