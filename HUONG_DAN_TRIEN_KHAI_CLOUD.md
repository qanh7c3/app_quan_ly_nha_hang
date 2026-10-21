# CẨM NANG HƯỚNG DẪN TRIỂN KHAI ỨNG DỤNG LÊN ĐÁM MÂY (GIAI ĐOẠN 1)

> **Tài liệu hướng dẫn trực tiếp cho bạn (Developer / Người quản trị):**  
> Làm theo 3 bước tuần tự dưới đây để đưa toàn bộ hệ thống lên Cloud mà **không tốn bất kỳ chi phí nào** (hoàn toàn miễn phí với MongoDB Atlas Free Tier, Render Free và Vercel Hobby).

---

## BƯỚC 1: CẤU HÌNH CƠ SỞ DỮ LIỆU ĐÁM MÂY (MONGODB ATLAS)

### 1.1. Đăng ký & Tạo cụm Database miễn phí:
1. Truy cập trang chủ: **[https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** và bấm **Try Free** (hoặc Sign In bằng tài khoản Google).
2. Khi vào màn hình Dashboard, chọn **Create a Deployment**:
   - Chọn loại: **M0 Free** (Miễn phí 512MB RAM, vCPU chia sẻ, không bao giờ hết hạn).
   - Provider & Region: Chọn **AWS** hoặc **Google Cloud**, khu vực **Singapore (`ap-southeast-1`)** để đạt tốc độ truy xuất nhanh nhất từ Việt Nam.
   - Bấm **Create Deployment**.

### 1.2. Tạo tài khoản đăng nhập CSDL (Database User):
1. Hệ thống sẽ hiện popup **Quickstart**:
   - **Username**: Điền `restaurant_admin` (hoặc tên bạn chọn).
   - **Password**: Bấm **Autogenerate Secure Password** (hoặc tự đặt, ví dụ `NhaHang2026@Pass`).
   - ⚠️ **LƯU Ý QUAN TRỌNG:** Hãy sao chép ngay mật khẩu này ra Notepad!
   - Bấm **Create Database User**.

### 1.3. Mở quyền truy cập IP (Network Access):
1. Vẫn ở màn hình đó, cuộn xuống mục **Where would you like to connect from?**:
   - Chọn **My Local Environment**.
   - Bấm nút **Add My Current IP Address**, hoặc nhập `0.0.0.0/0` (Allow Access from Anywhere) để Backend trên Cloud (Render/App Engine) có thể kết nối được mà không bị chặn tường lửa.
   - Bấm **Finish and Close** $\rightarrow$ **Go to Overview**.

### 1.4. Lấy chuỗi kết nối (Connection String):
1. Tại màn hình Database Overview, cạnh tên Cluster, bấm nút **Connect**.
2. Chọn mục **Drivers** (Node.js).
3. Sao chép chuỗi kết nối mẫu có dạng:
   ```text
   mongodb+srv://restaurant_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Mở file `backend/.env` trong thư mục dự án của bạn:
   - Thay thế `<password>` bằng mật khẩu bạn đã lưu ở bước 1.2.
   - Thêm tên database `restaurant_db` vào trước dấu `?`.
   - Kết quả hoàn chỉnh sẽ trông như sau:
   ```env
   MONGODB_URI=mongodb+srv://restaurant_admin:NhaHang2026@Pass@cluster0.abcde.mongodb.net/restaurant_db?retryWrites=true&w=majority
   ```
5. Chạy lệnh nạp dữ liệu mẫu lên đám mây:
   ```bash
   cd backend
   npm run seed
   ```
   *(Toàn bộ danh sách 8 bàn ăn, 9 món ăn, công thức kho và tài khoản của 5 vai trò sẽ được tự động tạo ngay trên MongoDB Atlas!)*

---

## BƯỚC 2: TRIỂN KHAI BACKEND LÊN CLOUD (RENDER / GOOGLE APP ENGINE)

### Phương án A: Triển khai lên Render.com (Khuyên dùng - Hỗ trợ WebSockets cực kỳ mượt mà)
1. Đẩy toàn bộ mã nguồn dự án lên một kho lưu trữ riêng của bạn trên **GitHub**.
2. Đăng nhập vào **[https://render.com](https://render.com)** bằng tài khoản GitHub.
3. Chọn **New +** $\rightarrow$ **Web Service**:
   - Chọn repository GitHub của dự án vừa đẩy.
   - **Name**: `restaurant-cloud-backend` (hoặc tên tùy thích).
   - **Region**: `Singapore (Southeast Asia)`.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Cuộn xuống mục **Environment Variables** (Biến môi trường) và thêm các khóa:
   - `PORT`: `10000`
   - `MONGODB_URI`: Dán chuỗi kết nối MongoDB Atlas đã có ở Bước 1.
   - `JWT_SECRET`: `super_secret_restaurant_cloud_key_2026`
   - `VIETQR_BANK_ID`: `MB`
   - `VIETQR_ACCOUNT_NO`: `0987654321`
   - `VIETQR_ACCOUNT_NAME`: `NHA HANG AM THUC VIET`
   - `CLIENT_URL`: `*`
5. Bấm **Create Web Service**. Đợi khoảng 1-2 phút, Render sẽ cấp cho bạn một đường dẫn dạng:
   `https://restaurant-cloud-backend.onrender.com`

---

## BƯỚC 3: TRIỂN KHAI FRONTEND LÊN VERCEL

1. Đăng nhập vào **[https://vercel.com](https://vercel.com)** bằng tài khoản GitHub.
2. Bấm **Add New...** $\rightarrow$ **Project**:
   - Chọn kho lưu trữ GitHub của dự án.
3. Trong phần cấu hình dự án (Configure Project):
   - **Project Name**: `restaurant-cloud-app`
   - **Framework Preset**: Chọn `Vite` (Vercel sẽ tự động nhận diện).
   - **Root Directory**: Bấm Edit và chọn thư mục `frontend`! *(Rất quan trọng)*.
4. Mở rộng phần **Environment Variables** (Biến môi trường):
   - Thêm biến 1:
     - Name: `VITE_API_URL`
     - Value: `https://restaurant-cloud-backend.onrender.com/api` (Dán link Render Backend ở Bước 2 kèm `/api`).
   - Thêm biến 2:
     - Name: `VITE_SOCKET_URL`
     - Value: `https://restaurant-cloud-backend.onrender.com` (Dán link Render Backend để đồng bộ Socket.IO).
5. Bấm nút **Deploy**.
6. Sau khoảng 30 giây, Vercel sẽ cấp cho bạn đường link website hoàn chỉnh có thể mở trên điện thoại, máy tính bảng hoặc máy tính POS bất kỳ!

---

## 🎯 KIỂM THỬ 5 PHÂN HỆ VAI TRÒ TRỰC QUAN

Khi mở ứng dụng trên trình duyệt, thanh **Role Switcher Demo** ở phía trên cùng cho phép bạn chuyển đổi nhanh giữa 5 bộ phận để kiểm thử và thuyết trình:

1. **Lễ Tân (Hostess)**:
   - Tiếp nhận đặt bàn trước, ghi nhận khách chờ (Waitlist).
   - Bấm **Khách Đến & Xếp Bàn** để chuyển khách vào bàn trống.
2. **Phục Vụ (Waitstaff)**:
   - Xem sơ đồ bàn, mở bàn, chọn món theo danh mục, thêm ghi chú (không hành, ít cay).
   - Thao tác: **Chuyển bàn** (khách đổi chỗ), **Ghép bàn** (đoàn đông khách), **In phiếu kiểm đồ tạm tính**.
   - **Hủy món có kiểm soát**: Nếu món đang nấu -> bắt buộc nhập lý do hủy để lưu Audit Log.
3. **Đầu Bếp & Bar (Kitchen & Bar)**:
   - Nhận đơn realtime theo chuẩn FIFO.
   - Món nào trễ trên 20 phút tự động đổi màu đỏ cảnh báo.
   - Nút **Báo Hết Món Khẩn Cấp (86ing)**: Khóa món tức thì trên toàn hệ thống.
   - Bấm **Món Xong** -> Lập tức máy phục vụ nhận banner chuông thông báo bê ra bàn.
4. **Thu Ngân (Cashier)**:
   - Nhận diện đơn bàn, áp dụng chiết khấu hạng thành viên (Bạc, Vàng, VIP) và phụ thu phòng VIP.
   - Sinh mã **VietQR động** chuẩn NAPAS247 (tự điền đúng số tiền và nội dung).
   - Thanh toán thành công -> Tự động giải phóng bàn và **tự động trừ kho nguyên liệu** theo công thức định lượng!
   - Quản lý ca làm việc, đối soát tiền két khi giao ca.
5. **Quản Lý (Manager)**:
   - Xem doanh thu thời gian thực từ xa.
   - Xem **Nhật ký kiểm soát chống gian lận (Audit Log)**: Xem ai hủy món, lý do hủy, chuyển bàn.
   - Quản lý **Kho nguyên liệu**: Xem cảnh báo đỏ nguyên liệu sắp hết, nhập thêm hàng vào kho.
