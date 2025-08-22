import { yt, ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { handle = "" } = req.query;
    if (!handle) return ok(res, { error: "Missing handle" }, 400);

    // Terima @handle, nama channel, atau frasa; kembalikan channelId pertama
    const q = handle.startsWith("@") ? handle.slice(1) : handle;
    const s = await yt("search", { part: "snippet", q, type: "channel", maxResults: 1 }, process.env.YOUTUBE_API_KEY);
    const channelId = s.items?.[0]?.snippet?.channelId || null;
    ok(res, { channelId, raw: s });
  } catch (e) { err(res, e); }
}
