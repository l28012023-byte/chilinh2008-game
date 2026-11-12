/* ============================================================
   fx.js — Hiệu ứng hình ảnh: mưa, rung màn hình, loé sáng,
           thì thầm khi tâm trí thấp
   ============================================================ */
(function () {
  const canvas = G.$("rain");
  const c = canvas.getContext("2d");
  let drops = [];
  let density = 1;       // 0 = không mưa, 1 = mưa thường
  let running = false;

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    drops = Array.from({ length: 220 }, () => newDrop(true));
  }

  function newDrop(rand) {
    return {
      x: Math.random() * canvas.width,
      y: rand ? Math.random() * canvas.height : -20,
      len: 12 + Math.random() * 18,
      sp: 14 + Math.random() * 10,
    };
  }

  function frame() {
    if (!running) return;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "rgba(200,170,170,.28)";
    c.lineWidth = 1;
    c.beginPath();
    const n = Math.floor(drops.length * density);
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      c.moveTo(d.x, d.y);
      c.lineTo(d.x - 3, d.y + d.len);
      d.y += d.sp; d.x -= 1.2;
      if (d.y > canvas.height) Object.assign(d, newDrop(false));
    }
    c.stroke();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);

  G.fx = {
    startRain() { if (running) return; running = true; resize(); frame(); },
    setRain(v) { density = Math.max(0, Math.min(1.6, v)); },
  };

  /* ---------- Hiệu ứng nhanh ---------- */
  G.flash = () => {
    const f = G.$("flash");
    f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
  };

  G.shake = () => {
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
    G.later(() => document.body.classList.remove("shake"), 600);
  };

  G.fade = (ms) => {
    const f = G.$("fade");
    f.style.opacity = "1";
    return new Promise((res) => setTimeout(res, ms || 1200));
  };
  G.unfade = () => { G.$("fade").style.opacity = "0"; };

  /* ---------- Thì thầm khi tâm trí thấp ---------- */
  const whispers = [
    "...đừng quay đầu...",
    "...ngươi đến muộn rồi...",
    "...chờ ta với...",
    "...nàng vẫn ở đây...",
    "...ba tiếng trống...",
  ];
  let whisperTimer = null;
  G.fx.lowSanityLoop = (on) => {
    clearInterval(whisperTimer);
    whisperTimer = null;
    if (!on) return;
    whisperTimer = setInterval(() => {
      if (Math.random() < 0.5) {
        G.ui.toast(whispers[Math.floor(Math.random() * whispers.length)], 2400, true);
        G.sfx("whisper");
      }
    }, 9000);
  };
})();
