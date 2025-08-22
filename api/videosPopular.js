import { yt, ok, err, handleOptions } from "./_utils.js";

async function withStats(searchRes, key) {
  const ids = (searchRes.items || []).map(i => i.id?.videoId).filter(Boolean);
  if (!ids.length) return { search: searchRes, videos: { items: [] } };
  const stats = await yt("videos", { part: "statistics,snippet,contentDetails", id: ids.join(","), maxResults: 50 }, key);
  return { search: searchRes, videos: stats };
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);
    const key = process.env.YOUTUBE_API_KEY;
    const r = await yt("search", { part: "snippet", channelId, order: "viewCount", maxResults: 15, type: "video" }, key);
    ok(res, await withStats(r, key));
  } catch (e) { err(res, e); }
}
