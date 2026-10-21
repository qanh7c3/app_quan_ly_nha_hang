# TÀI LIỆU ĐẶC TẢ NGHIỆP VỤ HỆ THỐNG QUẢN LÝ NHÀ HÀNG TOÀN DIỆN (CLOUD POS & RMS)

> **Dự án:** Ứng Dụng Quản Lý Nhà Hàng Trên Nền Tảng Điện Toán Đám Mây  
> **Kiến trúc:** Cloud-Native MERN Stack (ReactJS, Node.js Express, MongoDB Atlas, Socket.IO, Cloudinary, VietQR)  
> **Mục tiêu:** Phục vụ đa dạng mô hình nhà hàng (A la carte, Buffet, Quán nướng, Cà phê/Bar) với 5 phân hệ người dùng chuyên môn hóa.

---

## 1. Bộ phận Lễ tân (Hostess / Receptionist)
Lễ tân là người đầu tiên tiếp xúc với khách, nhiệm vụ trọng tâm là điều phối chỗ ngồi và tối ưu công suất bàn:

- **Quản lý Đặt bàn trước (Reservation):**
  - Tiếp nhận thông tin đặt bàn (qua điện thoại, fanpage, web): Tên khách, số điện thoại, số lượng người, giờ đến, yêu cầu đặc biệt (ghế trẻ em, phòng VIP, trang trí sinh nhật, dị ứng thực phẩm).
  - Gán bàn dự kiến và tự động khóa trạng thái bàn đó trước giờ khách đến.
- **Sơ đồ bàn trực quan (Floor Plan):**
  - Nhìn được toàn cảnh các tầng/khu vực (Tầng 1, Sân vườn, Phòng lạnh) với màu sắc phân biệt rõ: *Bàn trống, Bàn đã đặt trước, Bàn đang có khách, Bàn đang dọn dẹp*.
- **Đón khách & Xếp bàn (Check-in & Walk-in):**
  - Đổi trạng thái từ "Đặt trước" sang "Khách đã vào bàn".
  - Với khách vãng lai khi quán đông: Ghi nhận vào **Danh sách chờ (Waitlist)** và thông báo ngay khi có bàn trống phù hợp với số lượng người.

---

## 2. Nhân viên Phục vụ (Waitstaff / Order Taker)
Nhiệm vụ của phục vụ là tốc độ, chính xác trong gọi món và chăm sóc bàn ăn:

- **Mở bàn & Ghi nhận Order:**
  - Chọn bàn, nhập số lượng khách thực tế ngồi vào bàn.
  - Chọn món nhanh theo phân nhóm, tìm kiếm món và ghi chú đặc biệt cho từng món (ví dụ: không hành, ít cay, bò chín kỹ, làm trước cho trẻ em).
- **Xử lý biến động tại bàn (Nghiệp vụ cực kỳ quan trọng):**
  - **Chuyển bàn:** Khách muốn đổi từ bàn ngoài trời vào phòng điều hòa.
  - **Ghép bàn / Tách bàn:** Đoàn khách đông ghép 2–3 bàn lại, hoặc một bàn lớn muốn tách riêng bill cho từng nhóm nhỏ.
  - **Thêm món / Hủy món / Đổi món:** Khách gọi thêm giữa chừng hoặc xin hủy món. Nếu bếp chưa nấu thì cho hủy ngay; nếu bếp đang nấu rồi thì phải cần quyền xác nhận của Quản lý.
- **Nhận thông báo trả món:**
  - Nhận tín hiệu ngay trên điện thoại/máy tính bảng (qua Socket.IO) khi Bếp làm xong món: *"Món Cá lăng nướng của Bàn 05 đã sẵn sàng tại quầy ra đồ"* để bê ra kịp lúc món còn nóng.
- **Yêu cầu tạm tính:**
  - In phiếu kiểm đồ hoặc xem tạm tính trên màn hình để khách kiểm tra lại các món đã gọi trước khi ra quầy thu ngân.

---

## 3. Bộ phận Đầu bếp & Pha chế (Kitchen & Bar)
Nhiệm vụ của Bếp là chế biến đúng thứ tự, đúng định lượng, không bỏ sót đơn và kiểm soát nguyên liệu:

