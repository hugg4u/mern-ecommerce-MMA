import axios from "axios";
import BaseService from "../Base/BaseService";

class BannerService {
    constructor() {
        BaseService.getBaseURL()
        this.GET_BANNERS = "banner/get-banners";
        this.GET_BANNER = "banner/get-banner";
        this.ADD_BANNER = "banner/add-banner";
        this.UPDATE_BANNER = "banner/update-banner";
        this.DELETE_BANNER = "banner/delete-banner";
        this.UPLOAD_BANNER_IMAGE = "banner/upload-banner-image";
    }

    getAllBanners() {
        return axios.get(this.GET_BANNERS, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data && response.data.data.banners) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message,
                        data: response.data.data.banners
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu",
                    data: []
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi getAllBanners:', error.response?.data || error.message);
                throw error;
            });
    }

    getBannerById(bannerId) {
        return axios.post(this.GET_BANNER, { bid: bannerId }, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data && response.data.data.banner) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message,
                        data: response.data.data.banner
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu",
                    data: null
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi getBannerById:', error.response?.data || error.message);
                throw error;
            });
    }

    createBanner(bannerData) {
        return axios.post(this.ADD_BANNER, bannerData, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message,
                        data: response.data.data.banner
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu",
                    data: null
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi createBanner:', error.response?.data || error.message);
                throw error;
            });
    }

    updateBanner(bannerId, bannerData) {
        const data = {
            bid: bannerId,
            ...bannerData
        };
        return axios.post(this.UPDATE_BANNER, data, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message,
                        data: response.data.data.banner
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu",
                    data: null
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi updateBanner:', error.response?.data || error.message);
                throw error;
            });
    }

    deleteBanner(bannerId) {
        return axios.post(this.DELETE_BANNER, { bid: bannerId }, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu"
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi deleteBanner:', error.response?.data || error.message);
                throw error;
            });
    }

    uploadBannerImage(image, bannerId = null) {
        // Gửi dữ liệu dưới dạng JSON
        const data = {
            image: image,
            bid: bannerId
        }
        return axios.post(this.UPLOAD_BANNER_IMAGE, data, BaseService.getHeader())
            .then(response => {
                if (response.data && response.data.data) {
                    return {
                        code: response.data.data.code,
                        message: response.data.data.message,
                        data: response.data.data.banner || { imageUrl: response.data.data.imageUrl }
                    };
                }
                return {
                    code: 500,
                    message: "Lỗi định dạng dữ liệu",
                    data: null
                };
            })
            .catch(error => {
                console.error('Lỗi khi gọi uploadBannerImage:', error.response?.data || error.message);
                throw error;
            });
    }
}

export default new BannerService(); 