// /api/findChannels.js
export default async function handler(req, res) {
  try {
    const {
      q = "",                         // "kw1;kw2;kw3" atau "kw1"
      regions = "US,BR,MX,GB,DE,FR,ES,IT,NL,PL,PT,TR,UA,IN,ID,PH,TH,VN,JP,KR,CA,AU,NZ",
      limitPerRegion = "8",
      minSubs = "1000",
      maxSubs = "2000",
      minAvgViews = "1000",
      minPctOver1k = "0.6",          // 60%
      langMap = "",                  // opsional: "US=en,BR=pt,MX=es,..."
      linksOnly = "false"
    } = req.query;

    const kwList = q.split(/[;|,]/).map(s => s.trim()).filter(Boolean);
    const regionList = regions.split(",").map(s => s.trim()).filter(Boolean);
    const minSubsN = Number(minSubs), maxSubsN = Number(maxSubs);
    const minAvgViewsN = Number(minAvgViews), minPctOver1kN = Number(minPctOver1k);

    const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

    const mapLang = {};
    if (langMap) {
      langMap.split(",").forEach(pair => {
        const [cc, lg] = pair.split("=").map(s => s.trim());
        if (cc && lg) mapLang[cc.toUpperCase()] = lg;
      });
    }

    // Step 1: kumpulkan kandidat channelId dari searchTop
    const candidate = new Map(); // channelId -> { sampleUrl }
    for (const kw of kwList) {
      for (const cc of regionList) {
        const lang = mapLang[cc.toUpperCase()];
        const url = new URL(`${host}/api/searchTop`);
        url.searchParams.set("q", kw);
        url.searchParams.set("region", cc);
        url.searchParams.set("limit", String(limitPerRegion));
        url.searchParams.set("slim", "0");
        if (lang) url.searchParams.set("lang", lang);

        let data;
        try {
          const r = await fetch(url, { headers: { "x-internal": "1" } });
          if (!r.ok) throw new Error(`searchTop ${cc} ${kw} ${r.status}`);
          data = await r.json();
        } catch {
          // retry fallback
          const url2 = new URL(url); url2.searchParams.set("limit", "5"); url2.searchParams.set("slim", "1");
          const r2 = await fetch(url2, { headers: { "x-internal": "1" } }).catch(() => null);
          data = r2 && r2.ok ? await r2.json() : null;
        }
        if (!data || !Array.isArray(data.items)) continue;

        for (const it of data.items) {
          const vidViews = Number(it?.statistics?.viewCount ?? it?.views ?? 0);
          if (vidViews >= 1000) {
            const chId = it?.snippet?.channelId;
            const urlVideo = it?.url || (it?.id ? `https://www.youtube.com/watch?v=${it.id}` : null);
            if (chId) {
              if (!candidate.has(chId)) candidate.set(chId, { sampleUrl: urlVideo });
            }
          }
        }
      }
    }

    // Step 2 & 3: filter berdasarkan subscriber & rata-rata views 8 video terbaru
    const results = [];
    for (const [channelId, meta] of candidate) {
      // getChannel
      const chUrl = new URL(`${host}/api/channel`);
      chUrl.searchParams.set("channelId", channelId);
      let ch;
      try {
        const r = await fetch(chUrl);
        if (!r.ok) throw new Error("channel");
        ch = await r.json();
      } catch { continue; }

      const subs = Number(ch?.statistics?.subscriberCount ?? 0);
      const hidden = Boolean(ch?.statistics?.hiddenSubscriberCount);
      if (hidden || !(subs >= minSubsN && subs <= maxSubsN)) continue;

      // videosLatest
      const vUrl = new URL(`${host}/api/videosLatest`);
      vUrl.searchParams.set("channelId", channelId);
      vUrl.searchParams.set("limit", "8");
      vUrl.searchParams.set("slim", "1");
      let latest;
      try {
        const r = await fetch(vUrl);
        if (!r.ok) throw new Error("videosLatest");
        latest = await r.json();
      } catch { continue; }

      const items = Array.isArray(latest?.items) ? latest.items : [];
      const viewsArr = items
        .map(x => Number(x?.statistics?.viewCount ?? x?.views ?? 0))
        .filter(v => Number.isFinite(v));

      if (viewsArr.length < 5) continue; // butuh minimal 5
      const avg = viewsArr.reduce((a, b) => a + b, 0) / viewsArr.length;
      const pctOver1k = viewsArr.filter(v => v >= 1000).length / viewsArr.length;

      if (avg >= minAvgViewsN && pctOver1k >= minPctOver1kN) {
        // bangun URL channel (handle kalau ada)
        const handle = ch?.snippet?.customUrl || ch?.snippet?.handle || null;
        const urlChannel = handle
          ? (handle.startsWith("@") ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/${handle}`)
          : `https://www.youtube.com/channel/${channelId}`;

        results.push({
          channelId,
          title: ch?.snippet?.title || "Not found",
          url: urlChannel,
          subscribers: subs,
          avgViews8: Math.round(avg),
          pctOver1k: Math.round(pctOver1k * 100),
          sampleVideo: meta.sampleUrl || "Not found"
        });
      }
    }

    results.sort((a, b) => b.avgViews8 - a.avgViews8);

    if (linksOnly === "true") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.status(200).send(results.map(r => r.url).join("\n") || "No matches");
      return;
    }

    res.status(200).json({
      count: results.length,
      results,
      links: results.map(r => r.url)
    });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
}
