export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token } = req.body;
  try {
    const r = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: 'null'
    });
    if (!r.ok) return res.json({ ok: false, error: 'Token inválido o sin permisos.' });
    const d = await r.json();
    res.json({ ok: true, name: d.name.display_name });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
}
