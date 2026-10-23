# CÔNG NGHỆ, CẤU TRÚC VÀ NỀN TẢNG DỰ ÁN (CLOUD RESTAURANT RMS)

Tài liệu này tổng hợp chi tiết toàn bộ nền tảng hạ tầng, công nghệ cốt lõi và cấu trúc kiến trúc phần mềm vận hành của hệ thống **Cloud Restaurant RMS (Restaurant Management System)**.

---

## 1. NỀN TẢNG HẠ TẦNG & DỊCH VỤ ĐÁM MÂY (PLATFORMS & CLOUD INFRASTRUCTURE)

Hệ thống được xây dựng theo kiến trúc Cloud-Native phân tán, đảm bảo khả năng mở rộng, tính sẵn sàng cao và đồng bộ tức thời:

| Hạng Mục | Nền Tảng / Dịch Vụ | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| **Kiến Trúc Cốt Lõi** | **MERN Stack** | MongoDB + Express.js + React.js + Node.js |
| **Giao Tiếp Thời Gian Thực** | **Socket.IO (WebSocket)** | Đồng bộ trạng thái 5 phân hệ (Lễ tân, Phục vụ, Bếp, Thu ngân, Quản lý) với độ trễ < 100ms |
| **Cơ Sở Dữ Liệu Đám Mây** | **MongoDB Atlas** | Cụm cơ sở dữ liệu NoSQL đám mây (Replica Set) lưu trữ bàn ăn, đơn hàng, thực đơn, kho và lịch sử |
| **Lưu Trữ Tệp Đa Phương Tiện**| **Cloudinary CDN** | Lưu trữ và phân phối hình ảnh món ăn, logo thương hiệu độ phân giải cao |
| **Cổng Thanh Toán Số** | **VietQR / Napas 247** | Tự động sinh mã QR động thanh toán chuyển khoản qua ngân hàng Quân Đội (MB Bank) |
| **Triển Khai Frontend (Hosting)**| **Vercel** | Máy chủ biên (Edge Network) phục vụ Single Page Application với rewrite SPA |
| **Triển Khai Backend (Web Service)**| **Render Cloud** | Triển khai Docker/Node.js Web Service khu vực Singapore (cấu hình qua `render.yaml`) |
| **Quản Lý Phiên Bản Mã Nguồn** | **GitHub (Git)** | CI/CD pipeline tự động build và deploy khi push code lên nhánh `main` |

---

## 2. CÔNG NGHỆ CỐT LÕI (TECHNOLOGY STACK)

### 2.1. Phía Máy Khách (Frontend Stack)
- **React 18:** Thư viện giao diện người dùng dựa trên Component, xử lý State phân tán và Hook tối ưu hiệu năng.
- **Vite 5:** Công cụ đóng gói (bundler) thế hệ mới, hỗ trợ Hot Module Replacement (HMR) tức thì và tối ưu hóa tệp tĩnh (CSS/JS chunks).
- **Tailwind CSS 3:** Framework CSS tiện ích (Utility-first), xây dựng giao diện hiện đại với bảng màu Slate/Zinc, hiệu ứng Glassmorphism và vi mạch ánh kim cao cấp.
- **Lucide React:** Bộ thư viện vector icon chuẩn hóa giao diện trực quan cho cả 5 vai trò.
- **Axios:** Thư viện gửi HTTP Request RESTful API với cấu hình interceptor và xử lý lỗi tập trung.
- **Socket.IO Client 4:** Lắng nghe và phát các sự kiện thời gian thực (`order:created`, `table:status_changed`, `restaurant:reset_all`,...).

### 2.2. Phía Máy Chủ (Backend Stack)
- **Node.js (v18+):** Môi trường thực thi JavaScript không đồng bộ, tối ưu hóa I/O cho các tác vụ thời gian thực.
- **Express.js 4:** Web framework chuẩn RESTful API, quản lý định tuyến module hóa và middleware.
- **Mongoose 8:** Object Data Modeling (ODM) cho MongoDB, định nghĩa Schema chặt chẽ, hỗ trợ populate và validation dữ liệu nghiệp vụ.
- **Socket.IO Server 4:** Tích hợp trực tiếp vào HTTP Server, phân luồng phòng (`rooms`) theo station (Bếp/Bar/Thu ngân) và phát thông báo diện rộng (`broadcast`).
- **Multer & Cloudinary Storage:** Middleware xử lý tải lên tệp tin `multipart/form-data`.
- **Dotenv & CORS:** Cấu hình biến môi trường bảo mật và kiểm soát truy cập chéo nguồn.

