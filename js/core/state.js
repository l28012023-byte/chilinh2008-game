/* ============================================================
   state.js — Đối tượng G toàn cục, trạng thái game, lưu / tải
   Mọi file khác đều gắn thêm hàm vào G.
   ============================================================ */
(function () {
  const G = (window.G = {
    rooms: {},      // dữ liệu phòng      (js/data/rooms.js)
    items: {},      // dữ liệu vật phẩm   (js/data/items.js)
    endings: {},    // kết cục            (js/data/endings.js)
    chapters: {},   // logic từng màn     (js/data/chapter*.js)
    audioConfig: {},// đường dẫn nhạc     (js/data/audio-config.js)
    SAVE_KEY: "minh_hon_save_v2",
    timers: [],
  });

  G.$ = (id) => document.getElementById(id);

  G.newState = () => ({
    chapter: 1,
    room: "road",
    sanity: 100,
    drums: 0,
    items: [],
    clues: [],
    rules: [],
    visited: ["road"],
    done: [],     // vật thể đã dùng xong, dạng "id@room"
    talked: [],   // khách đã nói chuyện
    flags: {},    // cờ tự do cho cốt truyện
    ending: null,
  });

  G.state = G.newState();

  /* ---------- Hẹn giờ có thể huỷ (dùng khi reset / đổi cảnh) ---------- */
  G.later = (fn, ms) => {
    const t = setTimeout(() => {
      G.timers = G.timers.filter((x) => x !== t);
      fn();
    }, ms);
    G.timers.push(t);
    return t;
  };
  G.clearTimers = () => {
    G.timers.forEach(clearTimeout);
    G.timers = [];
  };

  /* ---------- Lưu / tải ---------- */
  G.hasSave = () => {
    try { return !!localStorage.getItem(G.SAVE_KEY); } catch (e) { return false; }
  };

  G.save = (quiet) => {
    try {
      localStorage.setItem(G.SAVE_KEY, JSON.stringify(G.state));
      if (!quiet) G.ui.toast("Đã lưu tiến trình!");
    } catch (e) {
      if (!quiet) G.ui.toast("Không lưu được (trình duyệt chặn).");
    }
  };

  G.loadSave = () => {
    try {
      const raw = localStorage.getItem(G.SAVE_KEY);
      if (!raw) return false;
      G.state = Object.assign(G.newState(), JSON.parse(raw));
      return true;
    } catch (e) {
      return false;
    }
  };

  G.clearSave = () => {
    try { localStorage.removeItem(G.SAVE_KEY); } catch (e) {}
  };
})();
