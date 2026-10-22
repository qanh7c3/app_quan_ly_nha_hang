# SYSTEM EXECUTION DIRECTIVE: RESTAURANT CLOUD POS & KDS UPGRADE

> **Target Agent:** Antigravity AI Agent  
> **Repository Target:** Default Root Repository  
> **Target Branch:** `main`  
> **Safety Mode:** Mandatory Pre-execution Backup Enabled

---

## 🛑 BƯỚC 0: SAO LƯU TOÀN BỘ CODE CŨ LÊN GITHUB (BẮT BUỘC TRƯỚC KHI SỬA)

Agent **tuyệt đối không** được sửa file mã nguồn trước khi hoàn tất 4 lệnh Git an toàn sau:

```bash
# 1. Kiểm tra trạng thái Git hiện tại
git status

# 2. Tạo một nhánh sao lưu chứa toàn bộ mã nguồn cũ
BACKUP_BRANCH="backup-stable-$(date +%Y%m%d%H%M%S)"
git checkout -b "$BACKUP_BRANCH"

# 3. Đẩy nhánh sao lưu này lên GitHub để lưu trữ an toàn
git push -u origin "$BACKUP_BRANCH"

# 4. Tạo nhánh phát triển tính năng mới để thực hiện các yêu cầu
git checkout -b feature/ui-menu30-inventory-upgrade
```

---

## NHIỆM VỤ 1: NÂNG CẤP GIAO DIỆN (UI/UX) HIỆN ĐẠI & BẮT MẮT

Agent rà soát toàn bộ các trang giao diện (`POS Order`, `KDS Bếp`, `Kho hàng`, `Thu ngân`, `Báo cáo`, `Cài đặt`):

### 1. Phối Màu & Màu Nền (Theme Styling):
- Loại bỏ các trang có nền trắng trơn chói mắt.
- Chuyển sang nền hiện đại:
  - Nếu là **Dark theme**: Dùng bảng màu Slate/Zinc sâu lắng (`bg-slate-900`, `text-slate-100`, card `bg-slate-800/90` có viền `border-slate-700/60`).
  - Nếu là **Light theme**: Dùng nền tông kem ấm hoặc xám nhạt cao cấp (`bg-stone-50` hoặc `bg-slate-100`, card trắng bo góc với hiệu ứng đổ bóng `shadow-sm`).
- Thêm ảnh banner ẩm thực hoặc các thẻ danh mục có hình ảnh minh họa sắc nét (Món kho, Món canh, Món xào, Hải sản, Tráng miệng).

### 2. Thiết Kế Nút Thao Tác (Button Hierarchy):
- **Nút hành động chính (Dùng thường xuyên):**
  - Danh sách: `Thêm món`, `Gửi bếp`, `Thanh toán`, `Nhập kho`, `Xác nhận`, `Đề xuất mua thêm`.
  - Quy cách: Kích thước lớn (`px-6 py-3 text-base` hoặc `text-lg`), bo tròn mềm mại (`rounded-xl` hoặc `rounded-2xl`), font chữ in đậm rõ nét (`font-semibold`).
  - Màu sắc: Dùng màu nổi bật dễ nhận biết (Emerald Green `#059669` cho lưu/gửi bếp, Indigo `#4f46e5` cho thêm món, Amber/Orange `#d97706` cho thanh toán/cảnh báo).
  - Tương tác: Thêm hiệu ứng hover, shadow nổi (`shadow-lg shadow-emerald-500/20`), hiệu ứng khi nhấn (`active:scale-95 transition-all`).
- **Nút phụ (Thao tác ít / hành động hủy):**
  - Danh sách: `Hủy bàn`, `Xóa món`, `Quay lại`, `Đóng`.
  - Quy cách: Kích thước vừa phải, dùng màu trung tính (`variant="outline"`, `bg-slate-200` hoặc viền xám nhẹ `border-slate-600`), tránh gây nhầm lẫn với nút chính.
- **Tối ưu hiển thị phông chữ:** Dùng font chữ không chân rõ ràng (`Inter`, `Roboto`, hoặc `Be Vietnam Pro`), tăng tương phản để màn hình POS và KDS bếp hiển thị rõ dưới ánh đèn quầy và khói bếp.

---

## NHIỆM VỤ 2: THỰC ĐƠN CHUẨN 30 MÓN (POS & SỔ TAY ĐẦU BẾP)

Thay thế hoặc cập nhật danh mục thực đơn của quán thành đúng **30 món ăn gia đình** theo bảng dưới đây.

### 1. Bảng Dữ Liệu Giá Bán Niêm Yết Siêu Thị:
*Giá bán hiển thị cho Thu ngân và Phục vụ PHẢI dùng cột **Giá Siêu thị**:*

