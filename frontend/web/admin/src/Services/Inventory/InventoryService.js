import axios from "axios";
import BaseService from "../Base/BaseService";

class InventoryService {
    constructor() {
        BaseService.getBaseURL()
        this.GET_PRODUCTS = "product/get-products";
        this.GET_PRODUCT_BY_ID = "product/get-product";
        this.CREATE_PRODUCT = "product/create-product";
        this.UPDATE_PRODUCT = "product/update-product";
        this.DELETE_PRODUCT = "product/delete-product";
        this.UPLOAD_IMAGE = "product/upload-image";
    }

    getProducts() {
        return axios.get(this.GET_PRODUCTS, BaseService.getHeader())
            .then(response => {
                console.log('Dữ liệu nhận được từ getProducts:', response.data.data.products);
                return response;
            });
    }

    getProductById(productId) {
        console.log('Gửi request getProductById với pid:', productId);
        return axios.post(this.GET_PRODUCT_BY_ID, {pid: productId}, BaseService.getHeader())
            .then(response => {
                console.log('Kết quả từ getProductById:', response.data);
                return response;
            })
            .catch(error => {
                console.error('Lỗi khi gọi getProductById:', error.response?.data || error.message);
                throw error;
            });
    }

    addProduct(input) {
        const data = {
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            stock: input.stock,
            images: input.images || []
        }
        return axios.post(this.CREATE_PRODUCT, data, BaseService.getHeader())
    }

    updateProduct(input) {
        const data = {
            productId: input.productId,
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            stock: input.stock,
            images: input.images || []
        }
        return axios.post(this.UPDATE_PRODUCT, data, BaseService.getHeader())
    }

    deleteProduct(productId) {
        return axios.post(this.DELETE_PRODUCT, {productId}, BaseService.getHeader())
    }

    uploadProductImage(input) {
        // Lấy dữ liệu ảnh và productId (nếu có)
        const image = input.get('image');
        const productId = input.get('productId');
        
        // Gửi dữ liệu dưới dạng JSON
        return axios.post(this.UPLOAD_IMAGE, {
            image,
            productId: productId || null
        }, BaseService.getHeader());
    }

    uploadImageToMongo(productId, photoUrl) {
        console.log(`Cập nhật ảnh cho sản phẩm ${productId}: ${photoUrl}`);
        const data = {
            productId,
            photoUrl
        }
        return axios.post(this.UPLOAD_IMAGE, data, BaseService.getHeader());
    }
}

export default InventoryService = new InventoryService() 