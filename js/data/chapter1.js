/* ============================================================
   chapter1.js — MÀN 1: NGHÊNH THÂN
   Toàn bộ cốt truyện màn 1 nằm ở đây. Muốn làm màn 2:
   copy file này thành chapter2.js, đổi G.ch1 → G.ch2 và
   đăng ký G.chapters[2] ở cuối file (nhớ thêm <script> vào index.html).
   ============================================================ */

G.introPages = [
  { title: "LỜI MỜI ĐỎ",
    text: "Một đêm mưa phùn, tôi tỉnh dậy với một tấm thiệp đỏ trên tay.\n\nTrên thiệp ghi: Hôn lễ Tiêu gia.\n\nNhưng tên của tân nương đã bị ai đó cố tình xóa mất." },
  { title: "LỜI NHẮN KỲ LẠ",
    text: "Ở mặt sau tấm thiệp có một dòng chữ viết bằng mực đỏ:\n\n“Đến trước khi trống vang lần thứ ba.”\n\nTôi không nhớ vì sao mình lại nhận được tấm thiệp này." },
  { title: "CON ĐƯỜNG ĐẾN TIÊU TRẠCH",
    text: "Trong màn mưa, con đường núi dẫn đến một tòa phủ đệ cổ kính.\n\nHai bên đường treo đầy đèn lồng đỏ. Một chiếc kiệu hoa đứng im lìm trước cổng." },
  { title: "NGHÊNH THÂN",
    text: "Tiếng trống đầu tiên sắp vang lên.\n\nĐêm nay, có những quy tắc tuyệt đối không được vi phạm.\n\nHãy cẩn thận. Đừng tin tất cả những gì ngươi nhìn thấy." },
];

/* Cảnh phim mở đầu: ảnh + lời dẫn */
G.openingScenes = [
  { img: "./images1/moman.png",   text: "Mưa phùn phủ kín con đường núi. Xa trong màn sương là những ánh đèn đỏ le lói." },
  { img: "./images1/kieuhoa.png", text: "Một chiếc kiệu hoa đỏ nằm bất động ngoài cổng. Không có người khiêng. Không có dấu chân." },
  { img: "./images1/cong.png",    text: "Tiếng trống vang lên. Đại môn Tiêu gia chậm rãi mở ra." },
  { img: "./images1/bantiec.jpg", text: "Khách đã đến đủ. Hôn lễ... có thể bắt đầu." },
];

G.guests = {
  zhang: ["Lão Trương", "Nghe cho kỹ. Đêm nay thấy thứ gì cũng đừng lên tiếng. Nói chuyện với ma sẽ bị kéo đi."],
  he:    ["Hách Minh", "Lão già này toàn hù dọa. Ta đi nam chinh bắc chiến, chưa từng sợ ma!"],
  lan:   ["Tiểu Lan", "Mọi người vào nhanh đi... Đêm nay không được ở ngoài sân."],
  bai:   ["Bạch tiểu thư", "... Nàng im lặng, tay nắm chặt một mảnh giấy hỷ nhuốm máu."],
};

/* Lời thoại thêm khi hỏi lại lần 2 — để khách mời có chiều sâu hơn */
G.guestExtra = {
  zhang: "Ta đã đến dự ba lần hôn lễ ở đây. Ba lần, số khách ra về đều ít hơn số khách đến.",
  he:    "Ngươi cũng tin lời lão già đó à? Cẩn thận, kẻ nhát gan chết trước.",
  lan:   "Ta... ta thấy Bạch tiểu thư rất quen. Hình như ta từng thấy cô ấy trên một tấm ảnh thờ.",
  bai:   "...Đừng nhìn ta như vậy. Ta không phải thứ ngươi đang nghĩ.",
};

const RULE1 = "Khi tiếng trống nghênh thân còn vang, không được quay đầu nhìn ra cổng.";