---

## 3. CẤU TRÚC 5 PHÂN HỆ NGHIỆP VỤ (MODULAR BUSINESS ARCHITECTURE)

Hệ thống phân quyền và chuyên môn hóa thành 5 phân hệ tương ứng với các bộ phận hoạt động trong nhà hàng:

```
                  ┌─────────────────────────────────────────┐
                  │          CLOUD RESTAURANT RMS           │
                  └────────────────────┬────────────────────┘
                                       │
      ┌───────────────┬────────────────┼───────────────┬────────────────┐
      ▼               ▼                ▼               ▼                ▼
┌───────────┐   ┌───────────┐    ┌───────────┐   ┌───────────┐    ┌───────────┐
│ 1. LỄ TÂN │   │2. PHỤC VỤ │    │ 3. ĐẦU BẾP│   │4. THU NGÂN│    │ 5. QUẢN LÝ│
│(Hostess)  │   │   (POS)   │    │(KDS & Bar)│   │ (Cashier) │    │ (Manager) │
└───────────┘   └───────────┘    └───────────┘   └───────────┘    └───────────┘
```

1. **Phân Hệ 1: Lễ Tân (Hostess / Receptionist)**
   - Quản lý sơ đồ 22 bàn ăn chia đều 4 khu vực (Tầng 1, Sân vườn, Phòng lạnh, Phòng VIP) với tổng sức chứa > 200 khách.
   - Nghiệp vụ đặt bàn trước (Reservation): Tiếp nhận khách, chọn bàn trống, khóa thời gian ở quá khứ.
   - Danh sách khách chờ (Waitlist): Điều phối khách vãng lai khi quán đông và xếp bàn tự động.

2. **Phân Hệ 2: Nhân Viên Phục Vụ (Waitstaff POS)**
   - Quy trình phục vụ chuẩn: **Báo Có Khách → Nhập số lượng khách thực tế → Mở bàn → Mới được gọi món**.
   - Thực đơn 30 món gia đình chuẩn giá niêm yết Siêu thị, hỗ trợ ghi chú từng món ăn.
   - Nghiệp vụ bàn: Chuyển bàn, ghép bàn, xem hóa đơn tạm tính và hủy món theo lý do bảo mật.

3. **Phân Hệ 3: Bếp & Quầy Bar (Kitchen KDS & Bar)**
   - Màn hình Kitchen Display System (KDS) hiển thị đơn theo thời gian thực kèm đếm phút chế biến.
   - Cập nhật tiến độ 3 bước: Chờ nấu → Đang nấu → Món hoàn thành.
   - Sổ tay công thức 30 món: Quy chuẩn SOP 4 bước (Sơ chế, Tẩm ướp, Chế biến nhiệt, Ra đồ).
   - Cơ chế 86ing: Báo hết món khẩn cấp gửi tín hiệu khóa món trên màn hình POS của phục vụ.

4. **Phân Hệ 4: Thu Ngân & Két (Cashier & Settlement)**
   - Bảng tính tiền tự động: Tổng tiền món, chiết khấu khuyến mãi (%), thuế VAT (%), phụ thu dịch vụ.
   - Bản in tạm tính chuẩn hóa định dạng in nhiệt ngoài đời (khổ 80mm).
   - Thanh toán VietQR động: Tự sinh mã QR ngân hàng MB Bank (STK: `0963769034` - `CAO QUOC ANH`) chứa đúng số tiền và nội dung chuyển khoản bàn.
   - Quản lý ca làm việc: Mở ca, chốt ca, kiểm đếm tiền mặt đầu ca/cuối ca.

