/* Resource catalog loader v1: same-origin JSON with a labeled, bounded saved fallback. */
(() => {
  "use strict";
  const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

  function validUrl(value) {
    if (typeof value !== "string" || /[\s<>"\u0000-\u001f]/.test(value)) return false;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    } catch (_) { return false; }
  }

  // Reject the complete candidate before rendering any partial or invalid catalog.
  function validate(document, kind) {
    if (document?.schemaVersion !== 1 || document.kind !== kind || !Array.isArray(document.resources) || !document.resources.length) {
      throw new Error("Unsupported or empty resource catalog");
    }
    const ids = new Set();
    const sources = new Set();
    document.resources.forEach((row) => {
      if (!/^rec[A-Za-z0-9]{14}$/.test(row.id) || ids.has(row.id) ||
          typeof row.name !== "string" || !row.name.trim() || !Number.isFinite(row.sortOrder)) {
        throw new Error("Invalid resource identity or order");
      }
      ids.add(row.id);
      const fields = kind === "watch"
        ? ["location", "channelId", "channelUrl", "uploadsPlaylistUrl", "category", "description"]
        : ["category", "feedUrl", "artworkUrl", "podcastUrl", "description", "platform"];
      if (fields.some((field) => typeof row[field] !== "string")) throw new Error("Invalid resource fields");
      if (kind === "watch") {
        if (!/^UC[A-Za-z0-9_-]{22}$/.test(row.channelId) || !Array.isArray(row.improvVideoType) ||
            !row.improvVideoType.length || row.improvVideoType.some((value) => !["Set", "Short", "Sketch", "Podcast"].includes(value)) ||
            !["", "Improv Theater / Training Center", "Comedy Theater", "Other"].includes(row.category)) {
          throw new Error("Invalid Watch source");
        }
      } else if (!["Entertainment + Fun", "Learning + Resources"].includes(row.category) || !row.feedUrl) {
        throw new Error("Invalid Listen source");
      }
      const source = kind === "watch" ? row.channelId : row.feedUrl;
      if (sources.has(source)) throw new Error("Duplicate source");
      sources.add(source);
      const urls = kind === "watch" ? ["channelUrl", "uploadsPlaylistUrl"] : ["feedUrl", "artworkUrl", "podcastUrl"];
      if (urls.some((field) => row[field] && !validUrl(row[field]))) throw new Error("Invalid resource URL");
    });
    return document.resources.map((row) => ({ ...row, desc: row.description }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  }

  // Keep source-catalog status separate from video/episode loading status.
  window.loadResourceCatalog = async function (kind, status) {
    const key = `amalgam-${kind}-resources-v1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(new URL("./resources.json", window.location.href), {
        cache: "no-cache", signal: controller.signal
      });
      if (!response.ok) throw new Error("Resource JSON request failed");
      const document = await response.json();
      const resources = validate(document, kind);
      try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), document })); }
      catch (_) { /* A disabled or full browser cache does not prevent current data loading. */ }
      status.textContent = `${resources.length} sources (synced JSON)`;
      return resources;
    } catch (error) {
      console.warn(`${kind} resource JSON unavailable.`, error);
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        const age = Date.now() - cached?.savedAt;
        if (!Number.isFinite(age) || age < 0 || age > MAX_CACHE_AGE) throw new Error("Saved copy expired");
        const resources = validate(cached.document, kind);
        status.textContent = `${resources.length} sources (saved fallback; updates unavailable, may be out of date)`;
        return resources;
      } catch (_) {
        status.textContent = "Sources temporarily unavailable; please try again later.";
        return [];
      }
    } finally { clearTimeout(timeout); }
  };
})();
