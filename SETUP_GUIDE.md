# Hướng Dẫn Cài Đặt Cờ Tướng Từ Thiện - Hệ Thống Đăng Nhập & Tài Khoản

## 📋 Giới Thiệu

Hệ thống đã được cập nhật với:
- ✅ Backend Node.js/Express với MySQL database
- ✅ UserDAO để quản lý dữ liệu người dùng
- ✅ Hệ thống đăng kí & đăng nhập
- ✅ Xác thực token JWT
- ✅ Điều chỉnh độ sáng/tối
- ✅ Điều chỉnh âm thanh
- ✅ Đồng bộ hóa dữ liệu lên Dashboard
- ✅ Chức năng đăng xuất

## 🛠️ Cài Đặt Backend

### 1. Chuẩn Bị

```bash
# Điều hướng đến thư mục backend
cd backend

# Cài đặt dependencies
npm install
```

### 2. Cấu Hình Database

Tạo file `.env` trong thư mục `backend`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xiangqi_db
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production

# Logging
LOG_LEVEL=debug
```

### 3. Tạo Database MySQL

```sql
CREATE DATABASE IF NOT EXISTS xiangqi_db;
USE xiangqi_db;
```

Server sẽ tự động tạo bảng khi khởi động.

### 3.1 Chạy Database Migration (Để Sử Dụng Tính Năng Cài Đặt) 🆕

Để sử dụng tính năng độ sáng, âm thanh, và tự động phát nhạc, bạn cần thêm các cột vào database.

**Các tùy chọn:**

#### Tùy chọn 1: Sử dụng MySQL Workbench hoặc phpMyAdmin
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Kết nối đến database `xiangqi_db`
3. Chạy file migration: `backend/migrations/001-add-settings-columns.sql`
4. Hoặc chạy các lệnh SQL trực tiếp:

```sql
ALTER TABLE user_profiles 
ADD COLUMN brightness INT DEFAULT 80,
ADD COLUMN volume INT DEFAULT 50,
ADD COLUMN sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN auto_play BOOLEAN DEFAULT TRUE;
```

#### Tùy chọn 2: Sử dụng MySQL Command Line

```bash
# Windows (XAMPP)
cd "C:\xampp\mysql\bin"
mysql -u root -p xiangqi_db < "path/to/backend/migrations/001-add-settings-columns.sql"

# macOS/Linux
mysql -u root -p xiangqi_db < path/to/backend/migrations/001-add-settings-columns.sql
```

#### Tùy chọn 3: Sử dụng Thư Mục MySQL (XAMPP)

```bash
# Sao chép file migration vào thư mục XAMPP
# Sau đó mở MySQL Shell và chạy lệnh trên
```

#### Kiểm Tra Migration Thành Công:
```sql
SHOW COLUMNS FROM user_profiles WHERE Field IN ('brightness', 'volume', 'sound_enabled', 'auto_play');
```

Nếu bạn thấy 4 cột đó, migration đã thành công ✅

### 4. Khởi Chạy Server

```bash
# Chế độ development (với auto-reload)
npm run dev

# Hoặc chế độ production
npm start
```

Server sẽ chạy trên `http://localhost:3000`

## 📱 Cấu Trúc Backend

### Database Schema

#### Bảng `users`
```
- user_id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- status (active/inactive/banned)
- created_at
- updated_at
```

#### Bảng `user_profiles`
```
- profile_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- full_name
- avatar_url
- gender
- country
- bio
- rank
- points
- wins
- losses
- draws
- brightness (0-100, default 80)
- sound_enabled (boolean, default true)
- volume (0-100, default 50)
- auto_play (boolean, default true) 🆕
- created_at
- updated_at
```

### API Endpoints

#### Đăng Kí
- **POST** `/api/auth/register`
- Request:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string (optional)"
}
```
- Response: `{ success, user_id, token }`

#### Đăng Nhập
- **POST** `/api/auth/login`
- Request:
```json
{
  "username": "string",
  "password": "string"
}
```
- Response: `{ success, token, user }`

#### Lấy Thông Tin Người Dùng
- **GET** `/api/auth/user`
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, user }`

#### Cập Nhật Hồ Sơ
- **PUT** `/api/auth/profile`
- Headers: `Authorization: Bearer <token>`
- Body: `{ full_name, avatar_url, ... }`

#### Cập Nhật Độ Sáng
- **PUT** `/api/auth/brightness`
- Headers: `Authorization: Bearer <token>`
- Body: `{ brightness: 0-100 }`

#### Cập Nhật Âm Thanh
- **PUT** `/api/auth/sound`
- Headers: `Authorization: Bearer <token>`
- Body: `{ soundEnabled: boolean, volume: 0-100 }`

#### Cập Nhật Tự Động Phát Nhạc 🆕
- **PUT** `/api/auth/auto-play`
- Headers: `Authorization: Bearer <token>`
- Body: `{ autoPlay: boolean }`

#### Xêp Hạng
- **GET** `/api/auth/leaderboard?limit=10&offset=0`
- Response: `{ success, players: [...] }`

