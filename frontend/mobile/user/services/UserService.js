import { fetchWithAuth } from '../utils/apiHelper';
import { API_CONFIG } from './config';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UserService {
    constructor() {
        this.API_URL = API_CONFIG.BASE_URL;
        this.GET_USER_PROFILE = `${this.API_URL}/api/user`;
        this.UPDATE_USER_PROFILE = `${this.API_URL}/api/user/update-user`;
        this.UPDATE_PASSWORD = `${this.API_URL}/api/user/update-password`;
        this.UPDATE_USER_PIC = `${this.API_URL}/api/user/pic-update`;
        this.MANIPULATE_ADDRESS = `${this.API_URL}/api/user/manipulate-user-address`;
        
        // Chuyển sang sử dụng API thực tế
        this.useMockData = false;
    }

    async getUserProfile() {
        try {
            // Lấy thông tin người dùng từ AsyncStorage
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            const userData = JSON.parse(userJson);
            const email = userData.email;
            
            // Gọi API backend để lấy thông tin chi tiết
            const response = await fetchWithAuth.post(this.GET_USER_PROFILE, { email });
            
            if (response.success) {
                const user = response.data.user;
                return {
                    name: user.name,
                    email: user.email,
                    phone: user.telephone?.toString() || '',
                    gender: user.gender || '',
                    age: user.age?.toString() || '',
                    address: user.address ? `${user.address.street || ''}, ${user.address.district || ''}, ${user.address.province || ''}` : '',
                    addressObj: user.address || {},
                    avatar: user.photoUrl || null,
                };
            } else {
                throw new Error(response.message || 'Không thể lấy thông tin người dùng');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error.message);
            throw error;
        }
    }

    async updateUserProfile(userData) {
        try {
            // Xử lý dữ liệu để phù hợp với API backend
            const payload = {
                name: userData.name,
                email: userData.email,
                telephone: userData.phone ? parseInt(userData.phone) : undefined,
                gender: userData.gender,
                age: userData.age ? parseInt(userData.age) : undefined,
            };
            
            const response = await fetchWithAuth.put(this.UPDATE_USER_PROFILE, payload);
            
            if (response.success) {
                // Cập nhật thông tin trong AsyncStorage
                const userJson = await AsyncStorage.getItem('user');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    user.name = userData.name;
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                }
                
                return response;
            } else {
                throw new Error(response.message || 'Không thể cập nhật thông tin người dùng');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error.message);
            throw error;
        }
    }

    async updatePassword(passwordData) {
        try {
            // Lấy email từ AsyncStorage
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            const userData = JSON.parse(userJson);
            const email = userData.email;
            
            const payload = {
                email,
                password: passwordData.newPassword
            };
            
            const response = await fetchWithAuth.put(this.UPDATE_PASSWORD, payload);
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Không thể cập nhật mật khẩu');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật mật khẩu:', error.message);
            throw error;
        }
    }

    async updateAddress(addressData) {
        try {
            // Lấy email từ AsyncStorage
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            const userData = JSON.parse(userJson);
            const email = userData.email;
            
            const payload = {
                email,
                address: {
                    district: addressData.district,
                    province: addressData.province,
                    city: addressData.city,
                    street: addressData.street,
                    postalCode: addressData.postalCode
                }
            };
            
            const response = await fetchWithAuth.put(this.MANIPULATE_ADDRESS, payload);
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Không thể cập nhật địa chỉ');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật địa chỉ:', error.message);
            throw error;
        }
    }

    async updateAvatar(photoUrl) {
        try {
            // Lấy email từ AsyncStorage
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            const userData = JSON.parse(userJson);
            const email = userData.email;
            
            const payload = {
                email,
                photoUrl
            };
            
            const response = await fetchWithAuth.put(this.UPDATE_USER_PIC, payload);
            
            if (response.success) {
                // Cập nhật thông tin trong AsyncStorage
                if (userJson) {
                    const user = JSON.parse(userJson);
                    user.photoUrl = photoUrl;
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                }
                
                return {
                    success: true,
                    message: 'Cập nhật ảnh đại diện thành công',
                    avatarUrl: photoUrl
                };
            } else {
                throw new Error(response.message || 'Không thể cập nhật ảnh đại diện');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật ảnh đại diện:', error.message);
            throw error;
        }
    }
}

export default new UserService(); 