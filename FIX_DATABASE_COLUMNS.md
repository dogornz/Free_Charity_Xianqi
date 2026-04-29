# 🔧 Hướng Dẫn Khắc Phục Lỗi - Cường Lực Sửa Chữa

## ❌ Lỗi Hiện Tại
```
Get user error: Unknown column 'p.brightness' in 'field list'
```

## ✅ Lý Do Lỗi
Bạn vừa cập nhật ứng dụng để thêm tính năng cài đặt (độ sáng, âm thanh, tự động phát nhạc), nhưng database chưa có các cột cần thiết để lưu trữ những cài đặt này.

## 🛠️ Cách Khắc Phục (Chọn 1 trong 3 cách)

### Cách 1: Sử dụng phpMyAdmin (Dễ Nhất) ⭐

1. Mở phpMyAdmin: `http://localhost/phpmyadmin`
2. Đăng nhập với tài khoản MySQL của bạn (thường là `root`, không có mật khẩu)
3. Chọn database `xiangqi_db` ở thanh bên trái
4. Chọn table `user_profiles`
5. Nhấp vào tab **"SQL"** ở phía trên
6. Dán đoạn code dưới đây vào ô nhập liệu:

```sql
ALTER TABLE user_profiles 
ADD COLUMN brightness INT DEFAULT 80,
ADD COLUMN volume INT DEFAULT 50,
ADD COLUMN sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN auto_play BOOLEAN DEFAULT TRUE;
```

7. Nhấn **"Go"** hoặc **"Thực thi"**
8. Nếu không có lỗi, bạn sẽ thấy thông báo thành công ✅

---

### Cách 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến MySQL server của bạn
3. Chọn database `xiangqi_db`
4. Click chuột phải vào table `user_profiles` → **Alter Table**
5. Thêm 4 cột mới:
   - `brightness` (INT, default 80)
   - `volume` (INT, default 50)
   - `sound_enabled` (BOOLEAN, default TRUE)
   - `auto_play` (BOOLEAN, default TRUE)
6. Nhấn **Apply**

---

### Cách 3: Sử dụng MySQL Command Line (Nâng Cao)

```bash
# Windows (XAMPP)
cd C:\xampp\mysql\bin
mysql -u root -p xiangqi_db

# Hoặc macOS/Linux
mysql -u root -p xiangqi_db
```

Sau đó chạy lệnh SQL:
```sql
ALTER TABLE user_profiles 
ADD COLUMN brightness INT DEFAULT 80,
ADD COLUMN volume INT DEFAULT 50,
ADD COLUMN sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN auto_play BOOLEAN DEFAULT TRUE;
```

Gõ `EXIT;` để thoát.

---

## ✔️ Kiểm Tra Migration Thành Công

Chạy lệnh này để xác nhận các cột đã được thêm:

```sql
SHOW COLUMNS FROM user_profiles WHERE Field IN ('brightness', 'volume', 'sound_enabled', 'auto_play');
```

Bạn phải thấy 4 dòng kết quả, mỗi dòng đại diện cho một cột.

---

## 🚀 Bước Tiếp Theo

Sau khi chạy xong migration:

1. **Dừng backend** (nếu đang chạy): Nhấn `Ctrl+C` trong terminal
2. **Khởi chạy lại backend**: `npm run dev`
3. **Làm mới trang browser**: `Ctrl+F5` hoặc `Cmd+Shift+R`
4. **Đăng nhập lại** vào dashboard
5. Bây giờ bạn có thể sử dụng tất cả tính năng cài đặt! 🎉

---

## 📝 Danh Sách Tính Năng Mới (Sau Migration)

✅ Điều chỉnh độ sáng (0-100%, mặc định 80%)  
✅ Điều chỉnh âm lượng (0-100%, mặc định 50%)  
✅ Bật/tắt âm thanh  
✅ Tự động phát nhạc từ `audio/play-music.mp3`  
✅ Đặt cài đặt mặc định cho người dùng mới  
✅ Lưu tất cả cài đặt vào database  

---

## ❓ Thắc Mắc Thêm?

Nếu gặp vấn đề khác:
- Kiểm tra console của browser (F12) để xem lỗi chi tiết
- Kiểm tra terminal backend để xem log lỗi
- Xem file `SETUP_GUIDE.md` để biết thêm chi tiết

**Chúc bạn thành công!** 🚀
