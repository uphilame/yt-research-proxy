// api/openapi.js
import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    // >>> GANTI DENGAN DOMAIN VERCEL KAMU (tanpa slash di akhir)
    const BASE = "https://yt-research-proxy.vercel.app";

    const spec = {
      openapi: "3.1.0",
      info: {
        title: "YouTube Research Proxy",
        version: "1.0.0",
        description:
          "Read-only proxy for the YouTube Data API v3, used by a Custom GPT via Actions to fetch channel, video, and search data."
      },
      servers: [{ url: BASE }],
      paths: {
        "/api/resolveHandle": {
          get: {
            operationId: "resolveHandle",
            summary: "Resolve @handle/name to channelId",
            parameters: [
              {
                in: "query",
                name: "handle",
                required: true,
                schema: { type: "string" },
                description: "Channel handle (e.g. @GoogleDevelopers) or channel name"
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        channelId: { type: ["string", "null"] },
                        raw: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/api/channel": {
          get: {
            operationId: "getChannel",
            summary: "Get channel details",
            parameters: [
              {
                in: "query",
                name: "channelId",
                required: true,
                schema: { type: "string" },
                description: "YouTube channel ID (starts with UC...)"
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/videosPopular": {
          get: {
            operationId: "getVideosPopular",
            summary: "Top videos by views for a channel",
            parameters: [
              {
                in: "query",
                name: "channelId",
                required: true,
                schema: { type: "string" }
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/videosLatest": {
          get: {
            operationId: "getVideosLatest",
            summary: "Latest videos by date for a channel",
            parameters: [
              {
                in: "query",
                name: "channelId",
                required: true,
                schema: { type: "string" }
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/searchTop": {
          get: {
            operationId: "searchTop",
            summary: "Top search results for a keyword (regional)",
            parameters: [
              {
                in: "query",
                name: "q",
                required: true,
                schema: { type: "string" },
                description: "Search keyword/topic"
              },
              {
                in: "query",
                name: "region",
                required: false,
                schema: { type: "string", default: "US" },
                description: "ISO 3166-1 alpha-2 country code (e.g., US, BR, ID)"
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/videoDetails": {
          get: {
            operationId: "getVideoDetails",
            summary: "Get details for a specific video",
            parameters: [
              {
                in: "query",
                name: "videoId",
                required: true,
                schema: { type: "string" },
                description: "YouTube video ID (e.g., dQw4w9WgXcQ)"
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/channelPlaylists": {
          get: {
            operationId: "getChannelPlaylists",
            summary: "List playlists for a channel",
            parameters: [
              {
                in: "query",
                name: "channelId",
                required: true,
                schema: { type: "string" }
              },
              {
                in: "query",
                name: "maxResults",
                required: false,
                schema: { type: "integer", default: 25 }
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: { "application/json": { schema: { type: "object" } } }
              }
            }
          }
        },

        "/api/privacy": {
          get: {
            operationId: "getPrivacy",
            summary: "Privacy policy HTML page",
            responses: {
              "200": {
                description: "OK (text/html)",
                content: {
                  "text/html": { schema: { type: "string" } }
                }
              }
            }
          }
        }
      }
    };

    ok(res, spec);
  } catch (e) {
    err(res, e);
  }
}
