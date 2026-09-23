const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'wedding-browser-'));
  const browser = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9337', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    let tabs;
    for (let i = 0; i < 50; i++) { try { tabs = await (await fetch('http://127.0.0.1:9337/json')).json(); break; } catch { await pause(200); } }
    assert(tabs, 'Chrome started');
    socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let seq = 0; const pending = new Map(); const errors = [];
    socket.onmessage = e => { const msg = JSON.parse(e.data); if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text); if (msg.id) { const callbacks = pending.get(msg.id); pending.delete(msg.id); msg.error ? callbacks.reject(msg.error) : callbacks.resolve(msg.result); } };
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.text); return r.result.value; };
    await send('Runtime.enable'); await send('Page.enable');
    for (const width of [1440, 375, 390, 320, 430]) {
      const height = ({ 1440: 900, 375: 812, 390: 844, 320: 568, 430: 932 })[width];
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
      await send('Emulation.setTouchEmulationEnabled', { enabled: width < 700 });
      await send('Page.navigate', { url: process.argv[2] || 'http://localhost:3000' });
      await pause(2200);
      assert.equal(await evaluate('document.getElementById("wedding-page").inert'), true);
      assert.equal(await evaluate('document.getElementById("envelope-screen").hidden'), false);
      assert.equal(await evaluate('document.getElementById("wedding-page").hidden'), true);
      assert.equal(await evaluate('document.querySelector(".envelope-date")'), null, 'No names/date on the closed envelope');
      assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'No horizontal overflow');
      assert(await evaluate('document.querySelector(".envelope-open-prompt").innerText.includes("open your invitation")'), 'Clear opening instruction');
      assert(await evaluate('(() => { const r = document.querySelector(".envelope-open-prompt").getBoundingClientRect(); return r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })()'), 'Open prompt fits screen');
      assert(await evaluate('Math.abs(document.getElementById("envelope-screen").getBoundingClientRect().height - visualViewport.height) < 2'), 'Envelope fills visible viewport');
      if (width < 700) {
        assert(await evaluate('document.querySelector(".envelope-open-prompt").innerText.startsWith("Tap")'), 'Touch wording');
        assert(await evaluate('visualViewport.height - document.querySelector(".envelope-open-prompt").getBoundingClientRect().bottom < 65'), 'No empty space below the prompt');
      }
      const beforeMotion = await evaluate('getComputedStyle(document.getElementById("open-envelope")).transform');
      const beforeCue = await evaluate('getComputedStyle(document.querySelector(".envelope-tap-cue")).transform');
      await pause(350);
      assert.notEqual(await evaluate('getComputedStyle(document.getElementById("open-envelope")).transform'), beforeMotion, 'Floating animation visibly changes transform');
      assert.notEqual(await evaluate('getComputedStyle(document.querySelector(".envelope-tap-cue")).transform'), beforeCue, 'Tap guidance is animated');
      if (width === 375) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 700, deviceScaleFactor: 1, mobile: true }); await pause(100);
        assert(await evaluate('Math.abs(document.getElementById("envelope-screen").getBoundingClientRect().height - 700) < 2'), 'Browser-toolbar resize handled');
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true }); await pause(100);
      }
      const closedLetterTop = await evaluate('document.querySelector(".envelope-letter").getBoundingClientRect().top');
      const shot = await send('Page.captureScreenshot'); fs.writeFileSync(`preview-envelope-${width}.png`, Buffer.from(shot.data, 'base64'));
      if (width === 1440) {
        await send('Page.bringToFront');
        await evaluate('document.getElementById("open-envelope").focus()');
        assert.equal(await evaluate('document.activeElement.id'), 'open-envelope');
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      } else {
        const point = await evaluate('(() => { const r = document.querySelector(".wax-seal").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()');
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await pause(2100);
      assert.equal(await evaluate('document.getElementById("envelope-screen").classList.contains("opening")'), true);
      assert(await evaluate('document.querySelector(".envelope-letter").getBoundingClientRect().top') < closedLetterTop - 65, 'Invitation visibly rises on touch');
      const openingShot = await send('Page.captureScreenshot'); fs.writeFileSync(`preview-envelope-opening-${width}.png`, Buffer.from(openingShot.data, 'base64'));
      await pause(2000);
      assert.equal(await evaluate('document.getElementById("envelope-screen").hidden'), true);
      assert.equal(await evaluate('document.getElementById("wedding-page").inert'), false);
      assert.equal(await evaluate('document.querySelectorAll("#wedding-page svg.icon").length'), 10, 'Navigation uses consistent SVG icons');
      assert.equal(await evaluate('/[↗↓↑↺]/.test(document.getElementById("wedding-page").textContent)'), false, 'No platform-dependent arrow characters');
      assert.equal(await evaluate('document.activeElement.id'), 'hero-title');
      assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Opened page fits viewport');
      assert.equal(await evaluate('document.getElementById("directions-link").href'), 'https://maps.app.goo.gl/Lh6AbxdXu4Udp48Q9');
      assert((await evaluate('document.getElementById("hero-title").innerText')).includes('Mohamed Arafath'));
      assert(await evaluate('document.querySelector(".venue-photo").naturalWidth > 0'), 'Hall photograph loaded');
      const heroShot = await send('Page.captureScreenshot'); fs.writeFileSync(`preview-home-${width}.png`, Buffer.from(heroShot.data, 'base64'));
      await evaluate('document.getElementById("celebration").scrollIntoView({ behavior: "instant" })'); await pause(1100);
      const venueShot = await send('Page.captureScreenshot'); fs.writeFileSync(`preview-venue-${width}.png`, Buffer.from(venueShot.data, 'base64'));
      await evaluate('document.getElementById("replay-envelope").click()');
      assert.equal(await evaluate('document.getElementById("wedding-page").inert'), true);
      console.log(`PASS ${width}px: full-screen layout, live floating/opening animation, touch/keyboard, hidden surprise, photo, replay`);
    }
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await pause(100);
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".envelope-tap-cue")).animationName'), 'none', 'Tap cue respects reduced motion');
    assert.equal(await evaluate('document.getElementById("play-envelope-animation").hidden'), false, 'Explicit animation option for reduced motion');
    await evaluate('document.querySelector(".envelope-open-prompt").click()'); await pause(100);
    assert.equal(await evaluate('document.getElementById("envelope-screen").hidden'), true);
    await evaluate('document.getElementById("replay-envelope").click()');
    await evaluate('document.getElementById("play-envelope-animation").click()'); await pause(600);
    assert.equal(await evaluate('document.getElementById("envelope-screen").hidden'), false, 'Opt-in plays full opening');
    assert.notEqual(await evaluate('getComputedStyle(document.querySelector(".envelope-flap")).transitionDuration'), '0s');
    await pause(3500);
    assert.equal(await evaluate('document.getElementById("envelope-screen").hidden'), true);
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS reduced motion and no JavaScript exceptions');
    await send('Browser.close');
  } finally { socket?.close(); browser.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
