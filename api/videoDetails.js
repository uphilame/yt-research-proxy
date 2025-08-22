import { yt, ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { videoId } = req.query;
    if (!videoId) return ok(res, { error: "Missing videoId" }, 400);
    const part = "snippet,statistics,contentDetails,topicDetails";
    ok(res, await yt("videos", { part, id: videoId, maxResults: 1 }, process.env.YOUTUBE_API_KEY));
  } catch (e) { err(res, e); }
}
