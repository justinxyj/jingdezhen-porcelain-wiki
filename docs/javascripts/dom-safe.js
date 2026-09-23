/* Shared HTML text escape + URL allowlist for innerHTML templates.
   Prefer window.JDM_SAFE over per-file copies. safeHref delegates to JDM_AUTH when present. */
(function () {
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
  }
  function safeHrefLocal(raw, { allowHttp = false } = {}) {
    const value = String(raw ?? "").trim();
    if (!value) return "";
    try {
      const base = window.location?.href || "https://localhost/";
      const url = new URL(value, base);
      const protocol = url.protocol.toLowerCase();
      const sameOrigin = url.origin === window.location.origin;
      if (
        protocol === "javascript:" ||
        protocol === "data:" ||
        protocol === "vbscript:" ||
        protocol === "file:" ||
        protocol === "blob:"
      )
        return "";
      if (sameOrigin && (protocol === "http:" || protocol === "https:")) return url.href;
      if (protocol === "https:") return url.href;
      if (protocol === "http:" && allowHttp) return url.href;
    } catch (_) {
      return "";
    }
    return "";
  }
  function safeHref(raw, opts) {
    if (typeof window.JDM_AUTH?.safeHref === "function") return window.JDM_AUTH.safeHref(raw, opts);
    return safeHrefLocal(raw, opts);
  }
  window.JDM_SAFE = { esc, safeHref };
})();
