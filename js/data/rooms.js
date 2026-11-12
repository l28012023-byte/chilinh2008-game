/* ============================================================
   rooms.js — Các phòng / cảnh và vật thể trong từng phòng.

   Mỗi vật thể:
     id, name, image, icon (emoji dự phòng), desc (hiện khi xem chi tiết)
     x, y   : vị trí tâm vật thể, tính theo % màn hình
     w      : độ rộng vật thể (px)  ← CHỈNH TO/NHỎ Ở ĐÂY
     fx     : hiệu ứng nhẹ: "float" | "glint" | "flicker" (tuỳ chọn)
     act()  : chạy khi người chơi bấm "Tương tác"

   Thêm phòng mới: copy 1 khối rooms, đổi tên, rồi dùng G.goto("tên").
   ============================================================ */

G.rooms.road = {
  title: "Đường núi · Canh một",
  bg: "./images1/moman.png",
  bgm: "road",
  rain: 1,
  objects: [
    {
      id: "invite", name: "Thiệp mời đỏ", icon: "🧧",
      image: "./objects/thiepcuoi.png",
      x: 27, y: 77, w: 95, fx: "glint",
      desc: "Một tấm thiệp hỷ đỏ thẫm nằm giữa con đường ướt mưa. Trên thiệp ghi tên Tiêu Cảnh Dư, nhưng tên tân nương đã bị bôi đen.",
      act() {
        G.hide("invite");
        G.give("invitation");
        G.say("Elian", "Tiêu Cảnh Dư... Tên tân nương lại bị xóa mất. “Đến trước khi trống vang lần thứ ba.”", [
          { label: "Nhìn quanh", action: () => G.say("Elian", "Một bóng người mặc hỷ phục đứng lặng bên rìa rừng. Nó không nhúc nhích.") },
        ]);
      },
    },
    {
  id: "ghost",
  name: "Bóng người hỷ phục",
  icon: "👤",
  image: "./objects/bongden.png",
  x: 17,
  y: 50,
  w: 210,
  fx: "float",

  desc: "Một nam nhân mặc hỷ phục đứng nép sau thân cây. Bóng dáng hắn mờ nhạt như sắp tan vào màn mưa.",

  act() {
    const S = G.state;

    if (S.flags.ghostSeen) {
      G.say("Elian", "Người đó đã biến mất... nhưng ta vẫn cảm thấy có ánh mắt đang dõi theo mình.");
      return;
    }

    // Đánh dấu đã gặp nam nhân
    S.flags.ghostSeen = true;

    // Hiệu ứng kinh dị
    G.sfx("jump");
    G.flash();
    G.sanity(-5);

    // Ẩn bóng người sau thân cây
    G.hide("ghost");

    // Hiện ảnh nam nhân ôm nữ chính
    const overlay = document.getElementById("ghost-overlay");

    overlay.classList.remove("hidden");
    overlay.classList.remove("play");

    // Khởi động lại animation
    void overlay.offsetWidth;

    overlay.classList.add("play");

    // Ghi nhận manh mối
    G.clue(
      "Một nam nhân mặc hỷ phục bất ngờ xuất hiện phía sau và ôm chặt lấy ta. Hắn dường như đã chờ đợi ta từ rất lâu.",
      "ghost_embrace"
    );

    // Sau 4.5 giây, ảnh biến mất
    setTimeout(() => {
      overlay.classList.remove("play");
      overlay.classList.add("hidden");

      // Lời thoại sau khi hắn biến mất
      G.say(
        "Em ta đã đợi em",
        "Cuối cùng... em cũng đến rồi."
      );

      G.say(
        "Tôi",
        "Hơi lạnh từ vòng tay ấy vẫn còn vương trên eo ta... Người đó rốt cuộc là ai?"
      );

    }, 6000);
  }
},
    {
      id: "path", name: "Đường đến Tiêu trạch", icon: "🪷",
      image: "./objects/duongvaotieugia.png",
      x: 64, y: 52, w: 235,
      desc: "Con đường dẫn đến Tiêu trạch. Ánh đèn đỏ le lói phía xa.",
      act() {
        if (!G.has("invitation")) {
          G.say("Elian", "Không có thiệp mời thì ta không được phép vào. Tấm thiệp đỏ đang nằm gần chân ta.");
          return;
        }
        G.goto("gate");
        G.say("Người dẫn chuyện", "Mưa phùn lạnh buốt. Trống thứ nhất vang lên từ trong phủ. Một chiếc kiệu hoa đỏ chắn trước cổng.");
        G.sfx("drum");
        G.state.drums = 1; G.ui.hud();
      },
    },
  ],
};