G.ch1 = {
  /* ---------- Bắt đầu màn ---------- */
  begin() {
    const S = G.state;
    S.chapter = 1;
    G.goto("road");
    G.say("Người dẫn chuyện", "Con đường núi chìm trong màn mưa. Hãy nhặt thiệp đỏ và tìm đường đến Tiêu gia.");
  },

  /* ---------- Kiệu hoa ---------- */
  sedanChoice() {
    const S = G.state;
    G.goto("sedan_choice");
  },

  /* ---------- Khách mời ---------- */
talk(id) {
  const S = G.state;

  const [name, text] = G.guests[id];

  const first = !S.talked.includes(id);

  if (first) {
    S.talked.push(id);
  }

  G.say(
    name,
    first ? text : G.guestExtra[id]
  );

  if (!first && id === "lan") {
    G.clue(
      "Tiểu Lan nghĩ đã thấy Bạch tiểu thư trên một tấm ảnh thờ.",
      "lan_photo"
    );
  }

  if (!first && id === "zhang") {
    G.clue(
      "Lão Trương đã dự ba hôn lễ ở Tiêu trạch; số người ra về luôn ít hơn.",
      "zhang_three"
    );
  }

  G.ch1.checkYard();
},

 /* ---------- Điều kiện kích hoạt sự kiện trống ---------- */
checkYard() {

  const S = G.state;

  if (S.flags.drumStarted) return;

  if (S.talked.length < 4) return;

  if (!S.done.includes("couplet@yard")) return;

  S.flags.drumStarted = true;

  G.later(() => {

    G.say(
      "Người dẫn chuyện",
      "Hỷ sự chưa thành chớ quay đầu. Trống chưa dứt chớ rời bàn.",
      [
        {
          label: "Tin lời cảnh báo",
          action: () => G.ch1.setRule(true)
        },
        {
          label: "Ghi chú nhưng vẫn nghi ngờ",
          action: () => G.ch1.setRule(false)
        }
      ]
    );

  }, 2600);

},

  setRule(trust) {
    const S = G.state;
    S.flags.trusted = trust;
    G.rule(0, "Quy tắc #1 — " + (trust ? "ĐÃ GHI NHẬN" : "ĐANG NGHI NGỜ") + ": " + RULE1);
    if (!trust) G.clue("Câu đối cảnh báo khách không được quay đầu và không được rời bàn.", "couplet");
    if (trust) G.sanity(+5);
    G.say("Tôi", "Ta sẽ ghi nhớ. Nhưng nếu lời cảnh báo là thật, ai đã vi phạm nó trước đây?", [
      { label: "Chờ hồi trống tiếp theo", action: () => G.ch1.drumEvent() },
    ]);
  },

  /* ---------- SỰ KIỆN TRỐNG (có đếm giờ) ---------- */
  drumEvent() {
    const S = G.state;
    S.flags.drumActive = true;
    S.drums = 2; G.ui.hud();
    G.bgm("tense"); G.sfx("drum");
    G.say("???", "Chờ ta với...", []);

    G.later(() => { G.sfx("whisper"); G.say("Lão Trương", "ĐỪNG QUAY LẠI! Tiếng gọi ở ngay sau lưng!"); }, 1800);
    G.later(() => G.say("Hách Minh", "Có gì mà sợ? Ta muốn xem kẻ nào giả thần giả quỷ!"), 3400);
    G.later(() => {
      G.sfx("heartbeat");
      const choices = [
        { label: "Đứng yên, nhìn thẳng", action: () => G.ch1.drumResolve("still") },
        { label: "Nhắm mắt lại", action: () => G.ch1.drumResolve("eyes") },
      ];
      if (G.has("mirror")) choices.push({ label: "🪞 Soi gương ra phía sau", action: () => G.ch1.drumResolve("mirror") });
      choices.push({ label: "Quay đầu lại", danger: true, action: () => G.ch1.drumResolve("turn") });
      G.say("Người dẫn chuyện", "Hơi thở lạnh phả vào gáy ngươi. Hách Minh đang quay đầu. Ngươi chỉ có vài giây để quyết định!", choices);
      G.ui.countdown(8, () => G.ch1.drumResolve("freeze"));
    }, 5200);
  },

  drumResolve(how) {
    const S = G.state;
    if (!S.flags.drumActive) return;
    S.flags.drumActive = false;
    G.ui.stopCountdown();

    if (how === "turn") {
      G.sfx("crack"); G.flash(); G.shake();
      G.say("Người dẫn chuyện", "Ngươi quay đầu. Thứ đứng sau lưng ngươi... đang mặc hỷ phục.", []);
      G.later(() => G.endGame("turn"), 2200);
      return;
    }

    // Hách Minh chết ở mọi nhánh còn lại
    G.sfx("crack"); G.shake();
    S.drums = 3; G.ui.hud();

    if (how === "mirror") {
      S.flags.sawGroom = true;
      G.sanity(-10);
      G.clue("Qua gương đồng, ngươi thấy tân lang đứng sau Hách Minh: hắn không có mặt, chỉ có một vết đỏ thẫm.", "groom_mirror");
      G.say("Người dẫn chuyện", "Trong gương, tân lang đứng ngay sau lưng Hách Minh. Hắn không có khuôn mặt. Hách Minh quay đầu... RẮC!");
    } else if (how === "eyes") {
      G.sanity(-5);
      G.say("Người dẫn chuyện", "Ngươi nhắm mắt. Chỉ nghe tiếng trống dừng bặt... RẮC! Rồi tiếng ai đó rơi xuống nền gạch.");
    } else if (how === "freeze") {
      G.sanity(-25);
      G.say("Người dẫn chuyện", "Ngươi cứng đờ vì sợ. May mà chân không nhúc nhích. Hách Minh quay đầu... RẮC!");
    } else {
      G.sanity(-12);
      G.say("Người dẫn chuyện", "Ngươi nhìn thẳng, mắt không chớp. Hách Minh quay đầu. Tiếng trống dừng bặt... RẮC!");
    }

    G.later(() => {
      G.flash();
      G.say("Người dẫn chuyện", "Đèn sáng trở lại. Hách Minh quỳ giữa sân, đầu xoay ngược ra sau, máu chảy từ mắt.");
    }, 2600);
    G.later(() => G.say("Tiểu Lan", "Aaaaa!"), 4600);
    G.later(() => {
      G.say("Người dẫn chuyện", "Một mảnh giấy đỏ rơi khỏi tay Hách Minh. Hãy tìm nó.", [
        { label: "Đến chỗ Hách Minh", action: () => {
            G.goto("after");
            G.say("Người dẫn chuyện", "Mảnh giấy đỏ nằm gần thi thể. Hãy tìm và nhặt nó.");
        } },
      ]);
    }, 6200);
  },

  /* ---------- Nhặt giấy đỏ → kết màn ---------- */
  takePaper() {
    const S = G.state;
    G.hide("paper");
    G.give("paper");
    G.clue(G.items.paper.desc, "paper");
    G.rule(0, "Quy tắc #1 — ĐÃ XÁC NHẬN: " + RULE1);
    G.say("Tôi", "Tân lang đã chết trước khi bái đường...? Vậy ai đang chờ trong Tiêu trạch?", [
      { label: "Hoàn thành màn 1", action: () => G.ch1.finish() },
    ]);
  },

  finish() {
    const S = G.state;
    // Kết cục dựa trên lựa chọn
    let id = "ch1_survive";
    if (S.flags.sawGroom && S.clues.length >= 6) id = "ch1_truth";
    G.endGame(id);
  },

  /* ---------- Gợi ý theo tiến độ ---------- */
  hint() {
    const S = G.state, r = S.room;
    if (r === "road") {
      if (!G.has("invitation")) return "Tấm thiệp đỏ nằm gần chân ngươi. Hãy nhặt nó.";
      if (!S.flags.ghostSeen) return "Thử tiến lại gần bóng người hỷ phục xem nó muốn chỉ điều gì.";
      return "Đi theo hướng bóng người chỉ: con đường đến Tiêu trạch.";
    }
    if (r === "gate") return S.flags.sedan ? "Cánh cổng đang hé mở. Hãy vào trong." : "Chiếc kiệu hoa chắn lối. Hãy xử lý nó.";
    if (r === "yard") {
      if (S.talked.length < 4) return "Hãy nói chuyện với đủ bốn vị khách (hỏi lại lần hai để biết thêm).";
      if (!S.done.includes("couplet@yard")) return "Câu đối phía trên vẫn chưa được đọc.";
      return "Hãy chọn thái độ với lời cảnh báo, rồi chờ hồi trống.";
    }
    if (r === "after") return G.has("paper") ? "Mảnh giấy đã có. Hãy kết thúc màn 1." : "Mảnh giấy đỏ nằm cạnh thi thể Hách Minh.";
    return "Hãy quan sát kỹ mọi thứ xung quanh.";
  },
};

G.chapters[1] = {
  title: "Màn 1 — Nghênh Thân",
  begin: () => G.ch1.begin(),
  hint: () => G.ch1.hint(),
  journal() {
    const S = G.state;
    return "<p><b>Màn 1 — Nghênh Thân</b></p>" +
      "<p>Canh một, mưa phùn. Tôi nhận được thiệp mời dự hôn lễ Tiêu gia. Trên thiệp có lời nhắn: “Đến trước khi trống vang lần thứ ba.”</p>" +
      "<p>" + (S.drums >= 3 ? "Hách Minh đã vi phạm quy tắc và chết bí ẩn." : "Cuộc khám phá vẫn đang tiếp diễn.") + "</p>";
  },
};
