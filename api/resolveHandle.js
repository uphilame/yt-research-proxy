import { ok, err, handleOptions } from "./_utils.js";
import { ytFetchV3 } from "./_ytFetch.js";
import { setCacheHeader, getFromMem, setToMem } from "./_cache.js";

function extractFromUrl(s) {
  try {
    const u = new URL(s);
    const p = u.pathname.replace(/\/+$/, "");
    // /channel/UCxxxxx
    const mCh = p.match(/\/channel\/(UC[0-9A-Za-z_-]{20,})/);
    if (mCh) return { channelId: mCh[1] };
    // /@handle
    const mHandle = p.match(/\/@([A-Za-z0-9._-]+)/);
    if (mHandle) return { handle: "@" + mHandle[1] };
    // /user/legacy  or /c/custom
    const mUser = p.match(/\/user\/([^/]+)/);
    if (mUser) return { legacyUser: mUser[1] };
    const mCustom = p.match(/\/c\/([^/]+)/);
    if (mCustom) return { q: mCustom[1] };
  } catch {}
  return null;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    let { handle } = req.query;
    if (!handle) return ok(res, { channelId: null, raw: null }, 400);

    handle = handle.trim();

    // 1) Jika sudah channelId UC...
    if (/^UC[0-9A-Za-z_-]{20,}$/.test(handle)) {
      setCacheHeader(res, 86400, 86400);
      return ok(res, { channelId: handle, raw: null });
    }

    // 2) Jika URL youtube -> ekstrak
    const parsed = extractFromUrl(handle);
    if (parsed?.channelId) {
      setCacheHeader(res, 86400, 86400);
      return ok(res, { channelId: parsed.channelId, raw: null });
    }
    if (parsed?.handle) handle = parsed.handle;
    const q = parsed?.q || handle.replace(/^@/, "");

    // Cache key
    const key = `resolve:${q}`;
    const cached = getFromMem(key);
    if (cached) { setCacheHeader(res, 3600, 86400); return ok(res, cached); }

    // 3) Legacy username langsung coba channels.forUsername
    if (parsed?.legacyUser) {
      const r = await ytFetchV3("channels", {
        part: "id,snippet",
        forUsername: parsed.legacyUser,
        maxResults: 1
      });
      const ch = r?.items?.[0]?.id || null;
      const payload = { channelId: ch, raw: r || null };
      setToMem(key, payload, 3600);
      setCacheHeader(res, 3600, 86400);
      return ok(res, payload);
    }

    // 4) Search type=channel untuk @handle atau nama
    const search = await ytFetchV3("search", {
      part: "snippet",
      q,
      type: "channel",
      maxResults: 3
    });
    const channelId = search?.items?.[0]?.id?.channelId || null;

    const payload = { channelId, raw: search || null };
    setToMem(key, payload, 3600);       // cache 1 jam
    setCacheHeader(res, 3600, 86400);   // CDN
    ok(res, payload);
  } catch (e) {
    err(res, e);
  }
}
