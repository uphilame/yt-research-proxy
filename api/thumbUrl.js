import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const { videoId } = req.query;
    if (!videoId) return ok(res, { error: "Missing videoId" }, 400);
    const base = `https://img.youtube.com/vi/${videoId}`;
    ok(res, {
      videoId,
      thumbMax: `${base}/maxresdefault.jpg`,
      thumbHQ:  `${base}/hqdefault.jpg`
    });
  } catch (e) { err(res, e); }
}
