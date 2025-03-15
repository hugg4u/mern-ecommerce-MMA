import axios from 'axios';
import BaseService from './Base/BaseService';

class UploadService {
    constructor() {
        this.API_URL = BaseService.getBaseURL();
        this.UPLOAD_ENDPOINT = 'upload';
    }

    /**
     * Upload ảnh lên server
     * @param {string} folder - Thư mục lưu trữ (products, banners, users, etc.)
     * @param {FormData} formData - FormData chứa file ảnh
     * @returns {Promise} - Promise chứa kết quả upload
     */
    async uploadImageToServer(folder, formData) {
        try {
            // Đảm bảo formData chứa thông tin folder
            if (folder && !formData.has('folder')) {
                formData.append('folder', folder);
            }

            const response = await axios.post(
                `${this.API_URL}${this.UPLOAD_ENDPOINT}`,
                formData,
                {
                    headers: {
                        ...BaseService.getHeader().headers,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data && response.data.data) {
                return {
                    code: response.data.data.code,
                    message: response.data.data.message,
                    data: response.data.data
                };
            }

            return {
                code: 500,
                message: 'Lỗi định dạng dữ liệu',
                data: null
            };
        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error.response?.data || error.message);
            
            return {
                code: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi upload ảnh',
                data: null
            };
        }
    }

    /**
     * Chuyển đổi file thành base64
     * @param {File} file - File cần chuyển đổi
     * @returns {Promise<string>} - Promise chứa chuỗi base64
     */
    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

export default new UploadService(); 