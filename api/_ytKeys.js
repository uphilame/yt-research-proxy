export function loadKeys() {
  const raw = process.env.YOUTUBE_API_KEYS || process.env.YOUTUBE_API_KEY || "";
  return raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
}