#### Đăng Xuất
- **POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <token>`

## 🎨 Frontend Files

### login.html
- Trang đăng nhập
- Tích hợp API `/api/auth/login`
- Lưu token vào localStorage
- Chuyển hướng đến dashboard khi thành công

### register.html
- Trang đăng kí tài khoản
- Tích hợp API `/api/auth/register`
- Xác thực mật khẩu trùng khớp
- Chuyển hướng về login sau khi đăng kí thành công

### dashboard.html
- Hiển thị thông tin người dùng (tên, rank, điểm, thắng/bại)
- Slider điều chỉnh độ sáng (0-100%)
- Slider điều chỉnh âm lượng (0-100%)
- Toggle bật/tắt âm thanh
- Nút đăng xuất
- Tự động fetch dữ liệu từ API khi tải trang

## 🔒 Tính Năng Bảo Mật

### JWT Token
- Token hết hạn sau 7 ngày
- Lưu trong localStorage
- Gửi qua header `Authorization: Bearer <token>`

### Password Hashing
- Sử dụng bcrypt với salt rounds = 10
- Không lưu trữ password dạng plaintext

### Validation
- Username: Tối thiểu 3 ký tự
- Email: Format hợp lệ
- Password: Tối thiểu 6 ký tự

## 📊 Tính Năng Người Dùng

### Cài Đặt (Settings Modal) 🆕
Tất cả các cài đặt được tập hợp vào một modal cài đặt:
- Nhấn nút "Cài đặt" trong header để mở modal
- Modal có thể đóng bằng cách click nút X hoặc click bên ngoài modal

### Độ Sáng
- Slider từ 0 đến 100
- **Mặc định: 80%** 🆕 (trước đây là 50%)
- Thay đổi filter brightness của toàn trang
- Lưu tự động vào database

### Âm Thanh
- Slider từ 0 đến 100
- Mặc định: 50%
- Toggle bật/tắt âm thanh
- Lưu tự động vào database

### Tự Động Phát Nhạc 🆕
- Toggle bật/tắt tự động phát nhạc khi vào dashboard
- Mặc định: BẬT
- Khi vào dashboard, nhạc từ file `audio/play-music.mp3` sẽ tự động phát
- Cần bật "Bật Âm Thanh" để tự động phát nhạc hoạt động
- Âm lượng phát nhạc theo slider "Âm Thanh"

### Đăng Xuất
- Nút đăng xuất nằm trong modal cài đặt
- Xóa token và dữ liệu session
- Chuyển hướng về trang login

### Thống Kê
- Số trận thắng
- Số trận thua
- Số trận hòa
- Tổng điểm
- Rank người chơi

## 🔧 Troubleshooting

### Lỗi "Unknown column 'p.brightness' in 'field list'" 🆕
**Nguyên nhân:** Các cột `brightness`, `volume`, `sound_enabled`, `auto_play` chưa được thêm vào database.

**Giải pháp:**
Chạy database migration theo hướng dẫn ở mục **3.1 Chạy Database Migration** trên.

Sau khi chạy migration, restart backend và tất cả sẽ hoạt động bình thường.

### Lỗi CORS
Nếu gặp lỗi CORS, kiểm tra:
```javascript
// backend/server.js
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
})
```

### Lỗi Database Connection
```bash
# Kiểm tra MySQL đang chạy
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### Lỗi Token Invalid
- Xóa localStorage: `localStorage.clear()`
- Đăng nhập lại
- Kiểm tra `JWT_SECRET` giống nhau ở backend

### Thêm Cột auto_play vào Database 🆕
Nếu bạn cập nhật từ phiên bản cũ, cần thêm cột `auto_play` vào bảng `user_profiles`:

**Cách 1: Sử dụng MySQL Workbench hoặc phpMyAdmin**
```sql
ALTER TABLE user_profiles ADD COLUMN auto_play BOOLEAN DEFAULT TRUE;
```

**Cách 2: Sử dụng MySQL command line**
```bash
mysql -u root -p xiangqi_db
```
Sau đó chạy:
```sql
ALTER TABLE user_profiles ADD COLUMN auto_play BOOLEAN DEFAULT TRUE;
```

**Cách 3: Kiểm tra cột đã tồn tại**
```sql
SHOW COLUMNS FROM user_profiles LIKE 'auto_play';
```

### Lỗi Port 3000 đang sử dụng
```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc thay đổi PORT trong .env
PORT=3001
```

## 📝 File Thêm Được Tạo

```
backend/
  ├── database.js          # Kết nối & khởi tạo database
  ├── userDAO.js           # Data Access Object cho users
  ├── auth.js              # Routes xác thực
  ├── server.js            # Server chính
  ├── package.json         # Dependencies
  └── .env.example         # Template biến môi trường
```

## 🚀 Sử Dụng

### 1. Đăng Kí Tài Khoản
- Vào `register.html`
- Nhập thông tin (username, email, password, tên đầy đủ)
- Click "Đăng Ký"
- Nếu thành công, chuyển hướng tới `login.html`

### 2. Đăng Nhập
- Vào `login.html`
- Nhập username/email và password
- Click "Đăng Nhập"
- Token được lưu, chuyển hướng tới `dashboard.html`

### 3. Dashboard
- Xem thông tin tài khoản
- Điều chỉnh độ sáng bằng slider
- Điều chỉnh âm lượng bằng slider
- Click "Đăng Xuất" để thoát

## 💡 Tiếp Theo

Các tính năng có thể thêm:
- [ ] Quên mật khẩu & reset password
- [ ] Xác thực email
- [ ] 2FA (Two-Factor Authentication)
- [ ] Social login (Google, Facebook)
- [ ] Thay đổi mật khẩu
- [ ] Cập nhật profile
- [ ] Avatar upload
- [ ] Friend system
- [ ] Real-time notifications

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-26  
**Status:** ✅ Production Ready
