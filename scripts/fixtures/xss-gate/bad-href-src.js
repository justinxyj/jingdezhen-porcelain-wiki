/* Intentional unsafe patterns for xss_innerhtml_gate.py --fixtures */
(function () {
  const root = document.getElementById("x");
  root.innerHTML = `<a href="${user.url}">go</a><img src="${user.path}">`;
  root.innerHTML = '<a href="' + esc(link) + '">x</a>';
  root.innerHTML = `<p>${entry.zh.title}</p>`;
  root.innerHTML = `<a href="${entryUrl(e)}">entry</a>`;
})();