5. **Phân Hệ 5: Cấp Quản Lý & Chủ Nhà Hàng (Executive Manager Portal)**
   - Theo dõi doanh thu, số lượt khách và lợi nhuận gộp toàn hệ thống.
   - Bảng phân tích chi tiết giá Cost & Biên lợi nhuận (% Margin) đúng 30 món gia đình (Giá Siêu thị vs Giá Chợ dân sinh).
   - Quản lý kho nguyên liệu theo 4 nhóm chuẩn, cảnh báo tồn thấp và tự động liên kết món ăn bị ảnh hưởng.
   - Quản lý lịch sử nhập hàng và form nhập kho nguyên liệu thời gian thực.
   - Ghi nhận chỉ số điện (kWh) và nước (m³) hàng tháng, tự động tính tổng chi phí vận hành.
   - Nút **Reset Toàn Bộ Dữ Liệu Nhà Hàng**: Khóa bảo mật 2 lớp bằng Mật khẩu (`nhahang2026`) và Mã PIN (`123456`) để làm mới sạch hệ thống khi chuyển giao ca hoặc phục hồi kiểm thử.

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY STRUCTURE)

```
app_quan_ly_nha_hang/
├── .agents/                               # Bộ cấu hình kỹ năng và quy tắc Agent
│   ├── rules/
│   │   └── project_rules.md              # Quy tắc cốt lõi (YAGNI, Unicode, POS Flow)
│   └── skills/                           # Bộ kỹ năng thiết kế UI/UX Pro Max v2.15
│       ├── brand/
│       ├── design/
│       ├── design-system/
│       ├── ui-styling/
│       └── ui-ux-pro-max/
│
├── backend/                              # Máy chủ Node.js Express & Socket.IO
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js             # Cấu hình lưu trữ ảnh Cloudinary
│   │   │   └── database.js               # Kết nối cơ sở dữ liệu MongoDB Atlas
│   │   ├── controllers/                  # Bộ xử lý nghiệp vụ chuyên biệt
│   │   │   ├── auditLogController.js     # Ghi nhận nhật ký kiểm toán hệ thống
│   │   │   ├── inventoryController.js    # Quản lý kho & lịch sử nhập hàng
│   │   │   ├── invoiceController.js      # Tạo hóa đơn tạm tính & thanh toán
│   │   │   ├── menuController.js         # Thực đơn, giá cost & tỷ suất lợi nhuận
│   │   │   ├── orderController.js        # Điều phối đơn gọi món & KDS bếp
│   │   │   ├── reportController.js       # Tổng hợp báo cáo doanh thu
│   │   │   ├── reservationController.js  # Nghiệp vụ đặt bàn & danh sách chờ
│   │   │   ├── restaurantController.js   # Reset toàn bộ dữ liệu nhà hàng có mã PIN
│   │   │   ├── shiftController.js        # Đóng/mở ca làm việc thu ngân
│   │   │   ├── tableController.js        # Trạng thái & khu vực bàn ăn
│   │   │   └── utilityController.js      # Tính toán chi phí điện nước
│   │   ├── models/                       # Mongoose Schema
│   │   │   ├── AuditLog.js
│   │   │   ├── Category.js
│   │   │   ├── Inventory.js
│   │   │   ├── InventoryImport.js
│   │   │   ├── Invoice.js
│   │   │   ├── MenuItem.js
│   │   │   ├── Order.js
│   │   │   ├── Reservation.js
│   │   │   ├── Shift.js
│   │   │   ├── Table.js
│   │   │   ├── User.js
│   │   │   ├── Utility.js
│   │   │   └── Waitlist.js
│   │   ├── routes/
│   │   │   └── api.js                    # Tập hợp toàn bộ điểm cuối REST API
│   │   ├── seeds/
│   │   │   ├── reset30Dishes.js          # Script độc lập nạp 30 món chuẩn giá Siêu thị
│   │   │   └── seedData.js               # Script khởi tạo đầy đủ dữ liệu mẫu nhà hàng
│   │   └── server.js                     # Điểm khởi động HTTP & WebSocket Server
│   ├── .env                              # Biến môi trường máy chủ
│   └── package.json
│
├── frontend/                             # Ứng dụng Single Page App React + Vite
│   ├── public/
│   │   ├── assets/
│   │   │   ├── logo.png                  # Logo chính mạ vàng chuẩn thương hiệu
│   │   │   ├── heineken.png
│   │   │   └── tiger.png
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx                # Chân trang công nghệ (Địa chỉ: 50 Cát Bi)
│   │   │   ├── Navbar.jsx                # Điều hướng, đồng hồ & Role Switcher
│   │   │   └── RecipeModal.jsx           # Cửa sổ xem công thức nấu ăn SOP
│   │   ├── data/
│   │   │   ├── defaultImports.js         # Bộ đệm dữ liệu mẫu lịch sử nhập hàng
│   │   │   ├── defaultInventory.js       # Bộ đệm dữ liệu kho 4 nhóm chuẩn
│   │   │   └── defaultMenu30.js          # Bảng dữ liệu 30 món niêm yết Siêu thị
│   │   ├── pages/
│   │   │   ├── CashierPage.jsx           # Phân hệ Thu ngân & VietQR MB Bank
│   │   │   ├── KitchenKDS.jsx            # Phân hệ Bếp & Sổ tay công thức SOP
│   │   │   ├── ManagerPage.jsx           # Phân hệ Quản lý, Giá Cost & Reset hệ thống
│   │   │   ├── OrderModal.jsx            # Cửa sổ gọi món trên POS
│   │   │   ├── ReceptionPage.jsx         # Phân hệ Lễ tân & Danh sách chờ
│   │   │   └── TablesPage.jsx            # Phân hệ Phục vụ & Sơ đồ 22 bàn
│   │   ├── services/
│   │   │   ├── api.js                    # Cấu hình gọi Axios REST API
│   │   │   └── socket.js                 # Kết nối Socket.IO thời gian thực
│   │   ├── App.jsx                       # Thành phần gốc chứa Router vai trò
│   │   ├── index.css                     # Cấu hình Tailwind CSS & hiệu ứng
│   │   └── main.jsx
│   ├── index.html                        # Tệp HTML gốc chứa favicon & tiêu đề
│   ├── vercel.json                       # Cấu hình định tuyến SPA máy chủ Vercel
│   └── package.json
│
├── AGENTS.md                             # Hướng dẫn và quy tắc cốt lõi cho AI Agent
├── GEMINI.md                             # Bản sao quy tắc cho hệ thống Gemini
├── render.yaml                           # Tệp cấu hình hạ tầng triển khai Render Cloud
└── README.md                             # Hướng dẫn tổng quan dự án
```

