# Hệ Thống Quản Lý Nhà Hàng Trên Nền Tảng Điện Toán Đám Mây (Cloud Restaurant Management)

Dự án ứng dụng quản lý nhà hàng hiện đại vận hành toàn diện trên Cloud với khả năng đồng bộ thời gian thực (Realtime Synchronization), tích hợp cơ sở dữ liệu đám mây, lưu trữ đám mây và cổng thanh toán tự động VietQR.

---

## 🛠 Bộ Công Nghệ Triển Khai (Tech Stack)

| Thành phần | Công nghệ / Nền tảng | Chức năng |
| :--- | :--- | :--- |
| **Giao diện (Frontend)** | ReactJS 18 + Vite + Tailwind CSS + Lucide Icons | Giao diện tối giản, trực quan, hỗ trợ Mobile/Tablet/Desktop |
| **Máy chủ (Backend)** | Node.js + Express.js + Socket.IO | Xử lý nghiệp vụ REST API & đồng bộ Realtime đa kênh |
| **Cơ sở dữ liệu Đám mây** | MongoDB Atlas (Cluster Cloud M0 / Serverless) | Lưu trữ NoSQL linh hoạt, mở rộng cao, backup tự động |
| **Lưu trữ Đám mây (Storage)**| Cloudinary | Lưu trữ, nén và tự động tối ưu hóa ảnh món ăn |
| **Cổng thanh toán** | VietQR Open API (Chuẩn NAPAS247) | Tự động sinh mã QR ngân hàng kèm số tiền và nội dung chuyển khoản |
| **Nền tảng Cloud** | Google App Engine / Microsoft Azure / Vercel + Render | Triển khai phân tán trên hạ tầng Cloud Native |

---

## 🚀 Các Phân Hệ Chức Năng Cốt Lõi

1. **Sơ đồ Bàn & POS Gọi món (`TablesPage` & `OrderModal`)**:
   - Bản đồ bàn theo khu vực (Tầng 1, Tầng 2, Ngoài trời, Phòng VIP).
   - Màu sắc nhận diện trạng thái bàn tức thì: Trống (Xanh), Có khách (Đỏ/Cam), Chờ dọn (Vàng).
   - Gọi món trực quan theo danh mục, thêm ghi chú (không hành, ít cay), tính tiền tạm tính.
2. **Màn hình Bếp & Quầy Bar thời gian thực (`KitchenKDS`)**:
   - Nhận vé Order tức thì từ phục vụ qua **Socket.IO** (không cần tải lại trang).
   - Sắp xếp đơn theo thứ tự thời gian vào trước làm trước (FIFO).
   - Thao tác 1 chạm đổi trạng thái: *Chờ làm* $\rightarrow$ *Đang nấu* $\rightarrow$ *Món đã xong* $\rightarrow$ *Đã bưng ra bàn*.
3. **Quầy Thu Ngân & Thanh Toán Hóa Đơn (`CashierPage`)**:
   - Tính tiền, chiết khấu voucher/giảm giá (%), thuế VAT (%).
   - Tự động sinh mã **VietQR** động (khách chỉ cần mở app ngân hàng quét là chuyển đúng số tiền và mã đơn).
   - Xác nhận thanh toán, in hóa đơn và tự động giải phóng bàn về trạng thái trống trên toàn hệ thống.
4. **Báo Cáo & Thống Kê Doanh Thu Đám Mây (`ReportsPage`)**:
   - Thống kê doanh thu theo ngày, tổng doanh thu tích lũy, số lượng đơn hoàn tất.
   - Bảng xếp hạng Top các món ăn bán chạy nhất (Best sellers) và doanh số đóng góp.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
app_quan_ly_nha_hang/
├── backend/                  # Máy chủ Express & Socket.IO
│   ├── src/
│   │   ├── config/           # Cấu hình db.js (MongoDB Atlas), cloudinary.js
│   │   ├── controllers/      # Điều khiển bàn, món ăn, order, hóa đơn, báo cáo
│   │   ├── models/           # Mongoose Schemas (User, Table, Category, MenuItem, Order, Invoice)
│   │   ├── routes/           # REST API endpoints (/api/...)
│   │   ├── seeds/            # Script tạo dữ liệu nhà hàng mẫu (seedData.js)
│   │   └── server.js         # Điểm khởi chạy Express + Socket.IO Server
│   ├── app.yaml              # Cấu hình triển khai Google App Engine
│   ├── .env.example          # Mẫu biến môi trường
│   └── package.json
├── frontend/                 # Giao diện ReactJS + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Navbar, Header, Badge...
│   │   ├── pages/            # TablesPage, KitchenKDS, CashierPage, ReportsPage
│   │   ├── services/         # api.js (Axios), socket.js (Socket.IO client)
│   │   ├── App.jsx           # Root layout điều hướng
│   │   └── index.css         # Tailwind styling
│   ├── vercel.json           # Cấu hình triển khai Vercel
│   └── package.json
└── render.yaml               # Cấu hình triển khai Render Cloud Blueprint
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Thử Nghiệm

### 1. Khởi chạy Backend:
```bash
cd backend
# Cài đặt các thư viện cần thiết
npm install

# (Tùy chọn) Chạy seed dữ liệu mẫu gồm 8 bàn, 9 món ăn Việt Nam, 5 danh mục
npm run seed

# Khởi chạy server Backend (cổng 5000)
npm run dev
```

### 2. Khởi chạy Frontend:
```bash
cd frontend
# Cài đặt thư viện giao diện
npm install

# Chạy giao diện React (cổng 5173)
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:5173`. Bạn có thể mở đồng thời 2 tab trình duyệt (1 tab màn hình Bàn ăn/Thu ngân, 1 tab màn hình Bếp) để thử nghiệm tính năng **Đồng bộ thời gian thực (Realtime)**!

---

## ☁️ Hướng Dẫn Cấu Hình Dịch Vụ Đám Mây (Cloud Services)

### 1. Cấu hình MongoDB Atlas:
1. Đăng ký tài khoản miễn phí tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Tạo một Cluster miễn phí (M0 Sandbox).
3. Vào phần **Database Access** tạo một User (Username & Password).
4. Vào phần **Network Access** thêm IP `0.0.0.0/0` (cho phép kết nối từ mọi nơi).
5. Bấm **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Sao chép chuỗi kết nối dán vào file `.env` ở biến `MONGODB_URI`.

### 2. Cấu hình Cloudinary (Lưu trữ ảnh món ăn):
1. Đăng ký tài khoản miễn phí tại [Cloudinary](https://cloudinary.com).
2. Lấy `Cloud Name`, `API Key`, `API Secret` tại Dashboard.
3. Dán các thông tin tương ứng vào file `backend/.env`.

### 3. Cấu hình Tài khoản Ngân Hàng Nhận Tiền VietQR:
Trong file `backend/.env`, chỉnh sửa:
```env
VIETQR_BANK_ID=MB              # Mã ngân hàng (MB, VCB, TCB, ACB, VPB, ICB...)
VIETQR_ACCOUNT_NO=0987654321    # Số tài khoản ngân hàng của nhà hàng
VIETQR_ACCOUNT_NAME=NHA HANG AM THUC VIET # Tên chủ tài khoản không dấu
```
