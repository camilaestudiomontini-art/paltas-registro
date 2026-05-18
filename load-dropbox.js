import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, path } = req.body;

  try {
    const r = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Dropbox-API-Arg': JSON.stringify({ path })
      }
    });

    if (!r.ok) return res.json({ records: null });

    const arrayBuffer = await r.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (data.length <= 1) return res.json({ records: [] });

    const records = data.slice(1).filter(row => row[0]).map(row => ({
      fecha: row[0] || '',
      tipo: row[1] || '',
      lote: row[2] || '',
      productor: row[3] || '',
      cajas: row[4] || null,
      bandejas: row[5] || null,
      kg: row[6] || null,
      descarte_kg: row[7] || null,
      notas: row[8] || ''
    }));

    res.json({ records });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