G.rooms.gate = {
  title: "Trước cổng Tiêu trạch",
  bg: "./images1/cong.png",
  bgm: "gate",
  rain: 1,

  objects: [
    {
      id: "sedan",
      name: "Kiệu hoa đỏ",
      icon: "🪷",
      image: "./objects/kieuhoado.png",

      x: 33,
      y: 70,
      w: 350,

      desc: "Chiếc kiệu hoa đỏ không có người khiêng. Rèm kiệu khẽ lay dù xung quanh không có gió.",

     act() {

  if (G.state.flags.sedanDone) {
    G.say(
      "Tôi",
      "Ta đã kiểm tra chiếc kiệu này rồi."
    );
    return;
  }

  G.goto("sedan_choice");
}
    },

    {
  id: "entrance",
  name: "Cổng Tiêu trạch",

  x: 78,
  y: 53,
  w: 550,

  desc: "Đại môn Tiêu gia đang hé mở. Bên trong vọng ra tiếng trống cưới.",

  act() {
    if (!G.state.flags.sedan) {
      G.say("Elian", "Chiếc kiệu chắn ngang lối vào. Ta phải xử lý nó trước.");
      return;
    }

    G.sfx("door");
    G.goto("yard");

    G.say(
      "Người dẫn chuyện",
      "Cửa Tiêu trạch mở ra. Bốn vị khách đang chờ dưới đèn lồng."
    );
  }
}
  ],
};
G.rooms.sedan_choice = {
  title: "Kiệu Hoa",

  bg: "./images1/kieu_choice.png",

  bgm: "gate",
  rain: 1,

  objects: [

    {
      id: "open",

      image: "./choices/open.jpg",

      x: 20,
      y: 60,
      w: 220,

     act() {

  G.goto("sedan_open");

}
    },

    {
      id: "bypass",

      image: "./choices/bypass.png",

      x: 50,
      y: 60,
      w: 220,

      act() {
        G.goto("sedan_bypass");
      }
    },

    {
      id: "stare",

      image: "./choices/stare.jpg",

      x: 80,
      y: 60,
      w: 220,

      act() {
        G.goto("sedan_stare");
      }
    }

  ]
};
G.rooms.sedan_open = {
  title: "Mở rèm",
  bg: "./images1/open_sedan.png",
  bgm: "gate",

  objects: [
    {
      id: "continue",
      name: "Tiếp tục",
      icon: "➡️",

      x: 90,
      y: 90,
      w: 120,

      act() {

        const S = G.state;
        S.flags.sedanDone = true;
        S.flags.sedan = "open";

        G.give("veil");
        G.give("mirror");

        G.sanity(-10);

        G.clue(
          "Kiệu hoa trống rỗng, chỉ có khăn voan đỏ và gương đồng.",
          "sedan_open"
        );

        G.say(
  "Tôi",
  "Bên trong không có ai... chỉ có chiếc khăn và một tấm gương. Nhưng ta chắc chắn đã nghe tiếng cười.",
  [
    {
      label: "Tiếp tục",
      action: () => G.goto("gate")
    }
  ]
);
      }
    }
  ]
};

