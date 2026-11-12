/* ============================================================
   ui.js — Hộp thoại (gõ chữ), thanh Tâm trí, đếm ngược,
           bảng thông tin, màn hình chi tiết vật thể, thông báo
   ============================================================ */
(function () {
  const $ = G.$;
  const ui = (G.ui = {});

  /* ---------- Thông báo nhỏ ---------- */
  let toastTimer = null;
  ui.toast = function (text, ms, whisper) {
    const t = $("toast");
    t.textContent = text;
    t.className = whisper ? "whisper" : "";
    t.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.style.display = "none"), ms || 2200);
  };

  /* ---------- Hộp thoại có hiệu ứng gõ chữ ---------- */
  let typeTimer = null;
  let skipFn = null;

  ui.say = function (who, text, choices) {
    choices = choices || [];
    clearInterval(typeTimer);
    $("speaker").textContent = who;
    $("choices").innerHTML = "";
    const el = $("dialogueText");
    el.textContent = "";

    let i = 0;
    const finish = () => {
      clearInterval(typeTimer);
      typeTimer = null;
      skipFn = null;
      el.textContent = text;
      renderChoices(choices);
    };
    skipFn = finish;
    typeTimer = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) finish();
    }, 20);
  };

  ui.skipTyping = function () { if (skipFn) skipFn(); };

  function renderChoices(choices) {
    const box = $("choices");
    box.innerHTML = "";
    choices.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = c.label;
      if (c.danger) b.className = "danger";
      b.onclick = () => { G.sfx("click"); c.action(); };
      box.appendChild(b);
    });
  }

  /* ---------- Đếm ngược (sự kiện có giới hạn thời gian) ---------- */
  let cdTimer = null;
  ui.countdown = function (sec, onEnd) {
    ui.stopCountdown();
    const bar = $("countdown"), fill = bar.firstElementChild;
    bar.hidden = false;
    fill.style.transition = "none";
    fill.style.transform = "scaleX(1)";
    void fill.offsetWidth;
    fill.style.transition = "transform " + sec + "s linear";
    fill.style.transform = "scaleX(0)";
    cdTimer = G.later(() => { cdTimer = null; bar.hidden = true; onEnd(); }, sec * 1000);
  };
  ui.stopCountdown = function () {
    if (cdTimer) { clearTimeout(cdTimer); G.timers = G.timers.filter((x) => x !== cdTimer); cdTimer = null; }
    $("countdown").hidden = true;
  };

  /* ---------- HUD ---------- */
  ui.hud = function () {
    const S = G.state;
    const room = G.rooms[S.room];
    if (room) $("roomTitle").textContent = room.title;
    const fill = $("sanityFill");
    fill.style.width = S.sanity + "%";
    fill.classList.toggle("low", S.sanity <= 35);
    $("sanityNum").textContent = Math.round(S.sanity);
    $("drumCount").lastElementChild.textContent = S.drums;
    $("vignette").classList.toggle("low", S.sanity <= 35);
  };

  /* ---------- Chi tiết vật thể ---------- */
  let selected = null;

  ui.showDetail = function (o) {
    selected = o;
    G.scene.zoomOn(o.x, o.y);
    const vis = $("detailVisual");
    vis.innerHTML = "";
    if (o.image) {
      const img = new Image();
      img.src = o.image; img.alt = o.name;
      img.onerror = () => { img.remove(); vis.textContent = o.icon || "❔"; };
      vis.appendChild(img);
    } else vis.textContent = o.icon || "❔";
    $("detailTitle").textContent = o.name;
    $("detailDescription").textContent = o.desc || "Một vật thể kỳ lạ trong Tiêu gia.";
    $("objectDetail").classList.add("show");
  };

  ui.closeDetail = function () {
    $("objectDetail").classList.remove("show");
    G.scene.zoomOff();
    selected = null;
  };

  ui.confirmDetail = function () {
    if (!selected) return;
    const o = selected;
    ui.closeDetail();
    G.sfx("click");
    if (o.act) o.act();
  };

  /* ---------- Bảng thông tin ---------- */
  ui.closePanel = function () { $("panel").classList.remove("show"); };

  const list = (a) => (a.length ? a.map((x) => `<div class="entry">${x}</div>`).join("") : "<p>Chưa có dữ liệu.</p>");

  ui.panel = function (type) {
    const S = G.state;
    const title = $("panelTitle"), content = $("panelContent");
    $("panel").classList.add("show");

    if (type === "inventory") {
      title.textContent = "🎒 HÀNH TRANG";
      content.innerHTML = S.items.length
        ? S.items.map((id) => {
            const it = G.items[id];
            return `<div class="entry"><b>${it.name}</b><p>${it.desc}</p><button class="btn small" data-use="${id}">Dùng</button></div>`;
          }).join("")
        : "<p>Hành trang trống.</p>";
      content.querySelectorAll("[data-use]").forEach((b) => {
        b.onclick = () => { ui.closePanel(); G.useItem(b.dataset.use); };
      });
    }
    else if (type === "rules") { title.textContent = "📜 SỔ QUY TẮC"; content.innerHTML = list(S.rules.filter(Boolean)); }
    else if (type === "clues") { title.textContent = "🔍 MANH MỐI"; content.innerHTML = list(S.clues); }
    else if (type === "guests") {
      title.textContent = "👥 KHÁCH MỜI";
      const rows = Object.keys(G.guests).filter((id) => S.talked.includes(id)).map((id) => {
        const g = G.guests[id];
        return `<div class="entry"><b>${g[0]}</b><p>${g[1]}</p></div>`;
      });
      content.innerHTML = rows.length ? rows.join("") : "<p>Ngươi chưa gặp ai.</p>";
    }
    else if (type === "map") {
      title.textContent = "🗺 BẢN ĐỒ";
      content.innerHTML = ["road", "gate", "yard", "after"].map((id) => {
        const seen = S.visited.includes(id);
        const here = S.room === id ? " ← ngươi đang ở đây" : "";
        return `<div class="entry">${G.rooms[id].title} — ${seen ? "Đã khám phá" : "Chưa đến"}${here}</div>`;
      }).join("");
    }
    else if (type === "journal") {
      title.textContent = "📖 NHẬT KÝ";
      const ch = G.chapters[S.chapter];
      content.innerHTML = ch && ch.journal ? ch.journal() : "<p>Chưa có ghi chép.</p>";
    }
    else if (type === "character") {
      title.textContent = "👤 Tôi VAREL";
      content.innerHTML =
        "<p>Nam nhân có dung mạo thanh tú, tóc đen dài, làn da lạnh như sương. Thân phận hiện tại: linh hồn.</p>" +
        "<p>Quá khứ: ký ức đứt đoạn, có liên hệ bí ẩn với hôn lễ Tiêu gia.</p>" +
        "<p>Mục tiêu: tìm danh tính tân nương và sự thật về Tiêu Cảnh Dư.</p>" +
        "<p><b>Tâm trí:</b> " + Math.round(S.sanity) + "/100 — về 0 là hồn tan.</p>";
    }
    else if (type === "audio") {
      title.textContent = "🔊 ÂM THANH";
      const s = G.audio.settings;
      content.innerHTML =
        `<div class="slider"><span>Nhạc nền</span><input type="range" min="0" max="100" value="${s.music * 100}" data-vol="music"></div>` +
        `<div class="slider"><span>Hiệu ứng</span><input type="range" min="0" max="100" value="${s.sfx * 100}" data-vol="sfx"></div>` +
        `<button class="btn small" id="muteBtn">${s.muted ? "🔇 Đang tắt tiếng — bấm để bật" : "🔊 Tắt toàn bộ âm thanh"}</button>`;
      content.querySelectorAll("[data-vol]").forEach((r) => {
        r.oninput = () => G.audio.setVolume(r.dataset.vol, r.value / 100);
      });
      $("muteBtn").onclick = () => { G.audio.toggleMute(); ui.panel("audio"); };
    }
  };

  /* ---------- Màn hình kết cục ---------- */
  ui.showEnding = function (e, buttons) {
    $("endTag").textContent = e.tag;
    $("endTitle").textContent = e.title;
    $("endText").textContent = e.text;
    const row = $("endButtons");
    row.innerHTML = "";
    buttons.forEach((b) => {
      const el = document.createElement("button");
      el.className = "btn";
      el.textContent = b.label;
      el.onclick = b.action;
      row.appendChild(el);
    });
    $("endScreen").classList.remove("hidden");
  };
  ui.hideEnding = function () { $("endScreen").classList.add("hidden"); };

  G.say = ui.say;
})();
