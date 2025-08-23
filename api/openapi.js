// api/openapi.js
import { ok, err, handleOptions } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    // >>> GANTI JIKA PERLU (tanpa slash di akhir)
    const BASE = "https://yt-research-proxy.vercel.app";

    const spec = {
      openapi: "3.1.0",
      info: {
        title: "YouTube Research Proxy",
        version: "1.1.0",
        description:
          "Read-only proxy for YouTube Data API v3 used by a Custom GPT via Actions. Provides channel, video and keyword search data."
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
              { in: "query", name: "channelId", required: true, schema: { type: "string" } },
              {
                in: "query",
                name: "limit",
                required: false,
                schema: { type: "integer", minimum: 3, maximum: 15, default: 8 },
                description: "Number of results (3–15). Default 8."
              },
              {
                in: "query",
                name: "slim",
                required: false,
                schema: { type: "string", enum: ["0", "1"], default: "1" },
                description: "Return slim items only when set to '1'."
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        { $ref: "#/components/schemas/SearchAndVideosWrapper" },
                        { $ref: "#/components/schemas/SlimVideoList" }
                      ]
                    }
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
              { in: "query", name: "channelId", required: true, schema: { type: "string" } },
              {
                in: "query",
                name: "limit",
                required: false,
                schema: { type: "integer", minimum: 3, maximum: 15, default: 8 },
                description: "Number of results (3–15). Default 8."
              },
              {
                in: "query",
                name: "slim",
                required: false,
                schema: { type: "string", enum: ["0", "1"], default: "1" },
                description: "Return slim items only when set to '1'."
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        { $ref: "#/components/schemas/SearchAndVideosWrapper" },
                        { $ref: "#/components/schemas/SlimVideoList" }
                      ]
                    }
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
                description: "ISO 3166-1 alpha-2 country code (e.g., US, BR, ID)"
              },
              {
                in: "query",
                name: "limit",
                required: false,
                schema: { type: "integer", minimum: 3, maximum: 15, default: 8 },
                description: "Number of results (3–15). Default 8."
              },
              {
                in: "query",
                name: "slim",
                required: false,
                schema: { type: "string", enum: ["0", "1"], default: "1" },
                description: "Return slim items only when set to '1'."
              },
              {
                in: "query",
                name: "lang",
                required: false,
                schema: { type: "string" },
                description: "ISO 639-1 (e.g., id, en, pt). Passed to relevanceLanguage."
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        { $ref: "#/components/schemas/SearchAndVideosWrapper" },
                        { $ref: "#/components/schemas/SlimVideoList" }
                      ]
                    }
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
                  "application/json": { schema: { $ref: "#/components/schemas/VideosListResponse" } }
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
              {
                in: "query",
                name: "maxResults",
                required: false,
                schema: { type: "integer", default: 25 },
                description: "Max playlist items to return."
              }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": { schema: { $ref: "#/components/schemas/PlaylistsListResponse" } }
                }
              }
            }
          }
        },

        "/api/thumbUrl": {
          get: {
            operationId: "getThumbUrl",
            summary: "Get YouTube thumbnail URLs for a videoId",
            parameters: [
              { in: "query", name: "videoId", required: true, schema: { type: "string" } }
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": { schema: {
                    type: "object",
                    properties: {
                      videoId:  { type: "string" },
                      thumbMax: { type: "string" },
                      thumbHQ:  { type: "string" }
                    }
                  } }
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
          // ---------- Basics ----------
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
                properties: {
                  videoId: { type: "string" },
                  channelId: { type: "string" }
                },
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

          // ---------- Wrapper full search+videos ----------
          SearchAndVideosWrapper: {
            type: "object",
            properties: {
              search: { $ref: "#/components/schemas/SearchListResponse" },
              videos: { $ref: "#/components/schemas/VideosListResponse" }
            }
          },

          // ---------- Slim responses (for limit&slim=1) ----------
          SlimVideo: {
            type: "object",
            properties: {
              videoId: { type: "string" },
              title: { type: "string" },
              publishedAt: { type: "string" },
              views: { type: "number" },
              channelTitle: { type: "string" },
              url: { type: "string" },
              thumb: { type: "string", description: "Thumbnail URL (maxres/high/medium/default)" } // NEW
            }
          },
          SlimVideoList: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/SlimVideo" } }
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
