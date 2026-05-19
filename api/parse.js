export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message } = req.body;
  try {
    const records = parsearMensaje(message);
    res.json({ records });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function parsearMensaje(texto) {
  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const records = [];
  const esDespacho = lineas.some(l => /despacho/i.test(l));
  const esRecepcion = lineas.some(l => /recepci[oó]n/i.test(l));
  const esProduccion = lineas.some(l => /producci[oó]n/i.test(l));
  if (esDespacho) parsearDespacho(lineas, records);
  else if (esRecepcion) parsearRecepcion(lineas, records);
  else if (esProduccion) parsearProduccion(lineas, records);
  return records;
}

function extraerFecha(lineas) {
  for (const l of lineas) {
    const m = l.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
    if (m) { let f = m[1]; if (!f.match(/\/\d{4}$/)) f += '/2025'; return f; }
  }
  return '';
}

function extraerLote(lineas) {
  for (const l of lineas) {
    const m = l.match(/lote\s+nro\s+(\d+)/i);
    if (m) return m[1];
  }
  return '';
}

function parsearProduccion(lineas, records) {
  const lote = extraerLote(lineas);
  const fecha = extraerFecha(lineas);
  let productor = '', cajas = null, descarte_kg = null;
  for (const l of lineas) {
    if (/producci[oó]n|lote\s+nro/i.test(l)) continue;
    if (/descarte/i.test(l)) {
      const m = l.match(/([\d.,]+)\s*kg/i);
      if (m) descarte_kg = parseFloat(m[1].replace(',', '.'));
      continue;
    }
    const mCajas = l.match(/^(\d+)\s+cajas?$/i);
    if (mCajas) { cajas = parseInt(mCajas[1]); continue; }
    if (!productor && l.length > 0 && !/^\d/.test(l)) productor = l;
  }
  records.push({ fecha, tipo: 'Produccion', lote, productor, cajas, bandejas: null, kg: null, descarte_kg, notas: '' });
}

function parsearRecepcion(lineas, records) {
  const lote = extraerLote(lineas);
  const fecha = extraerFecha(lineas);
  let productor = '', bandejas = null, kg = null;
  for (const l of lineas) {
    if (/recepci[oó]n|lote\s+nro/i.test(l)) continue;
    if (/\d{1,2}\/\d{1,2}/.test(l)) continue;
    const mBand = l.match(/^(\d+)\s+bandejas?$/i);
    if (mBand) { bandejas = parseInt(mBand[1]); continue; }
    const mKg = l.match(/^([\d.,]+)\s*kg$/i);
    if (mKg) { kg = parseFloat(mKg[1].replace(',', '.')); continue; }
    if (!productor && l.length > 0 && !/^\d/.test(l)) productor = l;
  }
  records.push({ fecha, tipo: 'Recepcion', lote, productor, cajas: null, bandejas, kg, descarte_kg: null, notas: '' });
}

function parsearDespacho(lineas, records) {
  const fecha = extraerFecha(lineas);
  let destinoActual = '';
  for (const l of lineas) {
    if (/despacho/i.test(l) || /\d{1,2}\/\d{1,2}/.test(l)) continue;
    const mPallet = l.match(/pallets?\s+nro\s+(\d+)\s+cal\s+([^\s]+)\s+x\s+(\d+)\s+cajas?\s*(.*)/i);
    if (mPallet) {
      records.push({
        fecha, tipo: 'Envio', lote: mPallet[1], productor: destinoActual,
        cajas: parseInt(mPallet[3]), bandejas: null, kg: null, descarte_kg: null,
        notas: `Calibre ${mPallet[2]}${mPallet[4].trim() ? ' · ' + mPallet[4].trim() : ''}`
      });
      continue;
    }
    if (l.length > 0 && !/^\d/.test(l)) destinoActual = l;
  }
}
