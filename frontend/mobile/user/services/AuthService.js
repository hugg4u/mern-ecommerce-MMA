import AsyncStorage from '@react-native-async-storage/async-storage';
import APIClient from './APIClient';
import { API_CONFIG } from './config';

// Các key để lưu trữ trong AsyncStorage
const AUTH_TOKEN_KEY = '@auth_token';
const USER_INFO_KEY = '@user_info';

// Hàm kiểm tra AsyncStorage
const testAsyncStorage = async () => {
    try {
        const testKey = '@test_async_storage';
        const testValue = 'test_value_' + new Date().getTime();
        
        // Thử lưu giá trị
        await AsyncStorage.setItem(testKey, testValue);
        console.log('AsyncStorage set test passed');
        
        // Thử đọc giá trị
        const retrievedValue = await AsyncStorage.getItem(testKey);
        const testPassed = retrievedValue === testValue;
        console.log('AsyncStorage get test:', testPassed ? 'Passed' : 'Failed');
        console.log('Expected:', testValue);
        console.log('Got:', retrievedValue);
        
        // Dọn dẹp
        await AsyncStorage.removeItem(testKey);
        
        return testPassed;
    } catch (error) {
        console.error('Test AsyncStorage failed:', error);
        return false;
    }
};

// Kiểm tra AsyncStorage khi khởi động
testAsyncStorage().then(result => {
    console.log('AsyncStorage functionality:', result ? 'OK' : 'NOT WORKING');
});

class AuthService {
    constructor() {
        this.API_URL = API_CONFIG.BASE_URL;
        this.LOGIN_ENDPOINT = 'auth/login';
        this.REGISTER_ENDPOINT = 'auth/mobileRegister';
        this.RESET_PASSWORD_ENDPOINT = 'auth/reset-password';
        
        // Các endpoint khác liên quan đến xác thực
    }

    /**
     * Đăng nhập người dùng
     * @param {Object} credentials - Thông tin đăng nhập (email, password)
     * @returns {Promise} Kết quả đăng nhập
     */
    async login(credentials) {
        try {
            console.log('Gửi request đăng nhập với:', { email: credentials.email, role: credentials.role });
            const response = await APIClient.post(this.LOGIN_ENDPOINT, credentials);
            console.log('Phản hồi đăng nhập raw:', JSON.stringify(response));
            
            // Kiểm tra cấu trúc phản hồi API
            let token = null;
            let userData = null;
            
            // Phân tích phản hồi theo cấu trúc API Backend
            // Backend trả về: { code, status, data: { token, ...loginSuccessful } }
            if (response.data && response.data.token) {
                // Trường hợp data trực tiếp chứa token
                token = response.data.token;
            } else if (response.code && response.data && response.data.token) {
                // Trường hợp response có cấu trúc theo response.js: { code, status, data }
                token = response.data.token;
            } else if (response.token) {
                // Trường hợp đơn giản: { token: "..." }
                token = response.token;
            }
            
            // Lưu token nếu có
            if (token) {
                console.log('Lưu token:', token.substring(0, 10) + '...');
                await this.setAuthToken(token);
                
                // Kiểm tra token đã lưu thành công
                const savedToken = await this.getAuthToken();
                console.log('Token đã lưu:', savedToken ? savedToken.substring(0, 10) + '...' : 'Thất bại');
                
                return { success: true, token, userData };
            } else {
                console.warn('Không tìm thấy token trong phản hồi đăng nhập!');
                return { success: false, error: 'No token in response' };
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error;
        }
    }

    /**
     * Đăng ký người dùng mới
     * @param {Object} userData - Thông tin người dùng đăng ký
     * @returns {Promise} Kết quả đăng ký
     */
    async register(userData) {
        try {
            const response = await APIClient.post(this.REGISTER_ENDPOINT, userData);
            return response;
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            throw error;
        }
    }

    /**
     * Đăng xuất người dùng
     * @returns {Promise<boolean>} Kết quả đăng xuất
     */
    async logout() {
        try {
            // Xóa token và thông tin người dùng khỏi AsyncStorage
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_INFO_KEY]);
            return true;
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            return false;
        }
    }

    /**
     * Yêu cầu đặt lại mật khẩu
     * @param {Object} data - Dữ liệu yêu cầu (email)
     * @returns {Promise} Kết quả yêu cầu
     */
    async resetPassword(data) {
        try {
            const response = await APIClient.post(this.RESET_PASSWORD_ENDPOINT, data);
            return response;
        } catch (error) {
            console.error('Lỗi reset password:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra người dùng đã đăng nhập hay chưa
     * @returns {Promise<boolean>} Trạng thái đăng nhập
     */
    async isLoggedIn() {
        try {
            console.log('Đang kiểm tra trạng thái đăng nhập...');
            const token = await this.getAuthToken();
            console.log('Token từ AsyncStorage:', token ? 'Có' : 'Không có');
            
            // Nếu không có token, rõ ràng là chưa đăng nhập
            if (!token) {
                console.log('Không có token -> Chưa đăng nhập');
                return false;
            }
            
            // Kiểm tra format token cơ bản để tránh trường hợp lưu chuỗi rỗng hoặc null
            if (typeof token !== 'string' || token.trim() === '') {
                console.log('Token không hợp lệ -> Chưa đăng nhập');
                return false;
            }
            
            // Để kiểm tra token hợp lệ, có thể thêm các bước khác như:
            // 1. Parse JWT để kiểm tra hết hạn
            // 2. Gọi API để validate token
            
            console.log('Có token hợp lệ -> Đã đăng nhập');
            return true;
        } catch (error) {
            console.error('Lỗi kiểm tra đăng nhập:', error);
            return false;
        }
    }

    /**
     * Lấy token xác thực
     * @returns {Promise<string|null>} Token xác thực
     */
    async getAuthToken() {
        try {
            return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        } catch (error) {
            console.error('Lỗi lấy token:', error);
            return null;
        }
    }

    /**
     * Lưu token xác thực
     * @param {string} token - Token cần lưu
     * @returns {Promise<boolean>} Kết quả lưu
     */
    async setAuthToken(token) {
        try {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
            return true;
        } catch (error) {
            console.error('Lỗi lưu token:', error);
            return false;
        }
    }

    /**
     * Lấy thông tin người dùng
     * @returns {Promise<Object|null>} Thông tin người dùng
     */
    async getUserInfo() {
        try {
            const userInfoString = await AsyncStorage.getItem(USER_INFO_KEY);
            return userInfoString ? JSON.parse(userInfoString) : null;
        } catch (error) {
            console.error('Lỗi lấy thông tin người dùng:', error);
            return null;
        }
    }

    /**
     * Lưu thông tin người dùng
     * @param {Object} userInfo - Thông tin người dùng
     * @returns {Promise<boolean>} Kết quả lưu
     */
    async setUserInfo(userInfo) {
        try {
            await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
            return true;
        } catch (error) {
            console.error('Lỗi lưu thông tin người dùng:', error);
            return false;
        }
    }
}

export default new AuthService(); 