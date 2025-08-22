import { yt, ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId, maxResults = 25 } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);
    ok(res, await yt("playlists", { part: "snippet,contentDetails", channelId, maxResults }, process.env.YOUTUBE_API_KEY));
  } catch (e) { err(res, e); }
}
