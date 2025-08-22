import { yt, ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);
    const part = "snippet,brandingSettings,statistics,contentDetails";
    const ch = await yt("channels", { part, id: channelId, maxResults: 1 }, process.env.YOUTUBE_API_KEY);
    ok(res, ch);
  } catch (e) { err(res, e); }
}
