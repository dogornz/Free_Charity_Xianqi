# Quick Start - Cơ Sở Dữ Liệu & API

## 🚀 Bắt Đầu Nhanh (5 phút)

### Bước 1: Cài Đặt Dependencies
```bash
cd backend
npm install
```

### Bước 2: Cấu Hình Database
Tạo file `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=xiangqi_db
JWT_SECRET=secret_key_change_in_production
PORT=3000
```

### Bước 3: Khởi Động Server
```bash
npm run dev
```

Server chạy tại: `http://localhost:3000`

### Bước 4: Truy Cập Ứng Dụng
- Đăng kí: `http://localhost:3000/register.html`
- Đăng nhập: `http://localhost:3000/login.html`
- Dashboard: `http://localhost:3000/dashboard.html`

---

## 📦 Cấu Trúc Dự Án

```
CO_TUONG/
├── backend/
│   ├── database.js       # Database connection & init
│   ├── userDAO.js        # User data operations
│   ├── auth.js           # Authentication routes
│   ├── server.js         # Main server
│   ├── package.json      # Dependencies
│   └── .env.example      # Environment template
│
├── frontend/
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard.html    # User dashboard
│   ├── game.html         # Game page
│   ├── promote.html      # Promotion page
│   ├── style.css         # Styles
│   └── game.js           # Game logic
│
└── SETUP_GUIDE.md        # Full setup documentation
```

---

## 🔑 Key Files

### userDAO.js
```javascript
// Các phương thức chính:
- createUser(username, email, password, fullName)
- loginUser(username, password)
- getUserById(userId)
- updateUserProfile(userId, profileData)
- updateBrightness(userId, brightness)
- updateSoundSettings(userId, soundEnabled, volume)
- getLeaderboard(limit, offset)
```

### database.js
```javascript
// Database initialization
- initializeDatabase()    // Create tables
- getConnection()         // Get DB connection
- getPool()              // Get connection pool
- closePool()            // Close all connections
```

### auth.js
```javascript
// Authentication API routes
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/user
PUT    /api/auth/profile
PUT    /api/auth/brightness
PUT    /api/auth/sound
GET    /api/auth/leaderboard
POST   /api/auth/logout
```

---

## 🔐 Authentication Flow

```
1. User -> register.html
   ├─> Input: username, email, password
   └─> POST /api/auth/register
       └─> Create user in DB
           ✅ Redirect to login

2. User -> login.html
   ├─> Input: username, password
   └─> POST /api/auth/login
       ├─> Verify credentials
       ├─> Generate JWT token
       └─> Save to localStorage
           ✅ Redirect to dashboard

3. User -> dashboard.html
   ├─> Check localStorage token
   ├─> GET /api/auth/user (with token)
   ├─> Display user data
   ├─> Allow brightness/sound settings
   └─> Logout
       └─> Clear localStorage
           ✅ Redirect to login
```

---

## 💾 Database Tables

### users
```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','inactive','banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### user_profiles
```sql
CREATE TABLE user_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(100),
  avatar_url VARCHAR(255),
  gender ENUM('male','female','other') DEFAULT 'other',
  country VARCHAR(50),
  bio TEXT,
  rank VARCHAR(50) DEFAULT 'Novice',
  points INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  brightness INT DEFAULT 50,
  sound_enabled BOOLEAN DEFAULT TRUE,
  volume INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)
```

---

## 🎛️ Dashboard Features

### Điều chỉnh độ sáng
- Slider: 0-100%
- Thay đổi filter brightness của trang
- Lưu tự động vào database

### Điều chỉnh âm thanh
- Slider: 0-100%
- Toggle bật/tắt
- Lưu tự động vào database

### Hiển thị thống kê
- Tên người chơi
- Rank & Level
- Số trận thắng
- Số trận thua
- Tổng điểm

---

## 🐛 Debugging

### Kiểm tra token
```javascript
// Browser console
localStorage.getItem('token')
localStorage.getItem('user')
```

### Kiểm tra API
```bash
# Test đăng kí
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# Test đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### Xem logs
```bash
# Check server logs
npm run dev
```

---

## ✅ Testing Checklist

- [ ] Backend server khởi động không lỗi
- [ ] Database tables tạo thành công
- [ ] Đăng kí tài khoản mới
- [ ] Đăng nhập với tài khoản vừa tạo
- [ ] Token lưu vào localStorage
- [ ] Dashboard hiển thị thông tin user
- [ ] Slider độ sáng hoạt động
- [ ] Slider âm lượng hoạt động
- [ ] Toggle âm thanh hoạt động
- [ ] Nút đăng xuất xóa token
- [ ] Redirect về login sau đăng xuất

---

**Ready to develop! 🚀**
