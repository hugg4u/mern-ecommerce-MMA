# Tài liệu hệ thống xác thực HelaShop Mobile

## Tính năng đã thực hiện

1. **Hiển thị avatar/biểu tượng đăng nhập**
   - Hiển thị avatar nếu người dùng đã đăng nhập
   - Hiển thị biểu tượng đăng nhập nếu chưa đăng nhập
   - Nhấn vào để điều hướng đến màn hình Profile hoặc Đăng nhập

2. **Dịch vụ xác thực (AuthService)**
   - Đăng nhập và lưu trữ token
   - Đăng ký tài khoản mới
   - Đăng xuất và xóa token
   - Khôi phục mật khẩu
   - Quản lý phiên đăng nhập với AsyncStorage

3. **Màn hình xác thực**
   - Màn hình đăng nhập: Cho phép người dùng đăng nhập vào hệ thống
   - Màn hình đăng ký: Cho phép tạo tài khoản mới
   - Màn hình quên mật khẩu: Cho phép yêu cầu đặt lại mật khẩu

## Cách sử dụng

### Kiểm tra trạng thái đăng nhập

```javascript
import AuthService from '../services/AuthService';

// Kiểm tra người dùng đã đăng nhập hay chưa
const checkLoginStatus = async () => {
    const isLoggedIn = await AuthService.isLoggedIn();
    if (isLoggedIn) {
        // Người dùng đã đăng nhập
    } else {
        // Người dùng chưa đăng nhập
    }
};
```

### Đăng nhập

```javascript
import AuthService from '../services/AuthService';

const handleLogin = async (email, password) => {
    try {
        const response = await AuthService.login({ email, password });
        // Xử lý đăng nhập thành công
    } catch (error) {
        // Xử lý lỗi
    }
};
```

### Đăng xuất

```javascript
import AuthService from '../services/AuthService';

const handleLogout = async () => {
    const success = await AuthService.logout();
    if (success) {
        // Xử lý đăng xuất thành công
    }
};
```

## Cấu trúc thư mục

- `services/AuthService.js`: Dịch vụ quản lý xác thực
- `navigation/AuthStack/AuthStack.jsx`: Stack điều hướng cho các màn hình xác thực
- `screens/Auth/Login.jsx`: Màn hình đăng nhập
- `screens/Auth/Register.jsx`: Màn hình đăng ký
- `screens/Auth/ForgotPassword.jsx`: Màn hình quên mật khẩu
- `components/MainHeader/MainHeader.jsx`: Header chính có chứa avatar/biểu tượng đăng nhập 