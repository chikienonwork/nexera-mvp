# Nexera MVP

Prototype tương tác cho vòng lõi của Nexera: tạo hồ sơ chuyển giao, đặt ngưỡng quyền, ghi nhận lần thực hiện, quản lý ngoại lệ và rà soát kết quả.

## Chạy local

Mở thư mục này trong VS Code, sau đó chạy:

```powershell
npm start
```

Mở `http://localhost:4173` trong trình duyệt.

## Phạm vi hiện có

- Frontend responsive bằng HTML/CSS/JavaScript.
- GSAP cho chuyển cảnh trang, modal và phản hồi khi kiểm tra quyền; tôn trọng cài đặt giảm chuyển động của máy.
- Dữ liệu demo được lưu trong `localStorage` của trình duyệt.

## Phần cần có trước pilot thật

- Backend API và cơ sở dữ liệu đa doanh nghiệp.
- Đăng nhập, phân quyền theo vai trò/phạm vi và nhật ký kiểm toán bất biến.
- Lưu trữ tài liệu, phân quyền tệp và tích hợp một nguồn nghiệp vụ đầu tiên.
- Theo dõi dữ liệu thực, kiểm thử bảo mật và sao lưu.
