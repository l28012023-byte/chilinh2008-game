/* ============================================================
   scene.js — Hiển thị phòng, vật thể, zoom camera
   ============================================================ */
(function () {
  const $ = G.$;
  const scene = (G.scene = {});

  const key = (id, room) => id + "@" + (room || G.state.room);

  /* Ẩn vĩnh viễn một vật thể trong phòng hiện tại */
  G.hide = function (id) {
    const k = key(id);
    if (!G.state.done.includes(k)) G.state.done.push(k);
    scene.render();
  };
  G.isDone = (id, room) => G.state.done.includes(key(id, room));

  /* ---------- Vào phòng ---------- */
  G.goto = function (roomId) {
    const room = G.rooms[roomId];
    if (!room) { console.warn("Không có phòng:", roomId); return; }
    const S = G.state;
    S.room = roomId;
    if (!S.visited.includes(roomId)) S.visited.push(roomId);

    const el = $("scene");
    el.classList.remove("zoomed", "room-enter");
    el.style.transformOrigin = "center center";
    void el.offsetWidth;
    el.classList.add("room-enter");

    const bg = $("bg");
    bg.classList.remove("pan");
    bg.style.backgroundImage = `url('${room.bg}')`;
    void bg.offsetWidth;
    bg.classList.add("pan");

    G.fx.setRain(room.rain == null ? 1 : room.rain);
    if (room.bgm) G.bgm(room.bgm);

    G.ui.hud();
    scene.render();
    G.save(true); // tự lưu mỗi lần đổi phòng
  };

  /* ---------- Vẽ vật thể ---------- */
  scene.render = function () {
    const box = $("objects");
    box.innerHTML = "";
    const room = G.rooms[G.state.room];
    if (!room) return;

    room.objects.forEach((o) => {
      if (G.isDone(o.id)) return;

      const b = document.createElement("button");
      b.className = "obj" + (o.fx ? " " + o.fx : "");
      b.title = o.name;
      b.style.left = o.x + "%";
      b.style.top = o.y + "%";
      b.style.width = (o.w || 125) + "px";

      if (o.image) {
        const img = new Image();
        img.src = o.image; img.alt = o.name;
        img.onerror = () => {
          img.remove();
          b.classList.add("icon-fallback");
          b.insertBefore(document.createTextNode(o.icon || "❔"), b.firstChild);
        };
        b.appendChild(img);
      } else {
        b.classList.add("icon-fallback");
        b.textContent = o.icon || "❔";
      }

      const label = document.createElement("span");
      label.textContent = o.name;
      b.appendChild(label);
      b.onclick = () => { G.sfx("click"); G.ui.showDetail(o); };
      box.appendChild(b);
    });
  };

  /* ---------- Zoom camera vào vật thể ---------- */
  scene.zoomOn = function (x, y) {
    const el = $("scene");
    el.style.transformOrigin = x + "% " + y + "%";
    el.classList.add("zoomed");
  };
  scene.zoomOff = function () {
    const el = $("scene");
    el.classList.remove("zoomed");
    el.style.transformOrigin = "center center";
  };
})();
