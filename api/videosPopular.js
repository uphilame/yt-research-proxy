import { yt, ok, err, handleOptions } from "./_utils.js";

function pickThumb(t) {
  return t?.maxres?.url || t?.high?.url || t?.medium?.url || t?.default?.url || null;
}

function slimVideos(wrapped) {
  const items = wrapped.videos?.items || [];
  return items.map(v => ({
    videoId: v.id,
    title: v.snippet?.title,
    publishedAt: v.snippet?.publishedAt,
    views: Number(v.statistics?.viewCount || 0),
    channelTitle: v.snippet?.channelTitle,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    thumb: pickThumb(v.snippet?.thumbnails) // NEW
  }));
}

async function withStats(searchRes, key) {
  const ids = (searchRes.items || []).map(i => i.id?.videoId).filter(Boolean);
  if (!ids.length) return { search: searchRes, videos: { items: [] } };
  const stats = await yt("videos", {
    part: "statistics,snippet,contentDetails",
    id: ids.join(","),
    maxResults: 50
  }, key);
  return { search: searchRes, videos: stats };
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId, limit = "12", slim = "1" } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);
    const key = process.env.YOUTUBE_API_KEY;
    const maxResults = Math.min(Math.max(parseInt(limit, 10) || 12, 3), 15);

    const r = await yt("search", {
      part: "snippet",
      channelId,
      order: "viewCount",
      maxResults,
      type: "video"
    }, key);

    const out = await withStats(r, key);
    if (slim === "1") return ok(res, { items: slimVideos(out) });
    ok(res, out);
  } catch (e) { err(res, e); }
}
