import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../docs/javascripts/museum-images.js', import.meta.url), 'utf8');

async function scenario(sourceUrl, alternate, failAlternate = false) {
  const requests = [];
  const handlers = new Map();
  const attrs = new Map([['src', 'https://images.example/missing.jpg'], ['alt', '指定馆藏器物']]);
  const img = {
    dataset: { sourceUrl }, style: {}, complete: true, naturalWidth: 0,
    classList: { add() {}, remove() {} },
    matches: () => true, closest: () => null,
    getAttribute: name => attrs.get(name),
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: name => attrs.delete(name),
    addEventListener(name, fn, opts = {}) {
      if (!handlers.has(name)) handlers.set(name, []);
      handlers.get(name).push({ fn, once: opts.once });
    },
    emit(name) {
      const callbacks = [...(handlers.get(name) || [])];
      handlers.set(name, callbacks.filter(item => !item.once));
      callbacks.forEach(item => item.fn());
    },
    get src() { return attrs.get('src'); },
    set src(value) {
      attrs.set('src', value);
      queueMicrotask(() => {
        if (failAlternate && value === alternate) this.emit('error');
        else { this.naturalWidth = 1200; this.emit('load'); }
      });
    },
  };
  const sandbox = {
    window: { addEventListener() {} },
    document: { readyState: 'complete', body: {}, querySelectorAll: () => [img] },
    HTMLImageElement: class { static [Symbol.hasInstance](value) { return value === img; } },
    Element: class { static [Symbol.hasInstance](value) { return value === img; } },
    Document: class { static [Symbol.hasInstance](value) { return Boolean(value?.querySelectorAll && value?.readyState); } },
    MutationObserver: class { observe() {} },
    AbortController, setTimeout, clearTimeout,
    fetch: async url => {
      requests.push(url);
      return { ok: true, json: async () => ({ primaryImage: alternate }) };
    },
  };
  vm.runInNewContext(source, sandbox);
  await new Promise(resolve => setTimeout(resolve, 25));
  return { img, requests };
}

const palace = await scenario('https://www.dpm.org.cn/collection/ceramic/227155.html', null);
assert.equal(palace.requests.length, 0, 'A Palace object must not be substituted with search results');
assert.equal(palace.img.dataset.imageFallback, '1');
assert.match(decodeURIComponent(palace.img.src), /图片来源暂不可用/);

const met = await scenario('https://www.metmuseum.org/art/collection/search/42490', 'https://images.metmuseum.org/same-object.jpg');
assert.deepEqual(met.requests, ['https://collectionapi.metmuseum.org/public/collection/v1/objects/42490']);
assert.equal(met.img.src, 'https://images.metmuseum.org/same-object.jpg');
assert.equal(met.img.style.visibility, 'visible');

const failedMet = await scenario('https://www.metmuseum.org/art/collection/search/42490', 'https://images.metmuseum.org/still-missing.jpg', true);
assert.equal(failedMet.img.dataset.imageFallback, '1', 'A failed same-object retry must show the source-unavailable state');
assert.equal(failedMet.requests.length, 1, 'Recovery must not loop or search for substitutes');
assert.equal(failedMet.img.style.visibility, 'visible');
console.log('PASS: source identity, same-object recovery, and failed-retry fallback');