| STT | Tên món ăn | Danh mục | Giá Siêu thị (Giá Bán POS) | Giá Chợ (Giá Cost) | Lợi nhuận gộp |
| :-: | :--- | :--- | :-: | :-: | :-: |
| 1 | Thịt kho tàu nước dừa | Món kho | **125.000 đ** | 105.000 đ | 20.000 đ |
| 2 | Sườn xào chua ngọt | Món rim / xào | **120.000 đ** | 105.000 đ | 15.000 đ |
| 3 | Canh chua cá lóc | Món canh | **100.000 đ** | 85.000 đ | 15.000 đ |
| 4 | Gà rang sả ớt | Món mặn | **95.000 đ** | 80.000 đ | 15.000 đ |
| 5 | Bò lúc lắc | Món xào | **175.000 đ** | 150.000 đ | 25.000 đ |
| 6 | Canh cua rau đay mướp | Món canh dân dã | **70.000 đ** | 60.000 đ | 10.000 đ |
| 7 | Đậu phụ sốt cà chua | Món thanh đạm | **32.000 đ** | 25.000 đ | 7.000 đ |
| 8 | Cá bống kho tộ | Món kho | **95.000 đ** | 80.000 đ | 15.000 đ |
| 9 | Mực xào cần tỏi | Món xào hải sản | **155.000 đ** | 130.000 đ | 25.000 đ |
| 10 | Canh sườn hầm củ quả | Món canh bồi bổ | **110.000 đ** | 95.000 đ | 15.000 đ |
| 11 | Trứng cuộn thịt băm chiên | Món chiên nhanh | **40.000 đ** | 32.000 đ | 8.000 đ |
| 12 | Tôm rim mặn ngọt | Món rim | **115.000 đ** | 95.000 đ | 20.000 đ |
| 13 | Rau muống xào tỏi | Món rau | **24.000 đ** | 18.000 đ | 6.000 đ |
| 14 | Bắp bò ngâm mắm | Món nhắm / Khô | **220.000 đ** | 190.000 đ | 30.000 đ |
| 15 | Vịt om sấu | Món om / Lẩu | **125.000 đ** | 105.000 đ | 20.000 đ |
| 16 | Nem rán truyền thống | Món chiên tiệc | **110.000 đ** | 95.000 đ | 15.000 đ |
| 17 | Canh kim chi đậu bò | Món canh cay | **100.000 đ** | 85.000 đ | 15.000 đ |
| 18 | Thịt ba chỉ luộc mắm tôm | Món luộc | **98.000 đ** | 85.000 đ | 13.000 đ |
| 19 | Bò xào bông cải xanh | Món xào dinh dưỡng | **118.000 đ** | 100.000 đ | 18.000 đ |
| 20 | Canh nghêu nấu chua cay | Món canh hải sản | **52.000 đ** | 43.000 đ | 9.000 đ |
| 21 | Cánh gà chiên nước mắm | Món chiên | **78.000 đ** | 65.000 đ | 13.000 đ |
| 22 | Nấm xào dầu hào lá quế | Món xào / Chay | **55.000 đ** | 45.000 đ | 10.000 đ |
| 23 | Đậu hũ Ma Bà (Mapo Tofu) | Món cay mặn | **55.000 đ** | 45.000 đ | 10.000 đ |
| 24 | Măng tây xào tôm tươi | Món xào cao cấp | **145.000 đ** | 120.000 đ | 25.000 đ |
| 25 | Canh gà lá giang | Món canh miền Nam | **95.000 đ** | 80.000 đ | 15.000 đ |
| 26 | Cá hồi áp chảo bơ chanh | Món áp chảo | **230.000 đ** | 190.000 đ | 40.000 đ |
| 27 | Nấm đùi gà kho tiêu xanh | Món kho chay | **50.000 đ** | 40.000 đ | 10.000 đ |
| 28 | Salad ức gà sốt mè rang | Món Healthy | **75.000 đ** | 60.000 đ | 15.000 đ |
| 29 | Trứng hấp vân thịt kiểu Nhật | Món hấp | **48.000 đ** | 38.000 đ | 10.000 đ |
| 30 | Chè hạt sen long nhãn | Món tráng miệng | **90.000 đ** | 75.000 đ | 15.000 đ |

### 2. Sổ Tay Công Thức Cho Đầu Bếp (KDS Recipe Modal):
Agent nhúng nội dung chi tiết vào modal/trang Sổ tay công thức của màn hình Bếp KDS:
### 1. Thịt Kho Tàu Nước Dừa
* **Nguyên liệu:** 500g thịt ba chỉ hoặc thịt nách; 4-5 quả trứng vịt luộc; 1 quả dừa tươi (300ml nước); hành, tỏi băm, nước mắm ngon, hạt nêm, tiêu, nước hàng (nước màu).
* **Cách làm:**
  1. Thịt cạo sạch, thái miếng vuông vừa ăn 3*3CM, chần qua nước sôi rồi rửa sạch.
  2. Ướp thịt với 2 thìa canh nước mắm, 1 thìa đường, 1 thìa nước hàng, tỏi hành băm trong 30 phút.
  3. Xào săn thịt, sau đó đổ nước dừa tươi ngập mặt thịt. Đun sôi rồi hạ nhỏ lửa liu riu, vớt bọt.
  4. Cho trứng vịt đã bóc vỏ vào, kho nhỏ lửa khoảng 45 - 60 phút cho tới khi thịt mềm rục, nước sánh lại và có màu cánh gián đẹp mắt.

### 2. Sườn Xào Chua Ngọt
* **Nguyên liệu:** 500g sườn non thăn; 1 củ hành tây hoặc ớt chuông; tỏi băm; gia vị sốt: 2 thìa canh giấm gạo (hoặc nước cốt me), 2 thìa đường, 2 thìa nước mắm, 1 thìa tương cà, 1 thìa tương ớt.
* **Cách làm:**
  1. Sườn chặt khúc vừa ăn, luộc sơ với muối, rửa sạch để ráo.
  2. Rán sườn trên chảo dầu lửa vừa cho vàng đều 2 mặt, vớt ra thấm dầu.
  3. Pha hỗn hợp sốt chua ngọt từ giấm, đường, mắm, tương cà, tương ớt và 2 thìa nước lọc.
  4. Phi thơm tỏi, cho sườn và nước sốt vào đảo đều, đậy vung hạ lửa nhỏ cho ngấm gia vị đến khi sốt sệt lại bao quanh sườn, rắc thêm hành hoa.

### 3. Canh Chua Cá Lóc
* **Nguyên liệu:** 1 con cá lóc (khoảng 500g); 1/4 quả dứa; 2 quả cà chua; 50g đậu bắp; 1 cây dọc mùng; giá đỗ; me chín; rau ngổ, ngò gai, ớt tươi.
* **Cách làm:**
  1. Cá làm sạch nhớt bằng muối và chanh, cắt khúc dày, ướp chút mắm tiêu.
  2. Dằm me với nước ấm lấy nước cốt me. Dọc mùng tước vỏ bóp muối, rửa sạch.
  3. Phi thơm tỏi băm, cho cà chua xào tạo màu, đổ 1 lít nước lọc và nước cốt me vào đun sôi.
  4. Nước sôi thả cá vào nấu chín (khoảng 7-10 phút), vớt bọt. Cho dứa, đậu bắp, dọc mùng vào đun tiếp 2 phút. Cuối cùng cho giá, nêm nếm mắm đường chua ngọt vừa miệng, tắt bếp rắc rau ngổ, ngò gai.

