/* Safe patterns — used only to document allowlist; not scanned in default mode */
(function () {
  const root = document.getElementById("x");
  const h = safeHref(user.url);
  const s = safeHref(user.path);
  root.innerHTML = `<a href="${safeHref(link)}">go</a><img src="${safeHref(evil)}">`;
  // xss-safe: curated static asset
  root.innerHTML = `<img src="${STATIC_LOGO}">`;
  root.innerHTML = `<p>${esc(entry.zh.title)}</p>`;
})();
