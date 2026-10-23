# Antigravity Project Rules & Guidelines

## 1. Core Principles
- YAGNI (You Aren't Gonna Need It): Chỉ viết đúng những gì được yêu cầu, tối giản tối đa.
- Không viết bất kỳ ghi chú hay comment nào vào trong mã nguồn.

## 2. Coding Standards (C# WinForms)
- Sử dụng Framework / thư viện có sẵn trong dự án, không thêm dependency ngoài.
- Nối chuỗi kết nối chuẩn SQL Server: Data Source=localhost;Initial Catalog=...;TrustServerCertificate=True.
- Sử dụng ký tự Unicode trực tiếp (ví dụ: → thay cho mã LaTeX $\rightarrow$).

## 3. UI & Domain Logic
- Quy trình Waitstaff POS: Báo Có Khách → Nhập số lượng khách → Mở bàn → Mới được gọi món.
- Không được xếp trùng bàn đã đặt trước.
- Đồng bộ công thức món và nguyên liệu kho đúng theo danh mục 30 món chuẩn.
