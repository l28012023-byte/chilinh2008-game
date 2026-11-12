/* ============================================================
   items.js — Vật phẩm. Mỗi vật phẩm có thể DÙNG trong Hành trang.
   use() trả lời bằng G.say(...) tuỳ hoàn cảnh.
   ============================================================ */
G.items = {
  invitation: {
    name: "Thiệp mời đỏ",
    desc: "Thiệp mời dự hôn lễ Tiêu Cảnh Dư. Tên tân nương đã bị bôi đen.",
    use() {
      G.say("Tôi", "Mặt sau thiệp có dòng mực đỏ: “Đến trước khi trống vang lần thứ ba.” Còn dấu vân tay nhỏ ở góc... của một người phụ nữ.");
      G.clue("Trên thiệp có dấu vân tay nhỏ của một người phụ nữ.", "invite_print");
    },
  },

  veil: {
    name: "Khăn Hỷ Cũ",
    desc: "Khăn voan đỏ nằm trong kiệu hoa. Có tiếng nữ nhân cười khẽ.",
    use() {
      const S = G.state;
      if (S.room !== "yard") {
        G.say("Tôi", "Chiếc khăn lạnh toát. Ta nên mang nó đến chỗ có người sống.");
        return;
      }
      if (S.flags.veilUsed) { G.say("Tôi", "Bạch tiểu thư đã nhìn thấy nó rồi."); return; }
      S.flags.veilUsed = true;
      G.sanity(-5);
      G.say("Bạch tiểu thư", "...Khăn này... là của ta. Ba năm trước ta đã được chôn cùng nó.");
      G.clue("Bạch tiểu thư nhận ra Khăn Hỷ Cũ — nàng từng bị chôn cùng nó.", "bai_veil");
    },
  },

  mirror: {
    name: "Gương đồng",
    desc: "Trong gương từng xuất hiện khuôn mặt một nam nhân tái trắng.",
    use() {
      const S = G.state;
      if (S.flags.drumActive) return; // xử lý riêng trong sự kiện trống
      if (S.room === "yard") {
        G.say("Tôi", "Ta nâng gương lên. Giữa đám khách, có một bóng thứ năm đứng sau lưng Lão Trương. Nó mặc hỷ phục.");
        G.clue("Qua gương đồng, có một bóng thứ năm mặc hỷ phục đứng giữa đám khách.", "mirror_yard");
        G.sanity(-8);
      } else {
        G.say("Tôi", "Trong gương chỉ có khuôn mặt ta. Tái hơn bình thường.");
      }
    },
  },

  paper: {
    name: "Mảnh giấy đỏ",
    desc: "Kẻ quay đầu sẽ nhìn thấy tân lang. Nhưng đêm đó, tân lang đã chết trước khi bái đường.",
    use() {
      G.say("Tôi", "Nét chữ này giống hệt chữ trên thiệp mời. Người viết lời cảnh báo và kẻ mời ta... là cùng một người.");
      G.clue("Chữ trên mảnh giấy đỏ giống hệt chữ trên thiệp mời.", "paper_hand");
    },
  },
};
