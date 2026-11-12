/* ============================================================
   engine.js — Hàm điều khiển game dùng chung cho mọi màn:
   vật phẩm, manh mối, tâm trí, kết cục, dẫn truyện, khởi động
   ============================================================ */
(function () {
  const $ = G.$;

  /* ---------- Vật phẩm / manh mối / quy tắc ---------- */
  G.has = (id) => G.state.items.includes(id);

  G.give = function (id) {
    if (G.has(id)) return;
    G.state.items.push(id);
    G.sfx("pickup");
    G.ui.toast("Đã nhận: " + G.items[id].name);
  };

  /* key giúp không ghi trùng một manh mối */
  G.clue = function (text, key) {
    const S = G.state;
    if (key) {
      S.flags["clue_" + key] = S.flags["clue_" + key] || 0;
      if (S.flags["clue_" + key]) return;
      S.flags["clue_" + key] = 1;
    }
    if (!S.clues.includes(text)) {
      S.clues.push(text);
      G.ui.toast("🔍 Manh mối mới");
    }
  };

  G.rule = function (idx, text) {
    G.state.rules[idx] = text;
    G.ui.toast("📜 Sổ quy tắc đã cập nhật");
  };

  G.useItem = function (id) {
    const it = G.items[id];
    if (it && it.use) it.use();
  };

  /* ---------- Tâm trí ---------- */
  G.sanity = function (delta) {
    const S = G.state;
    if (S.ending) return;
    S.sanity = Math.max(0, Math.min(100, S.sanity + delta));
    G.ui.hud();
    if (delta < 0) G.fx.setRain(1.5 - S.sanity / 200);
    G.fx.lowSanityLoop(S.sanity <= 35 && S.sanity > 0);
    if (S.sanity <= 0) {
      G.ui.stopCountdown();
      G.state.flags.drumActive = false;
      G.later(() => G.endGame("hon_tan"), 900);
    }
  };

  /* ---------- Kết cục ---------- */
  G.endGame = function (id) {
    const S = G.state;
    const e = G.endings[id];
    if (!e || S.ending) return;
    S.ending = id;
    G.clearTimers();
    G.ui.stopCountdown();
    G.fx.lowSanityLoop(false);
    G.bgm("ending");
    G.ui.closeDetail();
    G.ui.closePanel();

    const buttons = [{ label: "Chơi lại từ đầu", action: () => G.restart() }];
    if (e.next) {
      buttons.unshift({
        label: "Tiếp tục →",
        action: () => {
          G.ui.hideEnding();
          const nextCh = G.chapters[S.chapter + 1];
          if (nextCh) { S.ending = null; S.chapter++; nextCh.begin(); }
          else {
            G.say("Người dẫn chuyện", "MÀN " + (S.chapter + 1) + " — Sắp được phát triển. Cảm ơn bạn đã chơi!", [
              { label: "Xem nhật ký", action: () => G.ui.panel("journal") },
            ]);
          }
        },
      });
    }
    G.ui.showEnding(e, buttons);
  };

  G.restart = function () {
    G.clearTimers();
    G.ui.stopCountdown();
    G.ui.hideEnding();
    G.state = G.newState();
    G.clearSave();
    G.fx.lowSanityLoop(false);
    G.fx.setRain(1);
    G.chapters[1].begin();
  };

  /* ---------- Gợi ý ---------- */
  G.hint = function () {
    const ch = G.chapters[G.state.chapter];
    G.ui.toast("💡 " + (ch && ch.hint ? ch.hint() : "Hãy quan sát kỹ xung quanh."), 4500);
  };

  /* ---------- Dẫn truyện từng trang ---------- */
  let introPage = 0;

  G.showIntro = function () {
    introPage = 0;
    $("startScreen").classList.add("hidden");
    $("introScreen").classList.remove("hidden");
    renderIntro();
  };

  function renderIntro() {
    const p = G.introPages[introPage];
    $("introNumber").textContent = "TRANG " + (introPage + 1) + " / " + G.introPages.length;
    $("introTitle").textContent = p.title;
    $("introText").textContent = p.text;
    $("btnIntroNext").textContent = introPage === G.introPages.length - 1 ? "VÀO GAME →" : "TIẾP TỤC →";
  }

  function nextIntro() {
    if (introPage < G.introPages.length - 1) { introPage++; renderIntro(); }
    else { $("introScreen").classList.add("hidden"); G.playOpening(); }
  }

  /* ---------- Cảnh phim mở đầu (bấm bỏ qua được) ---------- */
  let skipOpening = false;

  G.playOpening = async function () {
    G.state = G.newState();
    G.clearSave();
    $("game").classList.remove("hidden");
    G.fx.startRain();
    G.fx.setRain(1);
    G.ui.hud();
    $("choices").innerHTML = "";
    $("objects").innerHTML = "";
    G.bgm("road");
    skipOpening = false;

    // Chờ ms mili-giây, nhưng thoát sớm nếu người chơi bấm "Bỏ qua"
    const wait = (ms) => new Promise((r) => {
      const t0 = Date.now();
      const tick = setInterval(() => {
        if (skipOpening || Date.now() - t0 >= ms) { clearInterval(tick); r(); }
      }, 100);
    });
    const skipBtn = [{ label: "Bỏ qua ⏭", action: () => { skipOpening = true; } }];

    for (const s of G.openingScenes) {
      if (skipOpening) break;
      await G.fade(900);
      $("bg").style.backgroundImage = `url('${s.img}')`;
      G.ui.say("Người dẫn chuyện", s.text, skipBtn);
      G.unfade();
      await wait(3800);
    }
    await G.fade(700);
    G.unfade();
    G.chapters[1].begin();
  };

  /* ---------- Tiếp tục từ file lưu ---------- */
  G.continueGame = function () {
    if (!G.loadSave()) { G.ui.toast("Chưa có dữ liệu lưu."); return; }
    $("startScreen").classList.add("hidden");
    $("game").classList.remove("hidden");
    G.fx.startRain();
    const S = G.state;
    S.flags.drumActive = false;
    // Nếu thoát giữa sự kiện trống, cho chơi lại từ lúc chờ trống
    if (S.room === "yard" && S.flags.drumStarted && S.drums < 3) S.flags.drumStarted = false;
    G.goto(S.room);
    G.say("Hệ thống", "Đã tải tiến trình. Tâm trí: " + Math.round(S.sanity) + "/100.");
    if (S.sanity <= 35) G.fx.lowSanityLoop(true);
  };

  /* ---------- Gắn sự kiện giao diện ---------- */
  G.bindUI = function () {
    $("btnStart").onclick = () => { G.audio.unlock(); G.bgm("menu"); G.sfx("click"); G.showIntro(); };
    $("btnContinue").onclick = () => { G.audio.unlock(); G.continueGame(); };
    $("btnIntroNext").onclick = () => { G.sfx("click"); nextIntro(); };
    $("btnIntroSkip").onclick = () => { $("introScreen").classList.add("hidden"); G.playOpening(); };

    $("tools").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-panel]");
      if (b) { G.sfx("click"); G.ui.panel(b.dataset.panel); }
    });
    $("btnHint").onclick = () => { G.sfx("click"); G.hint(); };
    $("btnSave").onclick = () => { G.sfx("click"); G.save(); };

    $("detailClose").onclick = () => G.ui.closeDetail();
    $("detailAction").onclick = () => G.ui.confirmDetail();
    $("panelClose").onclick = () => G.ui.closePanel();
    $("dialogueText").onclick = () => G.ui.skipTyping();

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { G.ui.closePanel(); G.ui.closeDetail(); }
      else if (e.key === " " || e.key === "Enter") {
        if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
        G.ui.skipTyping();
      }
      else if (e.key === "m" || e.key === "M") G.ui.toast(G.audio.toggleMute() ? "🔇 Đã tắt tiếng" : "🔊 Đã bật tiếng");
      else if ((e.key === "h" || e.key === "H") && !$("game").classList.contains("hidden")) G.hint();
    });

    // Mở khoá âm thanh ngay từ lần chạm đầu tiên
    document.addEventListener("pointerdown", () => G.audio.unlock(), { once: true });
  };
})();
