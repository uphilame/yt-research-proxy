import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    // >>> GANTI DENGAN DOMAIN VERCEL KAMU <<<
    const BASE = "https://yt-research-proxy.vercel.app";

    const spec = {
      openapi: "3.0.1",
      info: { title: "YouTube Research Proxy", version: "1.0.0" },
      servers: [{ url: BASE }], // HARDCODE: tidak ambil dari header
      paths: {
        "/api/resolveHandle": {
          get: {
            summary: "Resolve @handle/name to channelId",
            operationId: "resolveHandle",
            parameters: [{ in: "query", name: "handle", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/channel": {
          get: {
            summary: "Get channel details",
            operationId: "getChannel",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/videosPopular": {
          get: {
            summary: "Top videos by views",
            operationId: "getVideosPopular",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/videosLatest": {
          get: {
            summary: "Latest videos by date",
            operationId: "getVideosLatest",
            parameters: [{ in: "query", name: "channelId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/searchTop": {
          get: {
            summary: "Top search results for a keyword (regional)",
            operationId: "searchTop",
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
            operationId: "getVideoDetails",
            parameters: [{ in: "query", name: "videoId", required: true, schema: { type: "string" } }],
            responses: { "200": { description: "OK" } }
          }
        },
        "/api/channelPlaylists": {
          get: {
            summary: "List playlists for a channel",
            operationId: "getChannelPlaylists",
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
            operationId: "getPrivacy",
            responses: { "200": { description: "OK (text/html)" } }
          }
        }
      }
    };

    ok(res, spec);
  } catch (e) { err(res, e); }
}
