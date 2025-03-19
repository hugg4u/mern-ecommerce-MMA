/**
 * Cấu hình URL API dựa trên môi trường
 */

// Cấu hình môi trường
// development: Phát triển local
// staging: Môi trường kiểm thử
// production: Môi trường production
const ENV = 'development';

// URL API theo môi trường
const API_URLS = {
    // Trong môi trường mobile, localhost sẽ trỏ đến chính thiết bị di động
    // 10.0.2.2 là địa chỉ đặc biệt trỏ đến máy host từ Android Emulator
    // Nếu chạy trên thiết bị thật, hãy dùng địa chỉ IP của máy chạy server
    development: 'http://10.0.2.2:9999/api/v1',
    // Hoặc sử dụng IP thực của máy chạy server
    // development: 'http://192.168.1.x:3000/api/v1', // Thay x bằng số thực
    staging: 'https://staging-api.helashop.com/api/v1',
    production: 'https://api.helashop.com/api/v1'
};

// Thời gian timeout cho API (ms) - tăng lên để tránh timeout quá sớm
const API_TIMEOUT = 60000; // 60 giây

// Cấu hình API
export const API_CONFIG = {
    BASE_URL: API_URLS[ENV],
    TIMEOUT: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Các endpoint API
export const API_ENDPOINTS = {
    // Banner
    BANNER: {
        GET_ALL: 'banner/get-banners',
        GET_BY_ID: 'banner/get-banner',
    },
    
    // Thêm các endpoint khác ở đây
};

export default {
    API_CONFIG,
    API_ENDPOINTS
}; 