---

## 5. BẢO MẬT VÀ TOÀN VẸN DỮ LIỆU (SECURITY & INTEGRITY)

1. **Xác Thực Đa Tầng Cho Hành Động Nguy Hiểm:**
   - Hành động reset toàn bộ hệ thống yêu cầu đồng thời Mật khẩu quản lý (`nhahang2026`) và Mã PIN (`123456`), được kiểm duyệt độc lập ở cả tầng giao diện và tầng máy chủ Backend.
2. **Nguyên Tắc Bất Biến Trong Đặt Bàn & Phục Vụ:**
   - Nghiệp vụ Lễ tân kiểm tra xung đột thời gian thực, không cho phép đặt bàn vào thời gian trong quá khứ hoặc xếp trùng vào bàn đang có khách ngồi.
   - Bàn ăn ở trạng thái chờ/đặt trước được khóa tự động để bảo vệ quyền lợi của khách hàng đã đặt chỗ.
3. **Độc Lập & Khả Năng Chịu Lỗi Máy Trạm (Fault-Tolerant Offline Cache):**
   - Phía Frontend được tích hợp sẵn lớp đệm dữ liệu thông minh (`defaultMenu30.js`, `defaultInventory.js`, `defaultImports.js`) trong LocalStorage. Khi kết nối mạng bị gián đoạn hoặc DB đang bảo trì, màn hình vẫn hiển thị đầy đủ bảng phân tích 30 món và kho hàng mà không bị gián đoạn hoạt động.
