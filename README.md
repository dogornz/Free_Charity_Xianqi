# 🏮 Cờ Tướng Từ Thiện

> Ứng dụng chơi cờ tướng trực tuyến với giao diện hiện đại, hỗ trợ đầy đủ luật chơi tiêu chuẩn.

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Luồng Điều Hướng](#-luồng-điều-hướng)
- [Chi Tiết Kỹ Thuật](#-chi-tiết-kỹ-thuật)
- [Quân Cờ & Luật Di Chuyển](#-quân-cờ--luật-di-chuyển)
- [Trạng Thái Trò Chơi](#-trạng-thái-trò-chơi)
- [Giao Diện Người Dùng](#-giao-diện-người-dùng)
- [Tài Nguyên & Thư Viện](#-tài-nguyên--thư-viện)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)

---

## 📖 Giới Thiệu

**Cờ Tướng Từ Thiện** là một ứng dụng web chơi cờ tướng (Chinese Chess / Xiangqi) được xây dựng hoàn toàn bằng HTML, CSS và JavaScript thuần. Dự án tích hợp engine cờ tướng `xiangqi.js` để xử lý logic luật chơi, đồng thời cung cấp giao diện trực quan, hỗ trợ cả desktop lẫn thiết bị di động.

---

## ✨ Tính Năng

### Gameplay
- Bàn cờ tướng tiêu chuẩn **10×9** với đầy đủ 32 quân cờ
- Hỗ trợ toàn bộ luật di chuyển cho 7 loại quân: Xe, Mã, Tượng, Sĩ, Tướng, Pháo, Tốt
- Phát hiện **chiếu tướng** (check) theo thời gian thực
- Phát hiện **chiếu bí** (checkmate) và kết thúc ván
- Phát hiện **hòa cờ** (stalemate)
- Quy tắc **Phi Tướng** (Tướng đối mặt trực tiếp — Flying General Rule)
- Quân Tốt được tăng khả năng di chuyển khi **vượt sông**
- Tượng và Sĩ bị chặn nước theo đúng luật

### Giao Diện
- Highlight ô được chọn và các nước đi hợp lệ
- Hiển thị **lịch sử nước đi** theo thời gian thực
- Theo dõi **quân đã ăn được** của mỗi bên
- Đồng hồ đếm thời gian cho mỗi người chơi
- **Hiệu ứng mở cửa** (door opening) khi vào trang chủ
- Tương thích responsive: tự động chuyển asset ảnh giữa mobile và desktop

### Âm Thanh & Cài Đặt
- Nhạc nền tự động phát khi vào bàn cờ
- Bật/tắt âm thanh và điều chỉnh âm lượng
- Điều chỉnh độ sáng màn hình
- Tất cả cài đặt áp dụng ngay lập tức không cần reload

### Chat & Tương Tác
- Hộp chat trong game với phản hồi ngẫu nhiên từ đối thủ (demo)
- Nút **đầu hàng** có hộp xác nhận
- Màn hình kết quả hiển thị sau khi ván đấu kết thúc với nút chơi lại

---

## 📁 Cấu Trúc Dự Án

```
co-tuong-tu-thien/
│
├── frontend/
│   ├── promote.html          # Trang giới thiệu / màn hình chào
│   ├── dashboard.html        # Trang chủ sau khi đăng nhập
│   └── game.html             # Giao diện bàn cờ chính
│
├── backend/
│   ├── game.js               # Engine game chính (logic bàn cờ, nước đi, UI)
│   └── xiangqi.js            # Thư viện Xiangqi engine (FEN, luật cờ chuẩn)
│
├── assets/
│   ├── desktop/              # Ảnh quân cờ cho màn hình desktop
│   │   ├── king_red.png
│   │   ├── king_black.png
│   │   └── ...               # (chariot, horse, elephant, advisor, cannon, pawn)
│   ├── mobile/               # Ảnh quân cờ cho màn hình mobile
│   └── avatar-default.png    # Avatar mặc định người chơi
│
├── audio/
│   └── play-music.mp3        # Nhạc nền trong ván cờ
│
└── style.css                 # Toàn bộ stylesheet (dashboard, game, modal, responsive)
```

---

## 🔀 Luồng Điều Hướng

```
promote.html
    │
    └──[Nhấn "Chơi Ngay"]──► dashboard.html
                                    │
                                    └──[Vào ván cờ]──► game.html
```

- **promote.html**: Màn hình giới thiệu/quảng bá, có nút dẫn vào dashboard.
- **dashboard.html**: Trang chủ với hiệu ứng mở cửa (door animation) khi tải trang.
- **game.html**: Bàn cờ đầy đủ tính năng, load `game.js` để khởi chạy engine.

---

## 🔧 Chi Tiết Kỹ Thuật

### `game.js` — Engine Chính

File JavaScript chính (~1514 dòng) điều khiển toàn bộ logic trò chơi:

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
| `getRawMoves(piece)` | Nước đi thô của quân (chưa lọc chiếu tướng) |
| `getLegalMoves(piece)` | Nước đi hợp lệ (đã lọc, không để vua bị chiếu) |
| `simulateMoveOnPieces(...)` | Mô phỏng nước đi trên bản sao trạng thái |
| `isKingInCheckAfterMove(...)` | Kiểm tra vua có bị chiếu sau nước đi không |
| `isSquareAttackedBy(...)` | Kiểm tra ô có bị tấn công bởi màu cờ nào không |
| `kingsAreFacing(pieces)` | Kiểm tra luật Phi Tướng (hai tướng đối mặt) |
| `isInCheck()` | Kiểm tra người chơi hiện tại có đang bị chiếu không |
| `isInCheckmate()` | Kiểm tra chiếu bí |
| `isInStalemate()` | Kiểm tra hòa cờ |

#### Hàm Phụ Trợ
| Hàm | Mô tả |
|---|---|
| `hasPieceAt(row, col)` | Kiểm tra có quân tại ô không |
| `getPieceAt(row, col)` | Lấy đối tượng quân tại ô |
| `isInPalace(row, col, color)` | Kiểm tra ô có nằm trong cung không |
| `hasPickCrossedRiver(piece)` | Kiểm tra quân tốt đã vượt sông chưa |
| `highlightSquares()` | Tô sáng ô đang chọn và nước đi hợp lệ |
| `clearSelection()` | Xóa highlight và reset selection |
| `updateMoveHistory(...)` | Ghi nước đi vào danh sách lịch sử |
| `endGame(reason)` | Kết thúc ván, hiển thị kết quả |

### `xiangqi.js` — Thư Viện Engine

Thư viện mã nguồn mở `xiangqi.js` (BSD-2-Clause, tác giả `lengyanyu258`) cung cấp:

- Phân tích và tạo chuỗi **FEN** (Forsyth-Edwards Notation cho Xiangqi)
- Biểu diễn bàn cờ dạng **0x88** (mảng 256 phần tử)
- Kiểm tra tính hợp lệ của nước đi theo luật chuẩn
- Quản lý lịch sử (`history`) và tính năng undo/redo (`futures`)
- Hỗ trợ notation đại số cho Xiangqi

---

## ♟ Quân Cờ & Luật Di Chuyển

| Quân | Tên VN | Ký hiệu | Luật Di Chuyển |
|---|---|---|---|
| King (Tướng) | Tướng/Soái | K/k | Di chuyển 1 ô theo chiều ngang/dọc trong cung (3×3). Không được đối mặt trực tiếp với tướng đối phương |
| Advisor (Sĩ) | Sĩ/Thị | A/a | Di chuyển 1 ô theo đường chéo, chỉ trong cung |
| Elephant (Tượng) | Tượng/Tương | B/b | Di chuyển 2 ô chéo, không vượt sông, bị chặn bởi quân ở giữa |
| Horse (Mã) | Mã | N/n | Di chuyển hình chữ L (1 thẳng + 1 chéo), bị chặn bởi quân ở chân |
| Chariot (Xe) | Xe | R/r | Di chuyển không giới hạn theo chiều ngang/dọc |
| Cannon (Pháo) | Pháo | C/c | Di chuyển như Xe khi đi, nhưng phải nhảy qua đúng 1 quân khi ăn |
| Pawn (Tốt) | Tốt/Binh | P/p | Chỉ đi thẳng khi chưa vượt sông; sau khi vượt sông có thể đi ngang |

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

### Chống Zoom Không Mong Muốn

Tất cả các trang đều ngăn người dùng zoom bằng:
- `Ctrl + Scroll`
- `Ctrl + / -`
- Pinch-to-zoom trên cảm ứng

---

## 📦 Tài Nguyên & Thư Viện

| Tài nguyên | Mô tả |
|---|---|
| `xiangqi.js` | Engine luật cờ tướng, BSD-2-Clause © lengyanyu258 |
| `style.css` | CSS nội bộ: layout, animation, responsive, modal |
| `play-music.mp3` | Nhạc nền tự động phát (autoplay với muted fallback) |
| `assets/desktop/*.png` | Ảnh quân cờ chất lượng cao cho màn hình lớn |
| `assets/mobile/*.png` | Ảnh quân cờ tối ưu cho thiết bị di động |
| `avatar-default.png` | Avatar mặc định khi chưa có thông tin người chơi |

---

## 💻 Yêu Cầu Hệ Thống

- Trình duyệt hiện đại hỗ trợ ES6+ (Chrome, Firefox, Edge, Safari)
- Không yêu cầu cài đặt thêm thư viện hoặc framework
- Không cần backend server — chạy hoàn toàn phía client
- Hỗ trợ cả desktop và thiết bị di động (responsive)

### Khởi Chạy Nhanh

Chỉ cần mở file `promote.html` trong trình duyệt là có thể bắt đầu chơi:

```bash
# Ví dụ dùng VS Code Live Server, hoặc bất kỳ HTTP server nào
npx serve .
# Sau đó truy cập http://localhost:3000/frontend/promote.html
```

> **Lưu ý:** Nhạc nền yêu cầu tương tác của người dùng trước khi phát do chính sách autoplay của trình duyệt. Nhạc sẽ tự bật sau lần click đầu tiên.