### 4. Gà Rang Sả Ớt
* **Nguyên liệu:** 500g thịt gà ta; 3 củ sả băm; 1-2 quả ớt băm; tỏi khô; lá chanh thái chỉ; gia vị: mắm, đường, dầu hào, hạt nêm, tiêu.
* **Cách làm:**
  1. Gà chặt miếng nhỏ vừa ăn, ướp với 1/2 lượng sả ớt, 1 thìa mắm, 1 thìa dầu hào, 1/2 thìa đường trong 20 phút.
  2. Phi thơm phần sả ớt còn lại với dầu ăn cho vàng giòn, vớt ra để riêng.
  3. Cho gà vào chảo rang săn ở lửa lớn. Khi gà ra nước thì hạ lửa vừa đun đến khi cạn nước và thịt săn vàng cạnh.
  4. Trút phần sả ớt chiên giòn vào đảo cùng 1 phút, rắc lá chanh thái sợi và tắt bếp.

### 5. Bò Lúc Lắc
* **Nguyên liệu:** 400g thịt thăn bò mềm; 1 quả ớt chuông xanh, 1 quả đỏ; 1/2 củ hành tây; bơ lạt; tỏi băm; gia vị: dầu hào, xì dầu, tương cà, tiêu đen xay.
* **Cách làm:**
  1. Thịt bò thái quân cờ (2X2CM), ướp tỏi băm, dầu hào, tiêu, 1 thìa dầu ăn cho mềm trong 20 phút.
  2. Ớt chuông, hành tây cắt miếng vuông tương đương miếng bò. Xào nhanh rau củ với chút muối trên lửa lớn cho chín tới, trút ra đĩa.
  3. Bật chảo lửa lớn cho thật nóng, phi tỏi và cho bò vào đảo nhanh tay (khoảng 2 phút) cho xém cạnh, thêm chút bơ lạt cho thơm ngậy.
  4. Trút rau củ vào đảo đều cùng bò thêm 30 giây rồi cho ra đĩa ăn kèm khoai tây chiên hoặc xà lách.

### 6. Canh Cua Rau Đay Mướp
* **Nguyên liệu:** 300g cua đồng xay; 1 bó rau đay; 1 bó mồng tơi; 1 quả mướp hương nhỏ; gia vị: mắm tôm (tùy khẩu vị), bột canh, hạt nêm.
* **Cách làm:**
  1. Cho cua xay hòa với 1 lít nước lọc, lọc qua rây 2-3 lần lấy nước cốt cua, bỏ bã.
  2. Rau đay, mồng tơi nhặt rửa sạch thái nhỏ. Mướp gọt vỏ bổ vát mỏng.
  3. Cho chút muối vào nồi nước cua, khuấy đều rồi đặt lên bếp đun lửa vừa. Khuấy nhẹ đáy nồi để thịt không bén đáy, khi thịt cua bắt đầu nổi lên thành mảng thì hạ nhỏ lửa, không khuấy nữa để thịt đóng tảng.
  4. Gạt nhẹ tảng cua sang một bên, thả mướp và rau vào, nêm nếm gia vị vừa ăn. Nấu sôi lại khoảng 1-2 phút cho rau chín là hoàn thành.

### 7. Đậu Phụ Sốt Cà Chua
* **Nguyên liệu:** 4 bìa đậu phụ trắng; 3 quả cà chua chín; hành khô, hành lá; hạt nêm, nước mắm, chút đường, dầu ăn.
* **Cách làm:**
  1. Đậu thái miếng vuông vừa ăn, rán vàng các mặt (hoặc dùng đậu tươi luộc tùy sở thích).
  2. Cà chua rửa sạch bổ múi cau nhỏ. Phi thơm hành khô băm nhỏ, cho cà chua vào đảo nhuyễn với chút muối để nhanh mềm tạo sốt sánh mịn.
  3. Cho thêm 3-4 thìa nước lọc, 1 thìa mắm, 1 thìa hạt nêm, chút xíu đường vào chảo cà chua.
  4. Thả đậu vào đảo nhẹ tay cho đậu ngấm sốt trong 5 phút. Rắc hành lá thái nhỏ và hạt tiêu lên trên trước khi tắt bếp.

### 8. Cá Bống Kho Tộ
* **Nguyên liệu:** 300g cá bống tươi; thịt ba chỉ (50g); hành củ, tỏi băm, ớt tươi; nước màu dừa, nước mắm ngon, tiêu sọ đập dập.
* **Cách làm:**
  1. Cá bống làm sạch, xóc muối rửa sạch cho hết nhớt, để thật ráo nước.
  2. Ướp cá với mắm ngon, đường, tiêu, ớt và nước màu trong 30 phút cho thấm sâu vào thịt cá.
  3. Phi thơm hành tỏi và xào săn vài miếng thịt ba chỉ dưới đáy tộ đất.
  4. Xếp cá vào tộ, đun lửa to cho sôi bùng lên rồi hạ thật nhỏ lửa. Đun liu riu tới khi nước cạn sánh sệt, cá săn chắc lại thì rắc thật nhiều tiêu và ớt lát lên trên.

