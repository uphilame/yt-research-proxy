import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const base = `${proto}://${host}`;
    const spec = {
      openapi: "3.0.1",
      info: { title: "YouTube Research Proxy", version: "1.0.0" },
      servers: [{ url: base }],
      paths: {
        "/api/resolveHandle": {
          get: {
            summary: "Resolve @handle/name to channelId",
            parameters: [{ in: "query", name: "handle", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/channel": {
          get: {
            summary: "Get channel details",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/videosPopular": {
          get: {
            summary: "Top videos by views",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/videosLatest": {
          get: {
            summary: "Latest videos by date",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/searchTop": {
          get: {
            summary: "Top search results for a keyword (regional)",
            parameters: [
              { in: "query", name: "q", required: true, schema: { type: "string" } },
              { in: "query", name: "region", required: false, schema: { type: "string", default: "US" } }
            ],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/videoDetails": {
          get: {
            summary: "Get details for a specific video",
            parameters: [{ in: "query", name: "videoId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/channelPlaylists": {
          get: {
            summary: "List playlists for a channel",
            parameters: [
              { in: "query", name: "channelId", required: true, schema: { type: "string" } },
              { in: "query", name: "maxResults", required: false, schema: { type: "integer", default: 25 } }
            ],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/privacy": {
          get: {
            summary: "Privacy policy HTML page",
            responses: { "200": { description: "OK (text/html)" } }
          }
        }
      }
    };
    ok(res, spec);
  } catch (e) { err(res, e); }
}
