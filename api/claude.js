export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt, code } = req.body || {};
  if (process.env.APP_CODE && code !== process.env.APP_CODE) return res.status(401).json({ error: "Código de acceso incorrecto." });
  if (!prompt || prompt.length > 150000) return res.status(400).json({ error: "Texto vacío o demasiado largo." });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || "Error de la API." });
    res.json({ text: d.content.map(c => c.text || "").join("") });
  } catch (e) { res.status(500).json({ error: "Error del servidor." }); }
}
