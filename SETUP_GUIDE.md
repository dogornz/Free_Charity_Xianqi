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
- brightness (0-100, default 50)
- sound_enabled (boolean)
- volume (0-100, default 50)
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

### Độ Sáng
- Slider từ 0 đến 100
- Thay đổi filter brightness của toàn trang
- Lưu tự động vào database

### Âm Thanh
- Slider từ 0 đến 100
- Toggle bật/tắt âm thanh
- Lưu tự động vào database

### Thống Kê
- Số trận thắng
- Số trận thua
- Số trận hòa
- Tổng điểm
- Rank người chơi

## 🔧 Troubleshooting

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