### 9. Mực Xào Cần Tỏi
* **Nguyên liệu:** 400g mực ống tươi; 1 cây cần tây; 2 cây tỏi tây (boa-rô); 1 củ hành tây; 1 quả cà chua; gừng, tỏi, tiêu xay, dầu hào, hạt nêm.
* **Cách làm:**
  1. Mực làm sạch túi mực, khứa vảy rồng rồi cắt miếng vừa ăn, chần nhanh qua nước sôi có gừng đập dập để khử tanh, vớt ra để ráo.
  2. Cần, tỏi tây cắt khúc dài 4 cm; hành tây bổ múi cau.
  3. Phi thơm tỏi, bật lửa lớn cho mực vào xào nhanh cùng 1 thìa dầu hào, đảo đều trong 1-2 phút cho mực chín tới rồi múc riêng ra đĩa.
  4. Cho tiếp rau củ vào chảo xào nhanh lửa lớn, nêm chút hạt nêm. Khi rau củ chín tới thì đổ mực vào đảo đều cùng rau khoảng 30 giây, rắc hạt tiêu rồi tắt bếp.

### 10. Canh Sườn Hầm Củ Quả
* **Nguyên liệu:** 400g sườn non; 1 bắp ngô ngọt; 1 củ cà rốt; 1 củ khoai tây; hành hoa, mùi ta; muối, hạt nêm.
* **Cách làm:**
  1. Sườn chặt khúc, chần qua nước sôi 2 phút rồi rửa sạch bọt bẩn.
  2. Cho sườn vào nồi cùng 1,2 lít nước và 1 thìa cà phê muối, hầm nhỏ lửa khoảng 20 phút, vớt bọt cho nước trong.
  3. Ngô ngọt cắt khúc, cà rốt và khoai tây gọt vỏ cắt miếng vừa ăn.
  4. Cho ngô, cà rốt và khoai tây vào hầm tiếp cùng sườn khoảng 15 phút cho củ quả mềm ngọt. Nêm lại hạt nêm vừa ăn, múc ra bát rắc hành mùi.

### 11. Trứng Cuộn Thịt Băm Chiên
* **Nguyên liệu:** 3 quả trứng gà/vịt; 100g thịt nạc heo xay; mộc nhĩ ngâm nở băm nhỏ; hành tím băm; nước mắm, tiêu xay.
* **Cách làm:**
  1. Trộn thịt băm với mộc nhĩ, hành tím, chút mắm và tiêu.
  2. Đập trứng ra bát, đánh tan đều cùng 1 thìa nước lọc (giúp trứng mềm xốp) và chút xíu bột nêm.
  3. Cho dầu vào chảo chống dính đun nóng vừa, đổ một lớp trứng mỏng tráng đều mặt chảo.
  4. Khi trứng se mặt thì phết đều một lớp thịt băm mỏng lên trên, nhẹ nhàng cuộn tròn mép trứng lại. Đậy nắp chảo đun lửa thật nhỏ 5-7 phút cho thịt bên trong chín đều, lấy ra cắt khoanh tròn bày đĩa.

### 12. Tôm Rim Mặn Ngọt
* **Nguyên liệu:** 350g tôm thẻ hoặc tôm đồng; tỏi, hành tím băm; gia vị: nước mắm, đường cát, tiêu, dầu màu điều hoặc nước màu.
* **Cách làm:**
  1. Tôm cắt râu và đầu nhọn, rửa sạch để ráo nước (nếu tôm to có thể bóc vỏ chừa đuôi).
  2. Pha nước sốt: 2 thìa canh mắm, 2 thìa đường, 1 thìa nước lọc, 1/2 thìa tiêu xay.
  3. Phi thơm hành tỏi với 1 thìa dầu màu điều, trút tôm vào xào lửa lớn đến khi tôm chuyển sang màu đỏ cong lại.
  4. Đổ bát nước sốt vào rim lửa vừa cho đến khi nước sốt keo lại bám đều quanh từng con tôm, bóng đỏ óng ả thì tắt bếp.

### 13. Rau Muống Xào Tỏi
* **Nguyên liệu:** 1 bó rau muống non; 1-2 củ tỏi ta; dầu ăn, nước mắm, hạt nêm.
* **Cách làm:**
  1. Rau muống nhặt ngọn non, rửa sạch ngâm nước muối loãng. Đun nồi nước sôi có chút muối, chần rau nhanh trong 20 giây rồi vớt ngay ra âu nước đá lạnh để rau giữ màu xanh giòn.
  2. Tỏi đập dập, chia làm 2 phần.
  3. Phi thơm 1/2 phần tỏi với nhiều dầu ăn trên lửa to, cho rau muống đã ráo nước vào đảo thật nhanh tay.
  4. Nêm 1 thìa nước mắm, 1 thìa hạt nêm, cho nốt phần tỏi còn lại vào đảo đều thêm 30 giây rồi trút ra đĩa ăn ngay.

### 14. Bắp Bò Ngâm Mắm
* **Nguyên liệu:** 500g bắp bò hoa/gân; quế, hồi, thảo quả, gừng, tỏi thái lát, ớt chỉ thiên; nước ngâm: 1 bát nước mắm ngon, 1 bát đường vàng, 1/2 bát giấm gạo, 1/2 bát nước lọc.
* **Cách làm:**
  1. Bắp bò rửa sạch, bó tròn bằng chỉ thực phẩm. Luộc chín bắp bò với gừng đập dập, 1 bông hồi, nhánh quế nhỏ và chút muối trong 35-40 phút cho chín mềm. Vớt ra ngâm nước đá lạnh rồi để thật khô ráo.
  2. Nấu nước ngâm: Hòa tan mắm, đường, giấm, nước lọc, đun sôi lăn tăn rồi để thật nguội hoàn toàn.
  3. Xếp thịt bò vào hũ thủy tinh tiệt trùng, rải tỏi lát và ớt tươi xen kẽ.
  4. Đổ nước mắm nguội ngập thịt bò, chèn vỉ để thịt không nổi lên mặt nước. Đậy kín sau 3-4 ngày trong ngăn mát tủ lạnh là dùng được. Khi ăn thái lát thật mỏng.

