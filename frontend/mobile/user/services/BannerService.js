import { API_ENDPOINTS } from './config';
import APIClient from './APIClient';

/**
 * Service xử lý các API liên quan đến Banner
 */
class BannerService {
    /**
     * Lấy danh sách tất cả banner
     * @returns {Promise<Object>} Kết quả với danh sách banner
     */
    async getAllBanners() {
        try {
            // Kiểm tra kết nối trước khi thực hiện request
            let isConnected = false;
            try {
                isConnected = await this.checkConnection();
            } catch (connError) {
                console.log('Lỗi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request dù lỗi kết nối, để retry logic trong APIClient có thể hoạt động
            }
            
            const response = await APIClient.get(API_ENDPOINTS.BANNER.GET_ALL);
            
            if (response.data && response.data.banners) {
                return {
                    code: response.data.code,
                    message: response.data.message,
                    data: response.data.banners
                };
            }
            
            return {
                code: 500,
                message: "Lỗi định dạng dữ liệu",
                data: []
            };
        } catch (error) {
            console.error('Lỗi khi gọi API getBanners:', error);
            return {
                code: 500,
                message: error.message || "Lỗi kết nối server",
                data: []
            };
        }
    }

    /**
     * Lấy banner theo ID
     * @param {string} bannerId - ID của banner cần lấy
     * @returns {Promise<Object>} Kết quả với thông tin banner
     */
    async getBannerById(bannerId) {
        try {
            // Kiểm tra kết nối trước khi thực hiện request
            try {
                await this.checkConnection();
            } catch (connError) {
                console.log('Lỗi kiểm tra kết nối:', connError.message);
                // Tiếp tục thực hiện request
            }
            
            const response = await APIClient.post(API_ENDPOINTS.BANNER.GET_BY_ID, { bid: bannerId });
            
            if (response.data && response.data.banner) {
                return {
                    code: response.data.code,
                    message: response.data.message,
                    data: response.data.banner
                };
            }
            
            return {
                code: 404,
                message: "Không tìm thấy banner",
                data: null
            };
        } catch (error) {
            console.error('Lỗi khi gọi API getBannerById:', error);
            return {
                code: 500,
                message: error.message || "Lỗi kết nối server",
                data: null
            };
        }
    }

    /**
     * Lấy danh sách banner đang active, đã sắp xếp theo thứ tự
     * @returns {Promise<Object>} Kết quả với danh sách banner đã sắp xếp
     */
    async getActiveBanners() {
        try {
            const result = await this.getAllBanners();
            
            if (result.code === 200 && Array.isArray(result.data)) {
                // Kiểm tra dữ liệu hợp lệ trước khi xử lý
                const validBanners = result.data.filter(banner => 
                    banner && typeof banner === 'object' && 
                    banner.hasOwnProperty('imageUrl') && 
                    banner.hasOwnProperty('isActive')
                );
                
                // Lọc các banner đang active và sắp xếp theo thứ tự
                const activeBanners = validBanners
                    .filter(banner => banner.isActive === true && banner.deleted !== true)
                    .sort((a, b) => a.order - b.order);
                
                return {
                    code: 200,
                    message: "Lấy danh sách banner thành công",
                    data: activeBanners
                };
            }
            
            return result;
        } catch (error) {
            console.error('Lỗi khi xử lý getActiveBanners:', error);
            return {
                code: 500,
                message: error.message || "Lỗi xử lý dữ liệu",
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
     * Lấy banner mặc định (khi không có kết nối)
     * @returns {Array} Danh sách banner mặc định
     */
    getDefaultBanners() {
        return [
            { 
                bid: 'default1', 
                imageUrl: require('../assets/images/banner05.jpg'),
                title: 'Banner mặc định 1',
                isActive: true,
                order: 1
            },
            { 
                bid: 'default2', 
                imageUrl: require('../assets/images/banner04.jpg'),
                title: 'Banner mặc định 2',
                isActive: true,
                order: 2
            },
            { 
                bid: 'default3', 
                imageUrl: require('../assets/images/banner06.jpg'),
                title: 'Banner mặc định 3',
                isActive: true, 
                order: 3
            },
            { 
                bid: 'default4', 
                imageUrl: require('../assets/images/banner07.jpg'),
                title: 'Banner mặc định 4',
                isActive: true,
                order: 4
            }
        ];
    }
}

// Export một instance singleton
export default new BannerService(); 