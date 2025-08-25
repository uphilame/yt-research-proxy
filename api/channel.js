import { ok, err, handleOptions } from "./_utils.js";
import { ytFetchV3 } from "./_ytFetch.js";
import { setCacheHeader, getFromMem, setToMem } from "./_cache.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);

    // Cache key per channel
    const key = `channel:${channelId}`;

    // In-memory cache (per instance)
    const cached = getFromMem(key);
    if (cached) { setCacheHeader(res, 1800, 86400); return ok(res, cached); }

    // Ambil dari YouTube Data API v3 dengan rotasi key otomatis
    const part = "snippet,brandingSettings,statistics,contentDetails";
    const ch = await ytFetchV3("channels", { part, id: channelId, maxResults: 1 });

    // Simpan ke mem-cache & set header CDN cache
    setToMem(key, ch, 1800);          // 30 menit
    setCacheHeader(res, 1800, 86400); // s-maxage=30m, stale-while-revalidate=24h

    ok(res, ch);
  } catch (e) {
    err(res, e);
  }
}