G.rooms.sedan_bypass = {
  title: "Đi vòng qua",
  bg: "./images1/bypass_sedan.png",
  bgm: "gate",

  objects: [
    {
      id: "continue",
      name: "Tiếp tục",
      icon: "➡️",

      x: 90,
      y: 90,
      w: 120,

      act() {

        const S = G.state;
        S.flags.sedanDone = true;

        S.flags.sedan = "bypass";

        G.sanity(+5);

        G.clue(
          "Tôi đã tránh chạm vào kiệu hoa.",
          "sedan_bypass"
        );

        G.goto("gate");

        G.say(
          "Tôi",
          "Ta không nên động vào nó. Cánh cổng đang hé mở. Tâm trí ta có vẻ tỉnh táo hơn."
        );
      }
    }
  ]
};
G.rooms.sedan_stare = {
  title: "Nhìn vào gương",
  bg: "./images1/stare_mirror.jpg",
  bgm: "gate",

  objects: [
    {
      id: "continue",
      name: "Tiếp tục",
      icon: "➡️",

      x: 90,
      y: 90,
      w: 120,

      act() {

        const S = G.state;
        S.flags.sedanDone = true;

        S.flags.sedan = "stare";
        S.flags.sawFace = true;

        G.give("mirror");

        G.sanity(-15);

        G.clue(
          "Gương đồng phản chiếu khuôn mặt một nam nhân tái trắng.",
          "sedan_stare"
        );

        G.flash();
        G.sfx("jump");

        G.goto("gate");

        G.say(
          "???",
          "Một khuôn mặt nam nhân tái trắng hiện lên trong gương... và nó đang mỉm cười với ngươi."
        );
      }
    }
  ]
};
G.rooms.yard = {
  title: "Sân trước Tiêu trạch",
  bg: "./images1/santruoc.png",
  bgm: "yard",
  rain: 0.4,

  objects: [
    {
      id: "zhang",
      name: "Lão Trương",
      x: 15, y: 58, w: 125,
      desc: "Lão Trương có vẻ sợ hãi. Ông liên tục nhìn về phía cánh cổng.",
      act() {
        G.goto("zhang_scene");
      }
    },
    {
      id: "he",
      name: "Hách Minh",
      x: 38, y: 58, w: 125,
      desc: "Hách Minh tỏ ra kiêu ngạo và không tin vào những lời cảnh báo.",
      act() {
        G.goto("he_scene");
      }
    },
    {
      id: "lan",
      name: "Tiểu Lan",
      x: 62, y: 58, w: 125,
      desc: "Tiểu Lan đang run rẩy. Cô muốn mọi người nhanh chóng vào trong.",
      act() {
        G.goto("lan_scene");
      }
    },
    {
      id: "bai",
      name: "Bạch tiểu thư",
      x: 85, y: 58, w: 125,
      desc: "Bạch tiểu thư im lặng, bàn tay nắm chặt một mảnh giấy hỷ nhuốm máu.",
      act() {
        G.goto("bai_scene");
      }
    },
    {
      id: "couplet",
      name: "Câu đối",
      icon: "📜",
      image: "./objects/caudoi.png",
      x: 50, y: 23, w: 170,
      desc: "Hỷ sự chưa thành chớ quay đầu. Trống chưa dứt chớ rời bàn.",
      act() {
        G.hide("couplet");
        G.sfx("pickup");
        G.say(
          "Elian",
          "Hỷ sự chưa thành chớ quay đầu. Trống chưa dứt chớ rời bàn. Đây là lời cảnh cáo."
        );
        G.ch1.checkYard();
      }
    }
  ]
};
G.rooms.zhang_scene = {
  title: "Lão Trương",
  bg: "./images1/zhang_scene.png",
  bgm: "yard",
  rain: 0,

  objects: [
    {
      id: "talk",
      name: "Trò chuyện",
      x: 50,
      y: 70,
      w: 160,

      act() {
        G.ch1.talk("zhang");
      }
    },

    {
  id: "back",
  name: "Quay lại",
  icon: "⬅️",

  x: 15,
  y: 15,
  w: 120,

  act() {
    G.goto("yard");
  }
}
  ]
};
G.rooms.he_scene = {
  title: "HacMinh",
  bg: "./images1/he_scene.png",
  bgm: "yard",
  rain: 0,

  objects: [
    {
      id: "talk",
      name: "Trò chuyện",
      x: 50,
      y: 70,
      w: 160,

      act() {
        G.ch1.talk("he");
      }
    },

    {
  id: "back",
  name: "Quay lại",
  icon: "⬅️",

  x: 15,
  y: 15,
  w: 120,

  act() {
    G.goto("yard");
  }
}
  ]
};
G.rooms.lan_scene = {
  title: "Tiểu Lan",
  bg: "./images1/lan_scene.png",
  bgm: "yard",
  rain: 0,

  objects: [
    {
      id: "talk",
      name: "Trò chuyện",
      x: 50,
      y: 70,
      w: 160,

      act() {
        G.ch1.talk("lan");
      }
    },

    {
  id: "back",
  name: "Quay lại",
  icon: "⬅️",

  x: 15,
  y: 15,
  w: 120,

  act() {
    G.goto("yard");
  }
}
  ]
};
G.rooms.bai_scene = {
  title: "Bạch Tiểu Thư",
  bg: "./images1/bai_scene.png",
  bgm: "yard",
  rain: 0,

  objects: [
    {
      id: "talk",
      name: "Trò chuyện",
      x: 50,
      y: 70,
      w: 160,

      act() {
        G.ch1.talk("bai");
      }
    },

    {
  id: "back",
  name: "Quay lại",
  icon: "⬅️",

  x: 15,
  y: 15,
  w: 120,

  act() {
    G.goto("yard");
  }
}
  ]
};
G.rooms.after = {
  title: "Sân Tiêu trạch · Sau biến cố",
  bg: "./images1/hacminhdie.jpg",
  bgm: "after",
  rain: 0.2,

  objects: [

    {
      id: "paper",
      name: "Mảnh giấy đỏ",

      icon: "🧧",
      image: "./objects/giaydo.png",

      x: 70,
      y: 78,
      w: 95,

      fx: "glint",

      desc: "Một mảnh giấy đỏ nằm cạnh thi thể. Trên đó có những dòng chữ kỳ lạ.",

      act() {

  if (G.state.flags.paperTaken) return;

  G.state.flags.paperTaken = true;

  G.hide("paper");

  G.ch1.takePaper();

}
    }

  ]
};
