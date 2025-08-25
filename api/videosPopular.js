import { ok, err, handleOptions } from "./_utils.js";
import { ytFetchV3 } from "./_ytFetch.js";
import { setCacheHeader, getFromMem, setToMem } from "./_cache.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { channelId, limit = "8", slim = "1" } = req.query;
    if (!channelId) return ok(res, { error: "Missing channelId" }, 400);

    const key = `videosPopular:${channelId}|${limit}|${slim}`;
    const cached = getFromMem(key);
    if (cached) { setCacheHeader(res, 600, 86400); return ok(res, cached); }

    // 1) Ambil daftar video teratas (approx) berdasarkan viewCount
    const search = await ytFetchV3("search", {
      part: "snippet",
      channelId,
      type: "video",
      order: "viewCount",
      maxResults: Math.min(+limit || 8, 15)
    });

    const ids = (search.items || []).map(it => it.id?.videoId).filter(Boolean);
    let videos = { items: [] };
    if (ids.length) {
      // 2) Ambil statistik videonya
      videos = await ytFetchV3("videos", {
        part: "snippet,statistics,contentDetails",
        id: ids.join(",")
      });
    }

    const resp = (slim === "1")
      ? {
          items: (videos.items || []).map(v => ({
            videoId: v.id,
            title: v.snippet?.title,
            publishedAt: v.snippet?.publishedAt,
            views: Number(v.statistics?.viewCount || 0),
            channelTitle: v.snippet?.channelTitle,
            url: `https://www.youtube.com/watch?v=${v.id}`,
            thumb:
              v.snippet?.thumbnails?.maxres?.url ||
              v.snippet?.thumbnails?.high?.url ||
              v.snippet?.thumbnails?.medium?.url ||
              v.snippet?.thumbnails?.default?.url
          }))
        }
      : { search, videos };

    setToMem(key, resp, 600);         // cache mem 10 menit
    setCacheHeader(res, 600, 86400);  // CDN cache
    ok(res, resp);
  } catch (e) {
    err(res, e);
  }
}
