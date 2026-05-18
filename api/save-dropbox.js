export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, path, data } = req.body;

  try {
    const buffer = Buffer.from(data, 'base64');
    const r = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', autorename: false }),
        'Content-Type': 'application/octet-stream'
      },
      body: buffer
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: err });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
