// Helper umum
const CORS = {
  "Access-Control-Allow-Origin": "https://chat.openai.com",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
};

function setCors(res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
}

async function yt(endpoint, params, key) {
  const qs = new URLSearchParams({ ...params, key }).toString();
  const r = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function ok(res, data, status = 200) {
  setCors(res);
  res.status(status).json(data);
}

function err(res, e, status = 500) {
  setCors(res);
  res.status(status).json({ error: e.message || String(e) });
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") { setCors(res); res.status(204).end(); return true; }
  return false;
}

export { CORS, setCors, yt, ok, err, handleOptions };
