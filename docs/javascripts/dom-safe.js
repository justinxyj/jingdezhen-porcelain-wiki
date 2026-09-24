/* Shared HTML text escape + URL allowlist + body HTML sanitizer for innerHTML templates.
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
  /** Allowlist body HTML for entry content (aligns with wiki-enhancements sanitizeBodyHtml). */
  function sanitizeBodyHtml(raw) {
    const tpl = document.createElement("template");
    tpl.innerHTML = String(raw || "");
    const allowed = new Set(["P", "BR", "STRONG", "B", "EM", "I", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "A"]);
    tpl.content.querySelectorAll("*").forEach((node) => {
      if (!allowed.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      [...node.attributes].forEach((attr) => {
        if (node.tagName === "A" && attr.name.toLowerCase() === "href") {
          const href = safeHref(attr.value);
          if (href) node.setAttribute("href", href);
          else node.removeAttribute("href");
        } else node.removeAttribute(attr.name);
      });
      if (node.tagName === "A" && node.getAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    return tpl.innerHTML;
  }
  window.JDM_SAFE = { esc, safeHref, sanitizeBodyHtml };
})();
