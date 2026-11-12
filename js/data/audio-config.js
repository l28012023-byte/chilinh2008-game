/* ============================================================
   audio-config.js — KHAI BÁO FILE ÂM THANH CỦA BẠN Ở ĐÂY
   ------------------------------------------------------------
   - Sửa đường dẫn cho khớp với tên file trong thư mục audio/ của bạn.
   - Để trống ("") hoặc file không tồn tại → game tự dùng âm thanh
     tổng hợp (tiếng mưa, trống, ...) nên không bao giờ bị im lặng/lỗi.
   - Muốn thêm bài mới: thêm 1 dòng vào bgm rồi ghi tên bài vào
     thuộc tính bgm của phòng trong js/data/rooms.js.
   ============================================================ */
G.audioConfig = {
  bgm: {
    menu:   "./audio/nhacnendau.mp3",    // màn hình bắt đầu + dẫn truyện
    road:    "./audio/music/road.mp3",     // đường núi
    gate:    "./audio/music/gate.mp3",     // trước cổng
    yard:    "./audio/music/yard.mp3",     // sân trước
    tense:   "./audio/music.mp3",    // lúc trống vang
    after:   "./audio/music/after.mp3",   // sau biến cố
    ending: "./audio/music/ending.mp3",  // kết cục
  },
  sfx: {
    click:     "./audio/sfx/click.mp3",
    pickup:    "./audio/sfx/pickup.mp3",
    drum:      "./audio/sfx/drum.mp3",
    crack:     "./audio/sfx/crack.mp3",
    jump:      "./audio/sfx/jump.mp3",
    door:      "./audio/sfx/door.mp3",
    heartbeat: "./audio/sfx/heartbeat.mp3",
    whisper:   "./audio/sfx/whisper.mp3",
  },
};