### 15. Vịt Om Sấu
* **Nguyên liệu:** 1/2 con vịt làm sạch (khoảng 800g); 6-8 quả sấu xanh; 200g khoai sọ; sả, gừng, hành tỏi băm, mùi tàu (ngò gai), rau ngổ.
* **Cách làm:**
  1. Vịt xát muối, rượu trắng và gừng để khử mùi hôi đặc trưng, chặt miếng vừa ăn.
  2. Ướp vịt với hành, tỏi, sả băm, hạt nêm, tiêu trong 20 phút.
  3. Phi thơm hành tỏi sả, xào săn thịt vịt cho ra bớt mỡ. Cho sấu vào đảo cùng.
  4. Đổ nước ngập mặt thịt, đun sôi rồi hạ lửa om 20 phút. Thêm khoai sọ đã gọt vỏ vào om tiếp đến khi khoai bở mềm. Dầm sấu nêm nếm lại độ chua mặn ngọt vừa miệng, rắc mùi tàu rau ngổ.

### 16. Nem Rán Truyền Thống (Chả Giò)
* **Nguyên liệu:** 300g thịt nạc vai xay; 100g tôm nõn băm; mộc nhĩ, nấm hương ngâm nở; 1 củ cà rốt nhỏ nạo sợi; miến dong ngâm mềm cắt khúc; 2 quả trứng gà; hành lá, bánh đa nem (vỏ ram).
* **Cách làm:**
  1. Trộn đều thịt, tôm, mộc nhĩ, nấm hương, miến, cà rốt, hành và trứng với chút hạt tiêu, bột canh để làm nhân nem.
  2. Trải bánh đa nem ra mặt phẳng, múc lượng nhân vừa phải đặt vào mép bánh, gập hai bên mép lại và cuộn tròn vừa tay (không cuộn quá chặt kẻo vỡ khi rán).
  3. Đun nóng dầu ăn ngập chảo, cho nem vào rán 2 lần (lần 1 rán sơ chín tới lửa nhỏ, lần 2 rán lửa vừa cho vàng giòn rụm).
  4. Vớt nem ra giấy thấm dầu, ăn kèm bún, rau sống và nước chấm chua ngọt tỏi ớt.

### 17. Canh Kim Chi Đậu Phụ Thịt Bò
* **Nguyên liệu:** 200g thịt thăn bò hoặc ba chỉ bò cuộn; 200g kim chi cải thảo muối chua; 1 hộp đậu phụ non; tỏi băm, hành hoa; gia vị: dầu mè, ớt bột Hàn Quốc, nước tương.
* **Cách làm:**
  1. Phi thơm tỏi với chút dầu mè, cho thịt bò vào xào tái cùng chút nước tương, múc riêng ra.
  2. Cho kim chi thái miếng vừa ăn vào xào thơm khoảng 2 phút, đổ thêm 600ml nước lọc đun sôi.
  3. Cắt đậu phụ non thành từng khoanh thả vào canh, đun sôi liu riu 5 phút cho đậu ngấm vị chua cay của kim chi.
  4. Thả thịt bò đã xào vào nồi canh sôi lại, nêm nếm vừa ăn, rắc hành lá cắt khúc và tắt bếp.

### 18. Thịt Ba Chỉ Luộc Chấm Mắm Tôm
* **Nguyên liệu:** 500g thịt ba chỉ liền khối tươi; 1 củ hành khô; gừng; mắm tôm ngon, chanh, ớt, đường, rượu trắng.
* **Cách làm:**
  1. Thịt cạo sạch bì, rửa với muối và rượu trắng. Buộc chỉ định hình miếng thịt.
  2. Đun sôi nồi nước có đập dập 1 củ hành khô, nhánh gừng và 1 thìa cà phê giấm. Thả thịt vào luộc lửa vừa khoảng 20-25 phút.
  3. Dùng đũa xiên qua miếng thịt không thấy ứa nước đỏ là thịt đã chín tới. Vớt ra thả ngay vào âu nước đá lạnh 5 phút giúp miếng thịt trắng giòn, bì trong.
  4. Pha mắm tôm: 2 thìa mắm tôm, 1 thìa đường, 1 thìa nước cốt chanh, chút rượu trắng, đánh bông bọt lên rồi cho ớt tươi cắt lát. Thái thịt thật mỏng chấm kèm.

### 19. Bò Xào Bông Cải Xanh
* **Nguyên liệu:** 250g thịt thăn bò; 1 cây bông cải xanh (súp lơ); 1 củ cà rốt; tỏi băm; dầu hào, tiêu, bột nêm, dầu ăn.
* **Cách làm:**
  1. Thịt bò thái mỏng ngang thớ, ướp với 1/2 thìa dầu hào, tỏi băm, tiêu và 1 thìa dầu ăn cho mềm.
  2. Bông cải cắt miếng nhỏ, ngâm nước muối loãng, chần qua nước sôi 30 giây rồi vớt ráo. Cà rốt tỉa hoa thái mỏng.
  3. Phi tỏi thơm, cho thịt bò vào xào lửa lớn đảo nhanh tay đến khi vừa chín tái thì trút ra đĩa.
  4. Cho bông cải và cà rốt vào chảo xào nhanh với 1 thìa dầu hào và chút nước lọc cho chín giòn. Đổ bò vào đảo cùng 30 giây cho hòa quyện rồi tắt bếp rắc hạt tiêu.

### 20. Canh Nghêu Nấu Chua Cay
* **Nguyên liệu:** 600g nghêu (ngao) tươi sống; 2 quả cà chua; 1/4 quả dứa; me khô; gừng, sả, ớt lát; rau răm, hành hoa.
* **Cách làm:**
  1. Nghêu ngâm nước vo gạo có vài lát ớt trong 1-2 tiếng cho nhả hết cát, cọ sạch vỏ.
  2. Luộc nghêu với chút nước và gừng sả đập dập cho mở miệng hết thì tắt bếp. Tách lấy ruột nghêu, nước luộc gạn lấy nước trong.
  3. Phi thơm hành tím, xào cà chua cho mềm, cho dứa vào đảo sơ rồi trút nước luộc nghêu cùng nước cốt me vào đun sôi.
  4. Nước sôi thả ruột nghêu vào, nêm nếm gia vị chua cay mặn ngọt vừa miệng, rắc rau răm hành hoa thái nhỏ lên trên.

