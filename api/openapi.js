// api/openapi.js
import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    // >>> GANTI DENGAN DOMAIN VERCEL KAMU (tanpa slash akhir)
    const BASE = "https://YOUR-APP.vercel.app";

    const spec = {
      openapi: "3.1.0",
      info: {
        title: "YouTube Research Proxy",
        version: "1.0.0",
        description:
          "Read-only proxy for the YouTube Data API v3. Used by a Custom GPT via Actions to fetch channel, video and search data."
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
                    schema: { $ref: "#/components/schemas/ResolveHandleResponse" }
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
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ChannelsListResponse" }
                  }
                }
              }
            }
          }
        },

        "/api/videosPopular": {
          get: {
            operationId: "getVideosPopular",
            summary: "Top videos by views for a channel",
            parameters: [
              { in: "query", name: "channelId", required: true, schema: { type: "string" } }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchAndVideosWrapper" }
                  }
                }
              }
            }
          }
        },

        "/api/videosLatest": {
          get: {
            operationId: "getVideosLatest",
            summary: "Latest videos by date for a channel",
            parameters: [
              { in: "query", name: "channelId", required: true, schema: { type: "string" } }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchAndVideosWrapper" }
                  }
                }
              }
            }
          }
        },

        "/api/searchTop": {
          get: {
            operationId: "searchTop",
            summary: "Top search results for a keyword (regional)",
            parameters: [
              { in: "query", name: "q", required: true, schema: { type: "string" } },
              {
                in: "query",
                name: "region",
                required: false,
                schema: { type: "string", default: "US" },
                description: "ISO 3166-1 alpha-2 (e.g., US, BR, ID)"
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchAndVideosWrapper" }
                  }
                }
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
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/VideosListResponse" }
                  }
                }
              }
            }
          }
        },

        "/api/channelPlaylists": {
          get: {
            operationId: "getChannelPlaylists",
            summary: "List playlists for a channel",
            parameters: [
              { in: "query", name: "channelId", required: true, schema: { type: "string" } },
              { in: "query", name: "maxResults", required: false, schema: { type: "integer", default: 25 } }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/PlaylistsListResponse" }
                  }
                }
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
                content: { "text/html": { schema: { type: "string" } } }
              }
            }
          }
        }
      },

      components: {
        schemas: {
          // ---------- Basic building blocks ----------
          YouTubeSnippet: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              channelId: { type: "string" },
              channelTitle: { type: "string" },
              publishedAt: { type: "string" },
              thumbnails: { type: "object" }
            },
            additionalProperties: true
          },
          YouTubeStatistics: {
            type: "object",
            properties: {
              viewCount: { type: "string" },
              likeCount: { type: "string" }
            },
            additionalProperties: true
          },
          YouTubeContentDetails: {
            type: "object",
            properties: { duration: { type: "string" } },
            additionalProperties: true
          },

          // ---------- Search ----------
          SearchItem: {
            type: "object",
            properties: {
              id: {
                type: "object",
                properties: { videoId: { type: "string" }, channelId: { type: "string" } },
                additionalProperties: true
              },
              snippet: { $ref: "#/components/schemas/YouTubeSnippet" }
            },
            additionalProperties: true
          },
          SearchListResponse: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/SearchItem" } }
            },
            additionalProperties: true
          },

          // ---------- Videos ----------
          VideoItem: {
            type: "object",
            properties: {
              id: { type: "string" },
              snippet: { $ref: "#/components/schemas/YouTubeSnippet" },
              statistics: { $ref: "#/components/schemas/YouTubeStatistics" },
              contentDetails: { $ref: "#/components/schemas/YouTubeContentDetails" },
              topicDetails: { type: "object", additionalProperties: true }
            },
            additionalProperties: true
          },
          VideosListResponse: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/VideoItem" } }
            },
            additionalProperties: true
          },

          // ---------- Channels ----------
          ChannelItem: {
            type: "object",
            properties: {
              id: { type: "string" },
              snippet: {
                allOf: [
                  { $ref: "#/components/schemas/YouTubeSnippet" },
                  { type: "object", properties: { country: { type: "string" } }, additionalProperties: true }
                ]
              },
              brandingSettings: { type: "object", additionalProperties: true },
              statistics: { $ref: "#/components/schemas/YouTubeStatistics" },
              contentDetails: { type: "object", additionalProperties: true }
            },
            additionalProperties: true
          },
          ChannelsListResponse: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/ChannelItem" } }
            },
            additionalProperties: true
          },

          // ---------- Playlists ----------
          PlaylistItem: {
            type: "object",
            properties: {
              id: { type: "string" },
              snippet: { $ref: "#/components/schemas/YouTubeSnippet" },
              contentDetails: { type: "object", additionalProperties: true }
            },
            additionalProperties: true
          },
          PlaylistsListResponse: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/PlaylistItem" } }
            },
            additionalProperties: true
          },

          // ---------- Wrappers ----------
          SearchAndVideosWrapper: {
            type: "object",
            properties: {
              search: { $ref: "#/components/schemas/SearchListResponse" },
              videos: { $ref: "#/components/schemas/VideosListResponse" }
            }
          },

          // ---------- Resolve handle ----------
          ResolveHandleResponse: {
            type: "object",
            properties: {
              channelId: { type: ["string", "null"] },
              raw: { $ref: "#/components/schemas/SearchListResponse" }
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