- **Tiếp nhận & Điều phối món ăn (Màn hình KDS):**
  - Phân luồng tự động: Món ăn nhảy vào màn hình Bếp Nóng/Bếp Lạnh, đồ uống tự động nhảy sang màn hình Quầy Bar.
  - Sắp xếp theo thứ tự ưu tiên (bàn nào gọi trước làm trước - FIFO, hoặc gom các món giống nhau của nhiều bàn để chế biến cùng một mẻ).
- **Báo cáo tiến độ món ăn:**
  - Bấm chuyển trạng thái: `Mới nhận` -> `Đang chế biến` -> `Hoàn thành (Báo phục vụ bê đi)`.
  - Cảnh báo màu đỏ nếu một món đã quá thời gian quy định (ví dụ quá 20 phút) mà chưa làm xong.
- **Báo hết món khẩn cấp (Out of stock / 86ing):**
  - Khi một nguyên liệu vừa hết trong ca, Bếp bấm nút "Báo hết" ngay trên màn hình của mình -> Lập tức máy của tất cả nhân viên phục vụ khóa món đó lại theo thời gian thực để không nhận order nhầm của khách.

---

## 4. Bộ phận Thu ngân (Cashier)
*(Ở nhiều nhà hàng vừa và nhỏ, Lễ tân hoặc Quản lý sẽ kiêm nhiệm vị trí này)*

- **Thanh toán linh hoạt:**
  - Hỗ trợ nhiều phương thức: Tiền mặt, Quẹt thẻ, Chuyển khoản mã QR động (VietQR tự động điền đúng số tiền), hoặc thanh toán kết hợp (một nửa tiền mặt, một nửa chuyển khoản).
  - **Tách hóa đơn (Split Bill):** Chia tiền theo đầu người hoặc tách riêng từng món cho từng khách trong cùng một bàn.
- **Áp dụng Khuyến mãi & Phụ thu:**
  - Nhập mã giảm giá, chiết khấu theo hạng thành viên (VIP, Vàng, Bạc), tích điểm cho khách.
  - Cộng thuế VAT, phí dịch vụ hoặc phụ thu (phí phòng VIP, phí mang rượu từ ngoài vào).
- **Quản lý két tiền & Kết ca:**
  - Đầu ca nhập số tiền lẻ có sẵn; cuối ca đối soát tổng tiền mặt thu được và tổng tiền chuyển khoản để bàn giao.

---

## 5. Cấp Quản lý / Chủ nhà hàng (Manager / Owner)
Nhiệm vụ của Quản lý là giám sát toàn diện, kiểm soát thất thoát và ra quyết định kinh doanh:

- **Quản trị Thực đơn & Giá bán:**
  - Thêm món mới, đổi giá, tạo các gói Combo/Buffet, cài đặt khung giờ vàng (Happy Hour - tự động giảm giá vào khung giờ vắng khách).
- **Kiểm soát quyền hạn nhạy cảm (Chống gian lận):**
  - Phê duyệt các thao tác nhạy cảm của nhân viên: Hủy món khi đã in bill/đang nấu, giảm giá ngoại lệ cho khách quen, mở két tiền không cần thanh toán, in lại hóa đơn nhiều lần. Mọi thao tác hủy đều phải lưu lại lịch sử (Audit Log) ai hủy và lý do hủy.
- **Quản lý Kho & Định lượng (Inventory):**
  - Nhập kho nguyên vật liệu hàng ngày (thịt, rau, bia, nước ngọt).
  - Tự động trừ kho theo định lượng mỗi khi bán được món (ví dụ: bán 1 đĩa bò lúc lắc tự động trừ 200g thịt bò trong kho).
- **Quản lý Nhân sự & Phân ca:**
  - Phân quyền tài khoản rõ ràng (RBAC: Lễ tân, Phục vụ, Bếp/Bar, Thu ngân, Quản lý - ai làm vị trí nào chỉ nhìn thấy màn hình và chức năng của vị trí đó).
  - Đánh giá hiệu suất: Nhân viên nào phục vụ được nhiều bàn nhất, đầu bếp nào ra món đúng giờ nhất.
- **Báo cáo & Phân tích kinh doanh:**
  - Xem doanh thu theo thời gian thực từ xa (đang có bao nhiêu bàn ngồi, tạm tính được bao nhiêu tiền).
  - Thống kê giờ cao điểm/thấp điểm, nhóm món mang lại lợi nhuận cao nhất (Best-seller) và nhóm món ế cần loại bỏ khỏi menu.