### 21. Cánh Gà Chiên Nước Mắm
* **Nguyên liệu:** 500g cánh gà tươi; bột bắp/bột chiên giòn; tỏi băm nhuyễn, ớt băm; gia vị: 2 thìa canh mắm ngon, 1.5 thìa đường, 1 thìa tương ớt, 1 thìa nước lọc.
* **Cách làm:**
  1. Cánh gà làm sạch, khía nhẹ, luộc sơ qua rồi để ráo nước.
  2. Áo đều cánh gà qua một lớp bột bắp mỏng nhẹ. Chiên ngập dầu lửa vừa tới khi chín vàng giòn rụm thì vớt ra để ráo dầu.
  3. Trộn đều mắm, đường, tương ớt, nước lọc làm sốt mắm đường.
  4. Phi vàng thơm tỏi ớt băm, đổ bát sốt mắm vào đun sôi sủi bọt, trút cánh gà vào đảo nhanh tay ở lửa nhỏ để sốt áo đều bóng bẩy thì tắt bếp.

### 22. Nấm Xào Dầu Hào Lá Quế
* **Nguyên liệu:** 200g nấm bào ngư hoặc nấm đùi gà; 100g nấm rơm; 1 nắm lá quế (húng quế); tỏi băm; dầu hào, nước tương, hạt tiêu.
* **Cách làm:**
  1. Nấm cắt chân, ngâm rửa nước muối loãng, vắt ráo nước, cắt miếng vừa ăn.
  2. Phi thơm tỏi băm, cho nấm vào đảo trên lửa lớn cho nấm săn lại và chín tới.
  3. Nêm 1.5 thìa dầu hào, 1 thìa nước tương, chút đường, xào nhanh trong 3 phút cho ngấm đều gia vị.
  4. Thả lá húng quế vào đảo sơ cho dậy mùi thơm nồng rồi tắt bếp, rắc tiêu xay và dùng nóng.

### 23. Đậu Hũ Ma Bà (Mapo Tofu)
* **Nguyên liệu:** 1 hộp đậu phụ non (300g); 100g thịt heo xay; 1 thìa canh sốt tương đậu bản cay (Doubanjiang); tỏi, gừng băm, ớt bột; hành lá; bột năng; tiêu Tứ Xuyên.
* **Cách làm:**
  1. Đậu phụ cắt khối vuông nhỏ (1.5CM*1.5CM), chần nhẹ qua nước sôi có chút muối.
  2. Phi thơm gừng tỏi băm, cho tương đậu bản vào xào lên màu đỏ đẹp, thêm thịt xay vào xào săn tơi.
  3. Thêm 1 bát nhỏ nước dùng đun sôi, nhẹ nhàng trút đậu phụ vào, nêm chút xì dầu và đường. Đun liu riu 3-5 phút cho đậu ngấm sốt.
  4. Rưới từ từ nước bột năng vào khuấy nhẹ cho nước sốt sánh mịn. Tắt bếp, rắc hành lá thái nhỏ và tiêu Tứ Xuyên cay tê lên trên.

### 24. Măng Tây Xào Tôm Tươi
* **Nguyên liệu:** 250g tôm sú bóc nõn; 250g măng tây non; tỏi băm; bơ lạt (hoặc dầu ô liu); gia vị: dầu hào, hạt nêm, tiêu sọ.
* **Cách làm:**
  1. Măng tây bẻ bỏ gốc già, tước xơ nhẹ, cắt khúc 4-5 cm, chần nhanh qua nước sôi rồi ngâm đá lạnh.
  2. Tôm nõn khứa lưng rút chỉ đen, ướp chút hạt nêm và tiêu.
  3. Phi tỏi thơm với chút bơ lạt, cho tôm vào xào săn chín đỏ, xúc tôm ra đĩa.
  4. Dùng luôn chảo đó cho măng tây vào xào lửa lớn cùng 1 thìa dầu hào. Khi măng tây vừa chín giòn thì trút tôm vào đảo đều 30 giây rồi tắt bếp.

### 25. Canh Gà Lá Giang
* **Nguyên liệu:** 500g thịt gà ta; 1 bó lá giang tươi; tỏi, hành tím băm, ớt tươi; nước mắm, đường, hạt nêm, tiêu.
* **Cách làm:**
  1. Gà rửa sạch chặt miếng vừa ăn, ướp chút hành băm, mắm, hạt nêm trong 15 phút.
  2. Lá giang nhặt lá non, rửa sạch rồi dùng tay vò dập nhẹ để lá tiết ra vị chua khi nấu.
  3. Phi thơm hành tỏi, cho gà vào xào săn. Đổ 1 lít nước lọc vào đun sôi, hớt bọt hạ nhỏ lửa đun 10-15 phút cho gà chín mềm ngọt.
  4. Thả lá giang đã vò vào nồi canh, nấu sôi thêm 2 phút. Nêm thêm 1 thìa mắm và 1/2 thìa đường để cân bằng vị chua dịu, thêm ớt lát rồi tắt bếp.

### 26. Cá Hồi Áp Chảo Sốt Bơ Chanh
* **Nguyên liệu:** 300g phi-lê cá hồi tươi còn da; 30g bơ lạt; nước cốt 1/2 quả chanh vàng; tỏi băm; lá hương thảo (rosemary) hoặc ngò tây; muối, tiêu đen xay.
* **Cách làm:**
  1. Cá hồi thấm thật khô bằng khăn giấy, rắc đều muối biển và tiêu xay lên hai mặt, ướp 10 phút.
  2. Đun nóng chảo với chút dầu ô liu, áp chảo mặt da cá lửa vừa trong 3-4 phút cho giòn rụm, lật mặt thịt áp tiếp 2 phút đến khi chín tới. Cho cá ra đĩa.
  3. Làm sốt: Hạ lửa nhỏ cho bơ lạt vào đun chảy, phi thơm tỏi băm rồi đổ nước cốt chanh vàng cùng chút muối, tiêu và ngò tây băm nhỏ vào khuấy tan tạo sốt bơ bóng mượt.
  4. Rưới đều sốt bơ chanh còn ấm nóng lên miếng cá hồi và thưởng thức.

