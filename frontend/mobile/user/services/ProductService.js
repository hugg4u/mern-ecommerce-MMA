import { API_ENDPOINTS } from './config';
import APIClient from './APIClient';

/**
 * Service xử lý các API liên quan đến Product
 */
class ProductService {
    /**
     * Lấy danh sách tất cả sản phẩm
     * @returns {Promise<Object>} Kết quả với danh sách sản phẩm
     */
    async getAllProducts() {
        try {
            // Kiểm tra kết nối trước khi thực hiện request
            try {
                await this.checkConnection();
            } catch (connError) {
                console.log('Lỗi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request
            }
            
            const response = await APIClient.get(API_ENDPOINTS.PRODUCT.GET_ALL);
            
            if (response.data && response.data.products) {
                return {
                    code: response.data.code,
                    message: response.data.message,
                    data: response.data.products
                };
            }
            
            return {
                code: 500,
                message: "Lỗi định dạng dữ liệu",
                data: []
            };
        } catch (error) {
            console.error('Lỗi khi gọi API getAllProducts:', error);
            return {
                code: 500,
                message: error.message || "Lỗi kết nối server",
                data: []
            };
        }
    }

    /**
     * Lấy thông tin sản phẩm theo ID
     * @param {string} productId - ID của sản phẩm cần lấy
     * @returns {Promise<Object>} Kết quả với thông tin sản phẩm
     */
    async getProductById(productId) {
        try {
            // Kiểm tra kết nối trước khi thực hiện request
            try {
                await this.checkConnection();
            } catch (connError) {
                console.log('Lỗi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request
            }
            
            const response = await APIClient.post(API_ENDPOINTS.PRODUCT.GET_BY_ID, { pid: productId });
            
            if (response.data && response.data.product) {
                return {
                    code: response.data.code,
                    message: response.data.message,
                    data: response.data.product
                };
            }
            
            return {
                code: 404,
                message: "Không tìm thấy sản phẩm",
                data: null
            };
        } catch (error) {
            console.error('Lỗi khi gọi API getProductById:', error);
            return {
                code: 500,
                message: error.message || "Lỗi kết nối server",
                data: null
            };
        }
    }

    /**
     * Lấy danh sách danh mục sản phẩm
     * @returns {Promise<Object>} Kết quả với danh sách danh mục
     */
    async getCategories() {
        try {
            // Kiểm tra kết nối trước khi thực hiện request
            try {
                await this.checkConnection();
            } catch (connError) {
                console.log('Lỗi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request
            }
            
            const response = await APIClient.get(API_ENDPOINTS.PRODUCT.GET_CATEGORIES);
            
            if (response.data && response.data.categories) {
                return {
                    code: response.data.code,
                    message: response.data.message,
                    data: response.data.categories
                };
            }
            
            return {
                code: 500,
                message: "Lỗi định dạng dữ liệu",
                data: []
            };
        } catch (error) {
            console.error('Lỗi khi gọi API getCategories:', error);
            return {
                code: 500,
                message: error.message || "Lỗi kết nối server",
                data: []
            };
        }
    }

    /**
     * Kiểm tra kết nối tới server
     * @private
     * @returns {Promise<boolean>} Kết quả kiểm tra kết nối
     */
    async checkConnection() {
        try {
            const isConnected = await APIClient.testConnection();
            if (!isConnected) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            }
            return true;
        } catch (error) {
            console.error('Lỗi kiểm tra kết nối:', error);
            throw error;
        }
    }
    
    /**
     * Lấy danh mục mặc định (khi không có kết nối)
     * @returns {Array} Danh sách danh mục mặc định
     */
    getDefaultCategories() {
        return [
            { 
                id: 'gaming', 
                type: 'Gaming',
                imageUrl: require('../assets/images/gaming.jpg')
            },
            { 
                id: 'mobile', 
                type: 'Mobile',
                imageUrl: require('../assets/images/mobile.jpg')
            },
            { 
                id: 'toys', 
                type: 'Toys',
                imageUrl: require('../assets/images/toys.jpg')
            },
            { 
                id: 'utensils', 
                type: 'Utensils',
                imageUrl: require('../assets/images/kitchen.jpg')
            },
            { 
                id: 'books', 
                type: 'Books',
                imageUrl: require('../assets/images/books.jpg')
            },
            { 
                id: 'sports', 
                type: 'Sports',
                imageUrl: require('../assets/images/sport.jpg')
            }
        ];
    }
}

// Export một instance singleton
export default new ProductService(); 