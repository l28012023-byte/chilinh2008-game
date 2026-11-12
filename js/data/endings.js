/* ============================================================
   endings.js — Các kết cục.
   next: true  → hiện nút "Tiếp tục" (cho kết cục hoàn thành màn)
   ============================================================ */
G.endings = {
  turn: {
    tag: "KẾT CỤC XẤU · QUAY ĐẦU",
    title: "Kẻ quay đầu",
    text: "Ngươi đã quay đầu khi trống còn vang.\n\nTân lang mỉm cười, đặt tay lên vai ngươi: “Khách đã đủ rồi.”\n\nSáng hôm sau, người ta thấy thêm một bộ hỷ phục treo trên cổng Tiêu trạch.",
    next: false,
  },
  hon_tan: {
    tag: "KẾT CỤC XẤU · HỒN TAN",
    title: "Hồn phi phách tán",
    text: "Nỗi sợ nuốt chửng tâm trí ngươi.\n\nTôi đứng giữa sân, mắt mở trừng trừng, cho đến khi ngọn đèn lồng cuối cùng tắt đi.",
    next: false,
  },
  ch1_survive: {
    tag: "MÀN 1 HOÀN THÀNH · SỐNG SÓT",
    title: "Nghênh Thân",
    text: "Ngươi sống sót qua hồi trống đầu tiên.\n\n“Khách đã đủ rồi... Có thể bắt đầu bái đường.”\n\nNhưng ngươi vẫn chưa biết kẻ nào đang chờ trong đại sảnh, và vì sao tên ngươi lại có trên thiệp mời.",
    next: true,
  },
  ch1_truth: {
    tag: "MÀN 1 HOÀN THÀNH · MỘT PHẦN SỰ THẬT",
    title: "Người thấy tân lang",
    text: "Ngươi đã nhìn thấy kẻ không nên nhìn, và vẫn còn sống.\n\nTân lang đã chết trước khi bái đường. Người viết thiệp và người viết lời cảnh báo là một. Kẻ đó muốn ngươi đến... để làm chứng.\n\n“Khách đã đủ rồi... Có thể bắt đầu bái đường.”",
    next: true,
  },
};
