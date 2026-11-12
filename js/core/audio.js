/* ============================================================
   audio.js — Nhạc nền + hiệu ứng âm thanh
   - Đọc đường dẫn từ js/data/audio-config.js
   - File không có / lỗi → tự chuyển sang âm thanh tổng hợp (WebAudio)
   - Trình duyệt chỉ cho phát sau lần bấm đầu tiên → gọi G.audio.unlock()
   ============================================================ */
(function () {
  const A = (G.audio = {});
  const SETTINGS_KEY = "minh_hon_audio";

  let ctx = null, master = null, sfxBus = null, ambBus = null;
  let unlocked = false;
  let pendingBgm = null;
  let curKey = null, curEl = null, usingSynth = false;
  let ambNodes = null;
  const broken = {};            // url → true nếu tải lỗi
  A.settings = { music: 0.6, sfx: 0.8, muted: false };

  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) Object.assign(A.settings, s);
  } catch (e) {}

  function persist() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(A.settings)); } catch (e) {}
  }

  function ensureCtx() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    sfxBus = ctx.createGain();
    ambBus = ctx.createGain();
    sfxBus.connect(master);
    ambBus.connect(master);
    master.connect(ctx.destination);
    applyVolumes();
    return true;
  }

  function applyVolumes() {
    const m = A.settings.muted ? 0 : 1;
    if (master) master.gain.value = m;
    if (sfxBus) sfxBus.gain.value = A.settings.sfx;
    if (ambBus) ambBus.gain.value = A.settings.music;
    if (curEl) curEl.volume = A.settings.muted ? 0 : A.settings.music;
  }

  /* ---------- Mở khoá ---------- */
  A.unlock = function () {
    if (unlocked) return;
    unlocked = true;
    if (ensureCtx() && ctx.state === "suspended") ctx.resume();
    if (pendingBgm) { const k = pendingBgm; pendingBgm = null; curKey = null; A.bgm(k); }
  };

  /* ---------- Cài đặt ---------- */
  A.setVolume = function (type, v) { A.settings[type] = v; applyVolumes(); persist(); };
  A.toggleMute = function () {
    A.settings.muted = !A.settings.muted;
    applyVolumes(); persist();
    return A.settings.muted;
  };

  /* ---------- Nhạc nền ---------- */
  A.bgm = function (key) {
    if (!unlocked) { pendingBgm = key; return; }
    if (key === curKey) return;
    curKey = key;
    fadeOutCurrent();

    const url = G.audioConfig.bgm && G.audioConfig.bgm[key];
    if (!url || broken[url]) { startSynth(key); return; }

    stopSynth();
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    el.addEventListener("error", () => {
      broken[url] = true;
      if (curEl === el) { curEl = null; startSynth(key); }
    });
    el.play().then(() => {
      curEl = el;
      fadeIn(el);
    }).catch(() => {
      broken[url] = true;
      if (curKey === key) startSynth(key);
    });
  };

  function fadeIn(el) {
    const target = () => (A.settings.muted ? 0 : A.settings.music);
    const t = setInterval(() => {
      if (el.volume >= target() - 0.03) { el.volume = target(); clearInterval(t); }
      else el.volume = Math.min(1, el.volume + 0.03);
    }, 80);
  }

  function fadeOutCurrent() {
    const old = curEl;
    curEl = null;
    if (!old) return;
    const t = setInterval(() => {
      if (old.volume <= 0.04) { old.pause(); clearInterval(t); }
      else old.volume = Math.max(0, old.volume - 0.04);
    }, 80);
  }

  /* ---------- Âm nền tổng hợp (mưa + gió) ---------- */
  function noiseBuffer() {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function startSynth(key) {
    if (!ensureCtx()) return;
    stopSynth();
    usingSynth = true;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = key === "tense" ? 700 : 1400;
    const g = ctx.createGain();
    g.gain.value = key === "tense" ? 0.05 : 0.09;
    src.connect(lp); lp.connect(g); g.connect(ambBus);
    src.start();

    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = key === "tense" ? 48 : 55;
    const dg = ctx.createGain();
    dg.gain.value = key === "tense" ? 0.09 : 0.04;
    drone.connect(dg); dg.connect(ambBus);
    drone.start();

    ambNodes = [src, drone];
  }

  function stopSynth() {
    if (ambNodes) { ambNodes.forEach((n) => { try { n.stop(); } catch (e) {} }); ambNodes = null; }
    usingSynth = false;
  }

  /* ---------- Hiệu ứng ---------- */
  const synth = {
    click()  { tone(900, 0.04, "square", 0.05); },
    pickup() { tone(660, 0.12, "sine", 0.18); setTimeout(() => tone(990, 0.22, "sine", 0.18), 90); },
    drum()   { thump(75, 0.6, 0.9); setTimeout(() => thump(60, 0.7, 0.8), 380); },
    crack()  { burst(0.18, 2500, 0.7); tone(140, 0.15, "sawtooth", 0.3); },
    jump()   { burst(0.5, 1800, 0.55); tone(220, 0.5, "sawtooth", 0.25); },
    door()   { burst(0.7, 400, 0.5); thump(50, 0.6, 0.5); },
    heartbeat() { thump(55, 0.18, 0.7); setTimeout(() => thump(50, 0.2, 0.55), 260); },
    whisper(){ burst(1.1, 3500, 0.12); },
  };

  function tone(freq, dur, type, vol) {
    if (!ensureCtx()) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }

  function thump(freq, dur, vol) {
    if (!ensureCtx()) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }

  function burst(dur, cutoff, vol) {
    if (!ensureCtx()) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(); src.stop(ctx.currentTime + dur + 0.05);
  }

  A.sfx = function (key) {
    if (!unlocked || A.settings.muted) return;
    const url = G.audioConfig.sfx && G.audioConfig.sfx[key];
    const fallback = () => { if (synth[key]) synth[key](); };
    if (!url || broken[url]) { fallback(); return; }
    const el = new Audio(url);
    el.volume = A.settings.sfx;
    el.addEventListener("error", () => { broken[url] = true; fallback(); });
    el.play().catch(() => { broken[url] = true; fallback(); });
  };

  /* Cho file khác dùng ngắn gọn */
  G.sfx = (k) => A.sfx(k);
  G.bgm = (k) => A.bgm(k);
})();
