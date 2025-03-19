import { API_CONFIG } from './config';

/**
 * Class APIClient xử lý các request API
 */
class APIClient {
    /**
     * Phương thức GET
     * @param {string} endpoint - endpoint API
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<Object>} Kết quả API
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'GET',
            ...options
        });
    }

    /**
     * Phương thức POST
     * @param {string} endpoint - endpoint API
     * @param {Object} data - Dữ liệu gửi đi
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<Object>} Kết quả API
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    }

    /**
     * Phương thức PUT
     * @param {string} endpoint - endpoint API
     * @param {Object} data - Dữ liệu gửi đi
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<Object>} Kết quả API
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    }

    /**
     * Phương thức DELETE
     * @param {string} endpoint - endpoint API
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<Object>} Kết quả API
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * Phương thức request chung
     * @param {string} endpoint - endpoint API
     * @param {Object} options - Tùy chọn request
     * @param {number} retryCount - Số lần thử lại (internal)
     * @returns {Promise<Object>} Kết quả API
     */
    async request(endpoint, options = {}, retryCount = 0) {
        // Tạo URL đầy đủ
        const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
        
        // Số lần retry tối đa
        const maxRetries = options.maxRetries || 3;
        
        // Log request để debug
        console.log(`[API REQUEST] ${options.method || 'GET'} ${url} - Lần thử ${retryCount + 1}/${maxRetries + 1}`);
        
        // Tạo controller để hỗ trợ timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_CONFIG.TIMEOUT);

        try {
            // Chuẩn bị headers
            const headers = {
                ...API_CONFIG.headers,
                ...options.headers
            };

            // Chuẩn bị options
            const requestOptions = {
                ...options,
                headers,
                signal: controller.signal
            };

            // Thực hiện request
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);

            // Log response status để debug
            console.log(`[API RESPONSE] Status: ${response.status} - ${url}`);

            // Xử lý response
            const data = await response.json();

            if (!response.ok) {
                // Xử lý lỗi API
                const error = {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                };
                console.log(`[API ERROR] Server response error: ${JSON.stringify(error)}`);
                
                // Nếu lỗi server (5xx), thử lại request
                if (response.status >= 500 && retryCount < maxRetries) {
                    console.log(`[API RETRY] Thử lại lần ${retryCount + 1} sau 1 giây...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.request(endpoint, options, retryCount + 1);
                }
                
                throw error;
            }

            // Log thành công
            console.log(`[API SUCCESS] ${url}`);
            return data;
        } catch (error) {
            // Xử lý lỗi request
            clearTimeout(timeoutId);
            
            // Log chi tiết lỗi
            console.error(`[API ERROR] ${url}: ${error.message || error}`);

            // Thử lại nếu là lỗi mạng và chưa vượt quá số lần retry
            const isNetworkError = error.message && (
                error.message.includes('Network request failed') || 
                error.message.includes('network error') ||
                error.name === 'AbortError'
            );
            
            if (isNetworkError && retryCount < maxRetries) {
                console.log(`[API RETRY] Thử lại lần ${retryCount + 1} sau 1.5 giây do lỗi mạng...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                return this.request(endpoint, options, retryCount + 1);
            }
            
            // Phân loại lỗi chi tiết để dễ xử lý
            if (error.name === 'AbortError') {
                throw new Error('Yêu cầu API đã hết thời gian chờ');
            } else if (error.message && error.message.includes('Network request failed')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và địa chỉ server.');
            }
            
            throw error;
        }
    }

    /**
     * Phương thức kiểm tra kết nối tới server
     * @returns {Promise<boolean>} Kết quả kiểm tra
     */
    async testConnection() {
        try {
            const url = `${API_CONFIG.BASE_URL}`;
            console.log(`[TEST CONNECTION] Kiểm tra kết nối tới: ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log(`[TEST CONNECTION] Kết quả: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.error(`[TEST CONNECTION] Lỗi: ${error.message}`);
            return false;
        }
    }
}

// Export một instance singleton
export default new APIClient(); 