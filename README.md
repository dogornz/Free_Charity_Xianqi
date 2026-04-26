# 🏮 Cờ Tướng Từ Thiện

> Ứng dụng chơi cờ tướng trực tuyến với giao diện hiện đại, hệ thống tài khoản người dùng, và hỗ trợ đầy đủ luật chơi tiêu chuẩn.

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
- [Biến Môi Trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Luồng Điều Hướng](#-luồng-điều-hướng)
- [Quân Cờ & Luật Di Chuyển](#-quân-cờ--luật-di-chuyển)
- [Trạng Thái Trò Chơi](#-trạng-thái-trò-chơi)
- [Giao Diện Người Dùng](#-giao-diện-người-dùng)
- [Chi Tiết Kỹ Thuật](#-chi-tiết-kỹ-thuật)
- [Tài Nguyên & Thư Viện](#-tài-nguyên--thư-viện)
- [Troubleshooting](#-troubleshooting)

---

## 📖 Giới Thiệu

**Cờ Tướng Từ Thiện** là ứng dụng web chơi cờ tướng (Chinese Chess / Xiangqi) với hệ thống tài khoản người dùng đầy đủ. Frontend được xây dựng bằng HTML, CSS và JavaScript thuần. Backend sử dụng Node.js + Express + MySQL, tích hợp JWT authentication.

Engine cờ tướng `xiangqi.js` xử lý toàn bộ logic luật chơi, cung cấp giao diện trực quan và responsive cho cả desktop lẫn thiết bị di động.

---

## ✨ Tính Năng

### Xác Thực & Tài Khoản
- Đăng ký / Đăng nhập bằng username hoặc email
- Xác thực JWT token, tự động hết hạn sau 7 ngày
- Lưu thông tin profile: avatar, điểm hạng, thắng/thua/hòa
- Cài đặt cá nhân: độ sáng màn hình, âm lượng, bật/tắt âm thanh

### Gameplay
- Bàn cờ tướng tiêu chuẩn **10×9** với đầy đủ 32 quân cờ
- Hỗ trợ toàn bộ luật di chuyển cho 7 loại quân: Xe, Mã, Tượng, Sĩ, Tướng, Pháo, Tốt
- Phát hiện **chiếu tướng** (check) theo thời gian thực
- Phát hiện **chiếu bí** (checkmate) và kết thúc ván
- Phát hiện **hòa cờ** (stalemate)
- Quy tắc **Phi Tướng** (Tướng đối mặt trực tiếp)
- Quân Tốt tăng khả năng di chuyển khi **vượt sông**
- Tượng và Sĩ bị chặn nước theo đúng luật

### Giao Diện
- Highlight ô được chọn và các nước đi hợp lệ
- Hiển thị **lịch sử nước đi** theo thời gian thực
- Theo dõi **quân đã ăn** của mỗi bên
- Đồng hồ đếm thời gian cho mỗi người chơi
- **Hiệu ứng mở cửa** khi vào trang chủ
- Responsive: tự động chuyển asset ảnh giữa mobile và desktop

### Âm Thanh & Cài Đặt
- Nhạc nền tự động phát khi vào bàn cờ
- Bật/tắt âm thanh, điều chỉnh âm lượng
- Điều chỉnh độ sáng màn hình
- Tất cả cài đặt đồng bộ với backend và áp dụng ngay lập tức

---

## 📁 Cấu Trúc Dự Án

```
CO_TUONG/
│
├── frontend/
│   ├── promote.html          # Màn hình chào / giới thiệu
│   ├── login.html            # Đăng nhập
│   ├── register.html         # Đăng ký tài khoản
│   ├── dashboard.html        # Trang chủ sau khi đăng nhập
│   ├── game.html             # Giao diện bàn cờ chính
│   └── style.css             # Toàn bộ stylesheet
│
├── backend/
│   ├── server.js             # Entry point, cấu hình Express
│   ├── auth.js               # Routes xác thực (register, login, profile...)
│   ├── userDAO.js            # Data Access Object — thao tác với MySQL
│   ├── database.js           # Kết nối MySQL connection pool
│   ├── game.js               # Engine game chính (logic bàn cờ, nước đi, UI)
│   └── xiangqi.js            # Thư viện Xiangqi engine (FEN, luật cờ chuẩn)
│
├── assets/
│   ├── desktop/              # Ảnh quân cờ cho màn hình desktop
│   └── mobile/               # Ảnh quân cờ tối ưu cho thiết bị di động
│
├── audio/
│   └── play-music.mp3        # Nhạc nền trong ván cờ
│
├── .env.example              # Mẫu biến môi trường
├── API_DOCS.md
├── QUICK_START.md
├── SETUP_GUIDE.md
└── TROUBLESHOOTING.md
```

---

## 💻 Yêu Cầu Hệ Thống

| Thành phần | Phiên bản tối thiểu |
|---|---|
| Node.js | 18+ |
| MySQL | 8.0+ |
| Trình duyệt | Chrome / Firefox / Edge / Safari (ES6+) |

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Clone dự án

```bash
git clone <repo-url>
cd CO_TUONG
```

### 2. Cài đặt dependencies

```bash
cd backend
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env theo cấu hình máy bạn
```

### 4. Khởi động server

```bash
npm start
# hoặc development mode
npm run dev
```

Truy cập: `http://localhost:3000`

### Chạy không cần backend (chỉ game)

Mở trực tiếp `frontend/promote.html` trong trình duyệt hoặc dùng Live Server:

```bash
npx serve .
# Truy cập http://localhost:3000/frontend/promote.html
```

### Test trên thiết bị mobile (cùng mạng WiFi)

```bash
# Lấy IP máy tính
ipconfig      # Windows
ifconfig      # Mac/Linux

# Đổi API_URL trong login.html, register.html, dashboard.html
const API_URL = "http://192.168.x.x:3000/api";

# Thiết bị mobile truy cập http://192.168.x.x:3000
```

### Test public qua Cloudflare Tunnel

```bash
# Cài cloudflared
winget install Cloudflare.cloudflared   # Windows
brew install cloudflared                 # Mac

# Chạy tunnel (không cần tài khoản)
cloudflared tunnel --url http://localhost:3000
# Nhận URL dạng: https://xxxx.trycloudflare.com
```

---

## ⚙️ Biến Môi Trường

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=co_tuong

# JWT
JWT_SECRET=your_secret_key_change_in_production

# Server
PORT=3000
NODE_ENV=development

# CORS (URL frontend hoặc Cloudflare tunnel)
FRONTEND_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/login` | Đăng nhập, trả về JWT token | ❌ |
| GET | `/user` | Lấy thông tin user hiện tại | ✅ |
| PUT | `/profile` | Cập nhật profile | ✅ |
| PUT | `/brightness` | Cập nhật độ sáng (0–100) | ✅ |
| PUT | `/sound` | Cập nhật cài đặt âm thanh | ✅ |
| GET | `/leaderboard` | Bảng xếp hạng top người chơi | ❌ |
| POST | `/logout` | Đăng xuất | ✅ |

**Headers cho route có Auth:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 🔀 Luồng Điều Hướng

```
promote.html
    │
    └──[Chơi Ngay]──► login.html ──► dashboard.html ──► game.html
                            │
                      register.html
```

- **promote.html** — Màn hình giới thiệu, nút dẫn vào đăng nhập
- **login.html** — Đăng nhập bằng username hoặc email
- **register.html** — Tạo tài khoản mới
- **dashboard.html** — Trang chủ: thông tin người dùng, chọn chế độ chơi
- **game.html** — Bàn cờ đầy đủ tính năng

---

## ♟ Quân Cờ & Luật Di Chuyển

| Quân | Tên VN | Ký hiệu | Luật Di Chuyển |
|---|---|---|---|
| King | Tướng/Soái | K/k | 1 ô ngang/dọc trong cung (3×3). Không đối mặt trực tiếp với tướng đối phương |
| Advisor | Sĩ | A/a | 1 ô chéo, chỉ trong cung |
| Elephant | Tượng | B/b | 2 ô chéo, không vượt sông, bị chặn bởi quân ở giữa |
| Horse | Mã | N/n | 1 thẳng + 1 chéo, bị chặn bởi quân ở chân |
| Chariot | Xe | R/r | Không giới hạn theo chiều ngang/dọc |
| Cannon | Pháo | C/c | Đi như Xe, nhưng phải nhảy qua đúng 1 quân khi ăn |
| Pawn | Tốt/Binh | P/p | Chỉ đi thẳng khi chưa vượt sông; sau khi vượt sông có thể đi ngang |

---

## 🎮 Trạng Thái Trò Chơi

```javascript
gameState = {
  selectedSquare: null,      // Ô đang được chọn [row, col]
  validMoves: [],            // Danh sách nước đi hợp lệ
  currentPlayer: "red",      // Lượt hiện tại: 'red' | 'black'
  moveHistory: [],           // Lịch sử các nước đã đi
  soundEnabled: true,        // Trạng thái âm thanh
  volume: 50,                // Âm lượng (0–100)
  pieces: {},                // Danh sách quân cờ đang trên bàn
  gameStatus: "playing",     // 'playing' | 'check' | 'checkmate' | 'stalemate'
  redKingPosition: null,     // Vị trí vua đỏ [row, col]
  blackKingPosition: null,   // Vị trí vua đen [row, col]
  lastMove: null,            // Nước đi gần nhất
}
```

---

## 🖥 Giao Diện Người Dùng

### Bố Cục `game.html` (3 cột)

```
┌─────────────┬──────────────────┬─────────────────┐
│  LEFT       │    CENTER        │    RIGHT        │
│             │                  │                 │
│ [Avatar]    │  ┌──────────┐   │  [⚙] [🔊] [🏳] │
│ Đối Thủ     │  │          │   │                 │
│ Quân: Đen   │  │  BÀN CỜ  │   │  Lịch Sử       │
│ 5:00        │  │  10 × 9  │   │  Nước Đi        │
│             │  │          │   │                 │
│ [Avatar]    │  └──────────┘   │  Chat Box       │
│ Bạn         │  Quân ăn được   │                 │
│ Quân: Đỏ   │                  │                 │
│ 5:00        │                  │                 │
└─────────────┴──────────────────┴─────────────────┘
```

### Các Modal

| Modal | Kích hoạt | Chức năng |
|---|---|---|
| Settings Modal | Nút ⚙ | Điều chỉnh âm thanh, âm lượng, độ sáng |
| Surrender Modal | Nút 🏳 | Xác nhận đầu hàng |
| Result Overlay | Kết thúc ván | Hiển thị kết quả, nút chơi lại |

---

## 🔧 Chi Tiết Kỹ Thuật

### `game.js` — Engine Chính (~1514 dòng)

#### Khởi Tạo
| Hàm | Mô tả |
|---|---|
| `initializeBoard()` | Tạo DOM 10×9 ô vuông, gắn sự kiện click |
| `initializeGame()` | Đặt quân về vị trí ban đầu, khởi động timer và audio |
| `renderPieces()` | Render tất cả quân cờ lên DOM, chọn asset mobile/desktop |

#### Xử Lý Nước Đi
| Hàm | Mô tả |
|---|---|
| `handleSquareClick(row, col)` | Xử lý click vào ô trống |
| `selectPiece(pieceKey)` | Chọn quân, tính và highlight nước đi hợp lệ |
| `movePiece(fromRow, fromCol, toRow, toCol)` | Thực hiện nước đi, cập nhật state |
| `calculateValidMoves(piece)` | Trả về danh sách nước hợp lệ sau lọc check |

#### Logic Luật Cờ
| Hàm | Mô tả |
|---|---|
| `getRawMoves(piece)` | Nước đi thô (chưa lọc chiếu tướng) |
| `getLegalMoves(piece)` | Nước đi hợp lệ (đã lọc) |
| `simulateMoveOnPieces(...)` | Mô phỏng nước đi trên bản sao trạng thái |
| `isKingInCheckAfterMove(...)` | Kiểm tra vua có bị chiếu sau nước đi không |
| `kingsAreFacing(pieces)` | Kiểm tra luật Phi Tướng |
| `isInCheck()` | Kiểm tra người chơi hiện tại có đang bị chiếu không |
| `isInCheckmate()` | Kiểm tra chiếu bí |
| `isInStalemate()` | Kiểm tra hòa cờ |

### `userDAO.js` — Data Access Object

| Hàm | Mô tả |
|---|---|
| `createUser(username, email, password, fullName)` | Tạo user + profile với transaction |
| `loginUser(username, password)` | Xác thực, trả về user data (không có password) |
| `getUserById(userId)` | Lấy user kèm profile |
| `updateUserProfile(userId, profileData)` | Cập nhật các trường được phép |
| `updateBrightness(userId, brightness)` | Cập nhật độ sáng |
| `updateSoundSettings(userId, soundEnabled, volume)` | Cập nhật âm thanh |
| `updateGameStats(userId, result)` | Cập nhật thắng/thua/hòa và điểm |
| `getLeaderboard(limit, offset)` | Lấy bảng xếp hạng |
| `userExists(username, email)` | Kiểm tra user đã tồn tại chưa |

---

## 📦 Tài Nguyên & Thư Viện

| Tài nguyên | Mô tả |
|---|---|
| `xiangqi.js` | Engine luật cờ tướng, BSD-2-Clause © lengyanyu258 |
| `bcrypt` | Hash mật khẩu |
| `jsonwebtoken` | Tạo và xác thực JWT |
| `express` | Web framework Node.js |
| `mysql2` | MySQL driver với connection pool |
| `style.css` | CSS nội bộ: layout, animation, responsive, modal |
| `play-music.mp3` | Nhạc nền tự động phát |
| `assets/desktop/*.png` | Ảnh quân cờ cho màn hình lớn |
| `assets/mobile/*.png` | Ảnh quân cờ tối ưu cho thiết bị di động |

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| Redirect về login ngay sau khi vào dashboard | Thiếu `id` trong HTML hoặc API trả về lỗi | Kiểm tra console, đảm bảo các element có đúng `id` |
| `Unexpected end of JSON input` | Server trả về response rỗng (ngrok warning page) | Thêm header `"ngrok-skip-browser-warning": "true"` vào fetch |
| `405 Method Not Allowed` | CORS chặn request từ origin khác | Cấu hình `FRONTEND_URL` trong `.env` hoặc dùng `origin: true` khi dev |
| `Failed to load user data` | Token hết hạn hoặc không hợp lệ | Đăng xuất và đăng nhập lại |
| Login bằng email không tìm thấy user | Bug trong `loginUser` query — truyền `username` 2 lần thay vì `[username, email]` | Sửa params trong `userDAO.js` |

Xem thêm: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📄 License

© 2026 Cờ Tướng Từ Thiện. Tất cả quyền được bảo lưu.

Engine `xiangqi.js` — BSD-2-Clause © lengyanyu258