import { fetchWithAuth } from '../utils/apiHelper';
import { API_CONFIG } from './config';

// Mock data cho phát triển
const MOCK_USER_DATA = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    address: 'Hà Nội, Việt Nam',
    avatar: 'https://i.pravatar.cc/300'
};

class UserService {
    constructor() {
        this.API_URL = API_CONFIG.BASE_URL;
        this.GET_USER_PROFILE = `${this.API_URL}/user/get-user`;
        this.UPDATE_USER_PROFILE = `${this.API_URL}/user/update-user`;
        this.UPDATE_PASSWORD = `${this.API_URL}/user/update-password`;
        this.UPLOAD_AVATAR = `${this.API_URL}/user/upload-avatar`;
        
        // Flag để sử dụng mock data khi đang phát triển
        this.useMockData = true;
    }

    async getUserProfile() {
        try {
            // Sử dụng mock data khi đang phát triển
            if (this.useMockData) {
                console.log('Sử dụng mock data cho getUserProfile');
                return MOCK_USER_DATA;
            }
            
            const response = await fetchWithAuth.get(this.GET_USER_PROFILE);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error.message);
            if (this.useMockData) {
                console.log('Lỗi API, trả về mock data');
                return MOCK_USER_DATA;
            }
            throw error;
        }
    }

    async updateUserProfile(userData) {
        try {
            if (this.useMockData) {
                console.log('Sử dụng mock data cho updateUserProfile', userData);
                return { success: true, message: 'Cập nhật thành công', data: userData };
            }
            
            const response = await fetchWithAuth.post(this.UPDATE_USER_PROFILE, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(passwordData) {
        try {
            if (this.useMockData) {
                console.log('Sử dụng mock data cho updatePassword');
                return { success: true, message: 'Đổi mật khẩu thành công' };
            }
            
            const response = await fetchWithAuth.post(this.UPDATE_PASSWORD, passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async uploadAvatar(imageData) {
        try {
            if (this.useMockData) {
                console.log('Sử dụng mock data cho uploadAvatar');
                return { 
                    success: true, 
                    message: 'Upload ảnh thành công', 
                    avatarUrl: 'https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 70) 
                };
            }
            
            const formData = new FormData();
            formData.append('avatar', imageData);
            const response = await fetchWithAuth.post(this.UPLOAD_AVATAR, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new UserService(); 