### 27. Nấm Đùi Gà Kho Tiêu Xanh (Chay)
* **Nguyên liệu:** 300g nấm đùi gà tươi; vài nhánh tiêu xanh tươi; hành tím băm (hoặc boa-rô băm); gia vị: nước tương ngon, nước màu dừa, đường, hạt nêm chay, tiêu đen.
* **Cách làm:**
  1. Nấm ngâm nước muối loãng 5 phút, rửa sạch, cắt khoanh tròn dày 1.5 cm hoặc khứa hình vảy cá.
  2. Áp chảo các khoanh nấm không dầu cho vàng xém nhẹ hai mặt để nấm dai ngon hơn.
  3. Phi thơm boa-rô/hành với chút dầu ăn trong nồi nhỏ, cho nấm vào đảo đều.
  4. Cho 3 thìa nước tương, 1 thìa đường, 1 thìa nước màu, tiêu xanh đập dập và 1/2 bát con nước lọc vào kho liu riu cho nấm thấm đều sốt sánh đặc lại thì rắc tiêu đen lên trên.

### 28. Salad Ức Gà Sốt Mè Rang
* **Nguyên liệu:** 250g ức gà tươi; xà lách Romaine hoặc xà lách mỡ; cà chua bi; dưa leo; ngô ngọt luộc; sốt mè rang đóng chai; muối, tiêu, dầu ô liu.
* **Cách làm:**
  1. Ức gà rửa sạch lau khô, khía vài đường nhẹ, rắc muối, tiêu và dầu ô liu. Áp chảo hoặc nướng nồi chiên không dầu ở $180^\circ\text{C}$ trong 12-15 phút. Để nguội bớt rồi xé sợi hoặc thái lát.
  2. Xà lách, dưa leo, cà chua bi rửa sạch ngâm nước muối, vớt thật ráo nước. Xà lách cắt khúc, dưa leo cắt lát, cà chua bi bổ đôi.
  3. Bày rau củ và ngô ngọt vào đĩa sâu lòng, xếp ức gà lên trên cùng.
  4. Khi ăn rưới sốt mè rang lên trên và trộn đều.

### 29. Trứng Hấp Vân Thịt Kiểu Nhật (Chawanmushi)
* **Nguyên liệu:** 2 quả trứng gà; 200ml nước dùng Dashi; 50g tôm băm hoặc thịt nạc băm; nấm hương thái lát mỏng; nước tương nhạt, hạt nêm.
* **Cách làm:**
  1. Đánh tan trứng gà nhẹ tay để không tạo bọt khí. Hòa tan nước dùng dashi cùng chút nước tương nhạt, sau đó đổ vào trứng khuấy đều.
  2. Lọc hỗn hợp trứng qua rây 2 lần để mặt trứng sau hấp được láng mịn.
  3. Cho thịt băm/tôm và vài lát nấm hương xuống đáy chén sứ, rót hỗn hợp trứng vào gần đầy chén.
  4. Bọc kín miệng chén bằng giấy bạc. Hấp cách thủy lửa thật nhỏ trong 12-15 phút đến khi trứng đông mịn bồng bềnh là hoàn thành.

### 30. Chè Hạt Sen Long Nhãn
* **Nguyên liệu:** 200g hạt sen tươi; 100g nhãn nhục (long nhãn Hưng Yên sấy khô dẻo); đường phèn; lá dứa tươi.
* **Cách làm:**
  1. Hạt sen thông tâm để tránh bị đắng, rửa sạch.
  2. Cho hạt sen vào nồi với lượng nước vừa ngập, đun sôi rồi hạ nhỏ lửa hầm khoảng 15-20 phút cho sen bở mềm tơi không nát.
  3. Thêm đường phèn và lá dứa vào nồi, đun lửa nhỏ 5 phút cho sen ngấm vị ngọt thanh.
  4. Long nhãn ngâm nước ấm cho nở mềm, vớt ra thả vào nồi chè đun sôi lại 1 phút là tắt bếp ngay để giữ độ giòn sần sật. Dùng nóng hoặc ướp lạnh.

### 3. Sửa Lỗi Hình Ảnh Bia Heineken:
- Tìm kiếm key `Bia Heineken` hoặc `Heniken` trong menu đồ uống.
- Cập nhật đường dẫn ảnh hợp lệ (Dùng ảnh chất lượng cao trực tiếp hoặc CDN ảnh chuẩn: `https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=600&auto=format&fit=crop` hoặc ảnh SVG/PNG minh họa lon Heineken xanh lá cây).

---

## NHIỆM VỤ 3: TÍNH GIÁ COST & BIÊN LỢI NHUẬN (FINANCIAL MARGIN)

Trong module Báo cáo Doanh thu & Quản lý Thực đơn, tích hợp công thức:
1. **Giá vốn (Cost price):** Lấy theo cột `Giá Chợ dân sinh (VNĐ)`.
2. **Giá bán (Selling price):** Lấy theo cột `Giá Siêu thị (VNĐ)`.
3. **Lợi nhuận gộp từng món:**  
   $$\text{Gross Profit} = \text{Giá bán} - \text{Giá vốn}$$
4. **Biên lợi nhuận gộp (% Margin):**  
   $$\% \text{ Margin} = \frac{\text{Giá bán} - \text{Giá vốn}}{\text{Giá bán}} \times 100$$
5. Hiển thị thẻ tóm tắt:
   - Tổng giá trị menu (30 món): $3.078.000\text{ VNĐ}$.
   - Tổng chi phí giá cost: $2.583.000\text{ VNĐ}$.
   - Tổng lợi nhuận gộp tiềm năng: $495.000\text{ VNĐ}$.
   - Biên lợi nhuận trung bình hệ thống: $\approx 16,08\%$.

