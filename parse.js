export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Extraé los registros de producción/recepción/envío de paltas de este mensaje de WhatsApp.
Devolvé SOLO un array JSON sin texto adicional ni backticks.

Cada registro debe tener:
- fecha: "DD/MM/YYYY" (si falta el año, usá 2025)
- tipo: "Recepcion" | "Produccion" | "Envio"
- lote: número de lote como string (ej: "3")
- productor: nombre del productor/campo (ej: "Zelarayan")
- cajas: número entero o null
- bandejas: número entero o null
- kg: número decimal o null
- descarte_kg: número decimal o null
- notas: string vacío si no hay

Mensaje:
${message}

Respondé SOLO con el JSON array.`
        }]
      })
    });

    const d = await r.json();
    const text = d.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const records = JSON.parse(clean);
    res.json({ records });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
