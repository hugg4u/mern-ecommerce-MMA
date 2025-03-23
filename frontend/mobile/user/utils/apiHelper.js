import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../services/config';

// Hàm fetch với token authentication
export const fetchWithAuth = async (url, options = {}) => {
  try {
    // Lấy token từ AsyncStorage
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    // Thêm header Authorization
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
    
    // Thiết lập timeout cho request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 30000);
    
    // Log request để debug
    console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`);
    
    // Thực hiện request
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    // Xóa timeout khi đã nhận được response
    clearTimeout(timeoutId);
    
    // Lấy dữ liệu response
    const responseText = await response.text();
    
    // Parse JSON nếu có thể
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Response không phải JSON:', responseText.substring(0, 150) + '...');
      data = { message: responseText };
    }
    
    // Log response để debug
    console.log(`[API RESPONSE] Status: ${response.status} - ${url}`);
    
    // Kiểm tra response
    if (response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.log('API trả về lỗi xác thực (401):', data.message || 'Token không hợp lệ');
      throw new Error('Phiên đăng nhập hết hạn');
    }
    
    if (!response.ok) {
      console.log(`API trả về lỗi (${response.status}):`, data.message || 'Không có thông báo lỗi');
      throw new Error(data.message || `Lỗi HTTP ${response.status}`);
    }
    
    console.log(`[API SUCCESS] ${url}`);
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`API timeout: ${url}`);
      throw new Error('Yêu cầu bị hủy do vượt quá thời gian chờ');
    }
    
    console.error('API request error:', error.message);
    throw error;
  }
}; 