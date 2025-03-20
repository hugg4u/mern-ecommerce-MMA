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
            try {
                await this.checkConnection();
            } catch (connError) {
                console.log('Cảnh báo khi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request mặc dù có lỗi kết nối
            }
            
            console.log('Đang gọi API lấy danh sách sản phẩm...');
            
            // Thử cách 1: sử dụng fetch API
            try {
                const response = await fetch(`${API_ENDPOINTS.BASE_URL}/product/all`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Fetch API - Nhận được dữ liệu:', data ? 'có dữ liệu' : 'không có dữ liệu');
                
                // Đảm bảo trả về cấu trúc dữ liệu phù hợp
                return {
                    success: true,
                    code: 200,
                    message: 'Lấy danh sách sản phẩm thành công',
                    data: data.products || data // Tùy theo cấu trúc API trả về
                };
            } catch (fetchError) {
                console.error('Lỗi khi sử dụng fetch:', fetchError);
                
                // Nếu fetch thất bại, thử dùng APIClient
                try {
                    console.log('Thử lại với APIClient...');
                    const apiResponse = await APIClient.get(API_ENDPOINTS.PRODUCT.GET_ALL);
                    
                    console.log('APIClient - Nhận được dữ liệu:', apiResponse ? 'có dữ liệu' : 'không có dữ liệu');
                    
                    if (apiResponse.data && apiResponse.data.products) {
                        return {
                            success: true,
                            code: apiResponse.data.code || 200,
                            message: apiResponse.data.message || 'Lấy danh sách sản phẩm thành công',
                            data: apiResponse.data.products
                        };
                    }
                    
                    return {
                        success: true,
                        code: 200,
                        message: 'Lấy danh sách sản phẩm thành công',
                        data: apiResponse.data || []
                    };
                } catch (apiError) {
                    console.error('Lỗi khi sử dụng APIClient:', apiError);
                    throw apiError; // Ném lỗi để xử lý ở catch bên ngoài
                }
            }
        } catch (error) {
            console.error('Lỗi chung khi lấy danh sách sản phẩm:', error);
            
            // Trả về thông báo lỗi
            return {
                success: false,
                code: error.message.includes('connection') ? 503 : 500,
                message: 'Không thể lấy danh sách sản phẩm',
                error: error.message,
                // Trả về dữ liệu mẫu nếu cần
                data: this.getDefaultProducts()
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
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ping`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000, // Timeout 5 giây
            });

            if (!response.ok) {
                throw new Error('Không thể kết nối đến máy chủ');
            }

            return true;
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            throw new Error('Lỗi kết nối đến máy chủ: ' + error.message);
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

    // Thêm phương thức trả về sản phẩm mẫu khi có lỗi
    getDefaultProducts() {
        return [
            {
                pid: "sample1",
                name: "Điện thoại mẫu",
                imgUrl: "https://via.placeholder.com/300x300?text=Sample+Phone",
                price: 299,
                color: "blue",
                discount: 10,
                description: "Đây là sản phẩm mẫu khi không kết nối được với máy chủ. Thông tin sản phẩm sẽ được cập nhật khi có kết nối internet.",
                stock: "in stock",
                pieces: 10,
                category: "Mobile",
                review: []
            },
            {
                pid: "sample2",
                name: "Laptop mẫu",
                imgUrl: "https://via.placeholder.com/300x300?text=Sample+Laptop",
                price: 899,
                color: "silver",
                discount: 5,
                description: "Đây là sản phẩm mẫu khi không kết nối được với máy chủ. Thông tin sản phẩm sẽ được cập nhật khi có kết nối internet.",
                stock: "in stock",
                pieces: 5,
                category: "Gaming",
                review: []
            }
        ];
    }
}

// Export một instance singleton
export default new ProductService(); 