---

## NHIỆM VỤ 4: ĐỊNH DANH HÓA ĐƠN & PHIẾU TẠM TÍNH (RECEIPT TEMPLATE)

Cập nhật component in/xuất hóa đơn của quầy thu ngân:
- **Tiêu đề hóa đơn:** `HỆ THỐNG QUẢN LÝ NHÀ HÀNG ĐÁM MÂY - CLOUD POS & KDS`
- **Địa chỉ in bắt buộc:**  
  `50 Cát Bi, Hải An, Hải Phòng`
- **Định dạng in:** Hỗ trợ chuẩn hóa trang in máy in nhiệt khổ K80 ($80\text{ mm}$) và K58 ($58\text{ mm}$), căn lề cân đối, không ngắt quãng chữ.

---

## NHIỆM VỤ 5: QUẢN LÝ KHO NGUYÊN LIỆU & GIA VỊ (INVENTORY ENGINE)

### 1. Danh Mục Tồn Kho Đầy Đủ (Nhóm theo 4 phân loại):
- **Nhóm 1 - Thịt, Hải Sản & Trứng:** Thịt ba chỉ heo, Sườn non heo, Thịt thăn bò, Bắp bò hoa/gân, Thịt gà ta, Ức gà, Cánh gà, Thịt vịt cỏ, Cá lóc đồng, Cá bống tươi, Cá hồi phi lê, Cua đồng xay, Mực ống tươi, Nghêu sống, Tôm thẻ, Tôm sú tươi, Trứng vịt, Trứng gà, Đậu phụ trắng, Đậu hũ non.
- **Nhóm 2 - Rau Củ Quả & Nấm:** Rau muống, Rau đay, Mồng tơi, Lá giang, Xà lách Romaine, Giá đỗ, Dọc mùng, Cà chua, Dứa, Đậu bắp, Mướp hương, Bông cải xanh, Măng tây, Cà rốt, Khoai tây, Khoai sọ, Ngô ngọt, Dưa leo, Ớt chuông, Quả sấu xanh, Nấm đùi gà, Nấm bào ngư, Nấm rơm, Nấm hương.
- **Nhóm 3 - Rau Thơm & Thực Phẩm Khô:** Tỏi ta, Hành tím khô, Hành hoa, Tỏi boa-rô, Cần tây, Gừng củ già, Củ sả, Ớt chỉ thiên, Lá chanh, Tiêu xanh, Chanh tươi, Rau ngổ, Ngò gai, Rau răm, Húng quế, Hương thảo rosemary, Lá dứa tươi, Kim chi cải thảo, Bánh đa nem, Miến dong, Mộc nhĩ khô, Long nhãn Hưng Yên, Hạt sen tươi, Nước dừa tươi.
- **Nhóm 4 - Gia Vị & Nước Sốt Đóng Chai:** Nước mắm cốt cá cơm, Muối hạt/tinh, Đường cát trắng, Đường phèn, Bột canh, Hạt nêm thịt, Hạt nêm nấm chay, Tiêu đen xay, Giấm gạo, Me chín vắt, Dầu ăn, Dầu ô liu, Dầu mè thơm, Dầu màu điều, Nước hàng dừa, Dầu hào, Nước tương, Tương cà, Tương ớt, Sốt mè rang, Mắm tôm Bắc, Bơ lạt, Bột bắp/bột năng, Hoa hồi, Quế thanh, Thảo quả, Sốt tương đậu bản Doubanjiang, Tiêu Tứ Xuyên, Bột ớt Hàn Quốc, Bột Dashi.

### 2. Logic Cảnh Báo & Liên Kết Món Ảnh Hưởng:
- Mỗi nguyên liệu có trường `minThreshold` (ngưỡng tối thiểu) và `currentStock` (tồn hiện tại).
- **Khi `currentStock <= minThreshold`:**
  - Kích hoạt badge cảnh báo màu đỏ: `Cần nhập thêm` (Low Stock Alert).
  - Hiển thị nút hành động nổi bật: `[+ Đề xuất mua thêm]`.
  - Hiển thị danh sách các món ăn bị ảnh hưởng.  
    *Ví dụ thực tế:* Khi **"Thịt ba chỉ heo"** hết hàng $\rightarrow$ Tự động cảnh báo 3 món bị thiếu nguyên liệu:
    1. *Thịt kho tàu nước dừa*
    2. *Thịt ba chỉ luộc mắm tôm*
    3. *Cá bống kho tộ*
  - Cho phép người quản trị bấm 1 chạm: `Tạm ngừng phục vụ món này trên POS` (Tự động mờ món trên giao diện phục vụ để tránh khách gọi nhầm).

---

## 🚀 BƯỚC CUỐI: KIỂM TRA LỖI VÀ ĐẨY LÊN NHÁNH MAIN TRÊN GITHUB

Agent thực hiện tuần tự các lệnh sau trong terminal:

```bash
# 1. Chạy build thử nghiệm dự án để đảm bảo không có lỗi cú pháp hoặc đứt gãy component
npm run build || yarn build || vite build || pnpm build

# 2. Commit tất cả các thay đổi trên nhánh làm việc
git add .
git commit -m "feat: complete modern UI refresh, 30-dish supermarket menu, recipe book, inventory linkage & 50 Cat Bi bill update"

# 3. Chuyển về nhánh main và kéo cập nhật mới nhất (nếu có)
git checkout main
git pull origin main

# 4. Hợp nhất nhánh tính năng vào main
git merge feature/ui-menu30-inventory-upgrade --no-edit

# 5. Đẩy chính thức lên GitHub trên nhánh main
git push origin main
```

Agent báo cáo kết quả hoàn thành với:
- Mã hash của commit mới nhất trên `main`.
- Tên nhánh sao lưu an toàn đã được lưu trước đó để người dùng an tâm.