// /api/findChannels.js
export default async function handler(req, res) {
  try {
    const {
      q = "",
      regions = "US,BR,MX,GB,DE,FR,ES,IT,NL,PL,PT,TR,UA,IN,ID,PH,TH,VN,JP,KR,CA,AU,NZ",
      limitPerRegion = "8",
      minSubs = "1000",
      maxSubs = "2000",
      minAvgViews = "1000",
      minPctOver1k = "0.6",
      langMap = "",
      linksOnly = "false",
    } = req.query;

    const kwList = q.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    const regionList = regions.split(",").map(s => s.trim()).filter(Boolean);

    const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
    const mapLang = {};
    if (langMap) langMap.split(",").forEach(p => { const [cc, lg] = p.split("="); if (cc && lg) mapLang[cc.toUpperCase()] = lg.trim(); });

    const cand = new Map(); // channelId -> sampleUrl
    for (const kw of kwList) {
      for (const cc of regionList) {
        const url = new URL(`${host}/api/searchTop`);
        url.searchParams.set("q", kw);
        url.searchParams.set("region", cc);
        url.searchParams.set("limit", String(limitPerRegion));
        url.searchParams.set("slim", "0");
        const lang = mapLang[cc.toUpperCase()]; if (lang) url.searchParams.set("lang", lang);
        let data;
        try {
          const r = await fetch(url); data = await r.json();
        } catch {}
        if (!data || !Array.isArray(data.items)) continue;
        for (const it of data.items) {
          const views = Number(it?.statistics?.viewCount ?? it?.views ?? 0);
          const chId = it?.snippet?.channelId;
          const vurl = it?.url || (it?.id ? `https://www.youtube.com/watch?v=${it.id}` : null);
          if (views >= 1000 && chId) if (!cand.has(chId)) cand.set(chId, vurl);
        }
      }
    }

    const minS = +minSubs, maxS = +maxSubs, minAvg = +minAvgViews, minPct = +minPctOver1k;
    const results = [];
    for (const [chId, sampleUrl] of cand) {
      // channel
      let ch; try {
        const r = await fetch(`${host}/api/channel?channelId=${chId}`); ch = await r.json();
      } catch { continue; }
      const subs = Number(ch?.statistics?.subscriberCount ?? 0);
      const hidden = Boolean(ch?.statistics?.hiddenSubscriberCount);
      if (hidden || subs < minS || subs > maxS) continue;

      // latest
      let latest; try {
        const r = await fetch(`${host}/api/videosLatest?channelId=${chId}&limit=8&slim=1`); latest = await r.json();
      } catch { continue; }
      const arr = (latest?.items || []).map(x => Number(x?.views ?? x?.statistics?.viewCount ?? 0)).filter(Number.isFinite);
      if (arr.length < 5) continue;
      const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
      const pct = arr.filter(v=>v>=1000).length/arr.length;

      if (avg >= minAvg && pct >= minPct) {
        const handle = ch?.snippet?.customUrl || ch?.snippet?.handle;
        const url = handle ? (handle.startsWith("@") ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/${handle}`) : `https://www.youtube.com/channel/${chId}`;
        results.push({ channelId: chId, title: ch?.snippet?.title || "Not found", url, subscribers: subs, avgViews8: Math.round(avg), pctOver1k: Math.round(pct*100), sampleVideo: sampleUrl || "Not found" });
      }
    }
    results.sort((a,b)=>b.avgViews8 - a.avgViews8);

    if (String(linksOnly) === "true") {
      res.setHeader("Content-Type","text/plain; charset=utf-8");
      res.status(200).send(results.map(r=>r.url).join("\n") || "No matches");
    } else {
      res.status(200).json({ count: results.length, results, links: results.map(r=>r.url) });
    }
  } catch (e) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
}
