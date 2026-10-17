import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { serveBuild } from './lib/test-server.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const preview = args.includes('--base-url') ? null : await serveBuild();
const base = option('--base-url', preview?.base);
const output = option('--output', 'output/home-motion');
const selectedEngine = option('--engine', 'all');
assert(['all', 'chromium', 'webkit'].includes(selectedEngine), 'Unknown browser engine');
await mkdir(output, {recursive:true});
const records = [];
const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const settle = async page => { await page.evaluate(() => document.fonts.ready); await frames(page); };
async function snapshot(node) {
  return node.evaluate(el => ({
    scale:new DOMMatrix(getComputedStyle(el).transform).a,
    y:new DOMMatrix(getComputedStyle(el).transform).f,
    opacity:Number(getComputedStyle(el).opacity),
    top:el.parentElement.getBoundingClientRect().top + scrollY,
    bottom:el.parentElement.getBoundingClientRect().bottom + scrollY,
    phase:el.dataset.listingPhase
  }));
}
async function motion(page, node) {
  const geometry = await snapshot(node);
  const height = await page.evaluate(() => innerHeight);
  const states = [];
  // The home feature is already partly visible at scrollY=0. Do not ask the
  // browser for negative scroll positions to manufacture a full entry path.
  const start = Math.min(geometry.top, height * .89), end = height * .25;
  const targets = [start, start*.7+end*.3, start*.35+end*.65, end];
  for (const target of targets) {
    await page.evaluate(y => scrollTo({top:y, behavior:'instant'}), geometry.top - target);
    await frames(page);
    const state = await snapshot(node);
    assert(Math.abs(state.top - geometry.top) < 1, 'Motion must not move the layout anchor');
    states.push(state);
  }
  states.slice(1).forEach((state, index) => assert(state.scale > states[index].scale, 'Arrival follows scroll continuously'));
  assert(states[0].scale < (start >= height * .89 - 1 ? .9 : 1), 'Arrival has visible depth');
  assert.equal(states.at(-1).scale, 1, 'Reading plane is full size');
  assert.equal(states.at(-1).opacity, 1);
  await page.evaluate(y => scrollTo({top:y, behavior:'instant'}), geometry.top - targets[1]);
  await frames(page);
  assert(Math.abs((await snapshot(node)).scale - states[1].scale) < .001, 'Reverse restores the same depth');
  const stopped = await snapshot(node);
  await page.waitForTimeout(80);
  assert.deepEqual(await snapshot(node), stopped, 'Motion stops when scrolling stops');
  const header = await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().height);
  const exits = [];
  for (const offset of [0, 45, 100]) {
    await page.evaluate(y => scrollTo({top:y, behavior:'instant'}), geometry.bottom - header + offset);
    await frames(page);
    const state = await snapshot(node);
    assert(Math.abs(state.bottom - geometry.bottom) < 1, 'Departure keeps the layout anchor');
    exits.push(state);
  }
  exits.slice(1).forEach((state, index) => assert(state.scale < exits[index].scale, 'Earlier cards recede continuously'));
  await page.evaluate(y => scrollTo({top:y, behavior:'instant'}), geometry.top - height * .25);
  await frames(page);
  assert.equal((await snapshot(node)).scale, 1, 'Reverse returns to a readable surface');
  return {states, exits};
}
try {
  for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
    if (selectedEngine !== 'all' && selectedEngine !== engine) continue;
    const browser = await type.launch();
    try {
      for (const width of [360, 390, 768, 1440]) for (const locale of ['ja', 'en']) {
        const mobile = width < 768;
        const context = await browser.newContext({viewport:{width, height:844}, isMobile:mobile, hasTouch:mobile, reducedMotion:'no-preference'});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${base}/${locale === 'en' ? 'en/' : ''}`);
        await settle(page);
        assert.equal(await page.locator('.topic-card[data-listing-motion]').count(), 0, 'Do not animate category navigation as article cards');
        // WebKit emulates TouchEvents/coarse pointers but reports maxTouchPoints
        // as zero on macOS. Assert capabilities and exercise tap below instead.
        if (mobile) assert(await page.evaluate(() => 'ontouchstart' in window && matchMedia('(pointer: coarse)').matches), 'Use touch emulation, not only a narrow viewport');
        const topic = await page.locator('.topic-card .text-link').first().getAttribute('href');
        const nextPage = await page.locator('.pagination-edge[href]').last().getAttribute('href');
        for (const [kind, href] of [['home', null], ['page-2', nextPage], ['topic', topic]]) {
          if (href) { await page.goto(new URL(href, base).href); await settle(page); }
          const links = await page.locator('[data-listing-motion="card"]').evaluateAll(nodes => nodes.map(el => ({href:el.getAttribute('href'), text:el.textContent})));
          assert(links.length > 0, `${kind} has real article cards`);
          const featured = page.locator('[data-listing-motion="featured"]');
          const featuredMotion = await featured.count() ? await motion(page, featured) : null;
          const card = page.locator('[data-listing-motion="card"]').first();
          const result = await motion(page, card);
          assert.equal(await card.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'Readable card is opaque');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
          assert.deepEqual(await page.locator('[data-listing-motion="card"]').evaluateAll(nodes => nodes.map(el => ({href:el.getAttribute('href'), text:el.textContent}))), links, 'Motion preserves content and order');
          if (locale === 'ja') await page.screenshot({path:`${output}/${engine}-${width}-${kind}.png`});
          records.push({engine, version:browser.version(), width, mobile, locale, kind, featuredMotion, ...result});
        }
        // Native navigation must keep the list's place, on both back and reload.
        const card = page.locator('[data-listing-motion="card"]').first();
        const target = await card.getAttribute('href');
        const listingUrl = page.url();
        const before = await page.evaluate(() => scrollY);
        const original = await snapshot(card);
        await (mobile ? card.tap() : card.click());
        await page.waitForURL(new URL(target, base).href);
        await page.waitForFunction(() => history.state?.articleStream === true);
        await page.goBack(); await page.waitForURL(listingUrl); await settle(page);
        await page.waitForFunction(y => Math.abs(scrollY-y) < 3, before);
        assert(Math.abs((await snapshot(page.locator('[data-listing-motion="card"]').first())).scale-original.scale) < .001);
        await page.reload(); await settle(page);
        // Fonts may be cached differently across reload. Preserve the visible
        // card's reading point, rather than require the same absolute page Y.
        try {
          await page.waitForFunction(top => Math.abs(document.querySelector('[data-listing-motion="card"]').parentElement.getBoundingClientRect().top-top) < 3, original.top-before);
        } catch (error) {
          console.error(JSON.stringify({engine,width,locale,before,expectedTop:original.top-before,actual:await page.evaluate(() => ({y:scrollY,top:document.querySelector('[data-listing-motion="card"]').parentElement.getBoundingClientRect().top,restoration:history.scrollRestoration}))}));
          throw error;
        }
        assert(Math.abs((await snapshot(page.locator('[data-listing-motion="card"]').first())).scale-original.scale) < .001);
        // Settings, focus and rotation must not disable reading or selection.
        const restored = page.locator('[data-listing-motion="card"]').first();
        const top = (await snapshot(restored)).top;
        await page.evaluate(y => scrollTo({top:y, behavior:'instant'}), top-844*.73); await frames(page);
        await page.emulateMedia({reducedMotion:'reduce'}); await frames(page);
        assert(await page.locator('[data-listing-motion]').evaluateAll(nodes => nodes.every(el => getComputedStyle(el).transform === 'none' && getComputedStyle(el).opacity === '1')));
        await page.emulateMedia({reducedMotion:'no-preference'}); await frames(page);
        assert((await snapshot(restored)).scale < 1, 'Runtime setting changes restore motion');
        await page.keyboard.press('Tab');
        await restored.evaluate(el => el.focus({preventScroll:true})); await frames(page);
        assert.equal((await snapshot(restored)).scale, 1, 'Keyboard-focused card stays flat');
        await page.keyboard.press('Enter'); await page.waitForURL(new URL(target, base).href);
        await page.waitForFunction(() => history.state?.articleStream === true);
        await page.goBack(); await page.waitForURL(listingUrl); await settle(page);
        await page.setViewportSize({width:844, height:390}); await settle(page);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        if (width === 390 && locale === 'ja') {
          // Hold font readiness across reload, then let real keyboard input
          // cancel restoration. Releasing the delayed callback must not jump.
          await page.addInitScript(() => {
            const original = document.fonts.ready;
            let release;
            const held = new Promise(resolve => { release = resolve; });
            Object.defineProperty(document.fonts, 'ready', {get:() => Promise.all([original, held])});
            window.releaseListingFonts = release;
          });
          await page.reload();
          await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
          await page.keyboard.press('PageDown'); await page.waitForTimeout(150);
          const userY = await page.evaluate(() => scrollY);
          await page.evaluate(() => window.releaseListingFonts()); await page.waitForTimeout(150);
          assert(Math.abs(await page.evaluate(() => scrollY)-userY) < 2, 'User input cancels delayed position restoration');
        }
        assert.deepEqual(errors, []);
        console.log(`${engine} ${width}px ${locale}: home, continuation, topic and navigation passed`);
        await context.close();
      }
      const noJS = await browser.newPage({viewport:{width:390, height:844}, javaScriptEnabled:false});
      await noJS.goto(`${base}/`);
      const link = noJS.locator('[data-listing-motion="card"]').first();
      const href = await link.getAttribute('href');
      assert.equal(await link.evaluate(el => getComputedStyle(el).transform), 'none');
      await noJS.evaluate(() => document.fonts.ready);
      await link.evaluate(el => el.scrollIntoView({block:'center', behavior:'instant'}));
      // Avoid Playwright's implicit smooth-scroll/navigation wait on a deep
      // no-JS page; still activate the real link and verify its destination.
      await link.click({noWaitAfter:true});
      await noJS.waitForURL(new URL(href, base).href, {waitUntil:'domcontentloaded'});
      await noJS.close();
    } finally { await browser.close(); }
  }
} finally { await preview?.close(); }
await writeFile(`${output}/report.json`, JSON.stringify({boundary:'Browser emulation including mobile/touch; not physical smartphone verification', records}, null, 2));
console.log(`${records.length} listing cases passed: home/continuation/topic, arrival/departure/reverse/stop, navigation, reduced motion, keyboard, rotation and no-JS.`);
