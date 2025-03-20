import response from "../../Utils/Constants/Response.js";
import Product from "../../Model/Product.js";
import HttpStatus from "../../Utils/Constants/HttpType.js";
import ResTypes from "../../Utils/Constants/ResTypes.js";
import { uploadImage } from "../../Utils/Cloudinary/CloudinaryUploader.js";

class ProductController {
    //get all products
    getProducts = async (req, res) => {
        try {
            // Lấy sản phẩm từ DB
            const productsFromDB = await Product.find({ deleted: false });
            
            // Chuyển đổi định dạng để frontend có thể hiển thị
            const products = productsFromDB.map(product => {
                const productObj = product.toObject();
                // Thêm trường images để frontend có thể hiển thị ảnh
                productObj.images = productObj.imgUrl ? [productObj.imgUrl] : [];
                return productObj;
            });
            
            return response(res, 200, HttpStatus.getStatus(200), { 
                products,
                code: 200,
                message: "Lấy danh sách sản phẩm thành công" 
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    //get product
    getProduct = async (req, res) => {
        console.log('req.body', req.body);
        const { pid } = req.body;
        console.log('pid', pid);
        
        try {
            // Tìm sản phẩm theo ID
            const productFromDB = await Product.findOne({ pid });
            
            // Kiểm tra sản phẩm tồn tại
            if (!productFromDB) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy sản phẩm",
                    code: 404
                });
            }
            
            // Kiểm tra sản phẩm đã bị xóa chưa
            if (productFromDB.deleted === true) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Sản phẩm không tồn tại hoặc đã bị xóa",
                    code: 404
                });
            }
            
            // Chuyển đổi định dạng để frontend có thể hiển thị
            const product = productFromDB.toObject();
            // Thêm trường images để frontend có thể hiển thị ảnh
            product.images = product.imgUrl ? [product.imgUrl] : [];
            
            return response(res, 200, HttpStatus.getStatus(200), { 
                product,
                code: 200,
                message: "Lấy thông tin sản phẩm thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    //create prooduct
    addProduct = async (req, res) => {
        try {
            // Lấy dữ liệu từ frontend - đã được validate bởi Yup
            let { name, description, price, category, stock, images, discount, color, pieces } = req.body;
            
            // Log để debug
            console.log("Nhận request tạo sản phẩm:", { name, images });
            
            // Chuẩn bị dữ liệu theo cấu trúc model Product
            const productData = {
                name,
                description,
                price: Number(price),
                category,
                stock: Number(stock) > 0 ? 'in stock' : 'out of stock',
                imgUrl: images && images.length > 0 ? images[0] : 'https://via.placeholder.com/150',
                discount: discount || 0,
                color: color || 'default',
                pieces: pieces || Number(stock),
                deleted: false
            };
            
            console.log("URL ảnh được lưu:", productData.imgUrl);

            // Tạo sản phẩm mới
            const product = new Product(productData);
            const result = await product.save();
            
            if (result) {
                console.log("Đã tạo sản phẩm thành công, ID:", result.pid);
                return response(res, 201, HttpStatus.getStatus(201), { 
                    product, 
                    code: 200,  // Sử dụng code 200 để frontend nhận biết thành công
                    message: "Thêm sản phẩm thành công"
                });
            } else {
                return response(res, 403, HttpStatus.getStatus(403), ResTypes.errors.product_failed);
            }
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), { 
                error: error.message,
                code: 500
            });
        }
    }
    //add reviews
    addReviews = async(req, res) => {
        const {review,pid} = req.body;
        try {
            const productExist = await Product.findOne({pid})
            if (!productExist) return response(res, 404, HttpStatus.getStatus(404), ResTypes.errors.no_product)
            
            const result = await Product.updateOne(
                { pid },
                {$push:{review:review}}
            )
            if (result.modifiedCount === 0) return response(res, 403, HttpStatus.getStatus(403), ResTypes.errors.failed_operation)
            return response(res,201,HttpStatus.getStatus(201),ResTypes.successMessages.review_added)
        } catch (error) {
            return response(res, 500, HttpStatus.getStatus(500), error)
        }
    }
    //delete product
    deleteProduct = async (req, res) => {
        try {
            const { productId } = req.body;
            
            // Kiểm tra sản phẩm tồn tại
            const productExist = await Product.findOne({ pid: productId });
            if (!productExist) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy sản phẩm",
                    code: 404
                });
            }
            
            // Kiểm tra sản phẩm đã bị xóa chưa
            if (productExist.deleted === true) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Sản phẩm này đã bị xóa trước đó",
                    code: 200
                });
            }
            
            // Cập nhật trạng thái deleted
            const result = await Product.updateOne(
                { pid: productId },
                { $set: { deleted: true } }
            );
            
            if (result.modifiedCount === 0) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Không có thay đổi",
                    code: 200
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                message: "Xóa sản phẩm thành công",
                code: 200
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    //update product
    updateProduct = async (req, res) => {
        try {
            // Lấy dữ liệu từ frontend
            const { productId, name, description, price, category, stock, images } = req.body;
            
            // Kiểm tra sản phẩm tồn tại
            const productExist = await Product.findOne({ pid: productId });
            if (!productExist) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy sản phẩm",
                    code: 404
                });
            }
            
            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
                name,
                description,
                price: Number(price),
                category,
                stock: Number(stock) > 0 ? 'in stock' : 'out of stock',
                imgUrl: images && images.length > 0 ? images[0] : productExist.imgUrl,
                pieces: Number(stock),
                // Giữ nguyên các trường khác
                color: productExist.color,
                discount: productExist.discount
            };

            const result = await Product.updateOne(
                { pid: productId },
                { $set: updateData }
            );
            
            if (result.modifiedCount === 0) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Không có thay đổi",
                    code: 200
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                message: "Cập nhật sản phẩm thành công",
                code: 200
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    //upload product pic
    uploadProductImage = async (req, res) => {
        const { image, productId } = req.body;
        try {
            // Kiểm tra nếu không có ảnh
            if (!image) {
                return response(res, 400, HttpStatus.getStatus(400), { 
                    message: "Không có ảnh nào được cung cấp",
                    code: 400
                });
            }

            // Log thông tin để debug
            console.log("Đang upload ảnh lên Cloudinary...");
            
            // Upload ảnh lên Cloudinary
            const uploadResult = await uploadImage(image, 'HelaShop/products');
            
            // Kiểm tra kết quả upload
            if (!uploadResult || !uploadResult.secure_url) {
                console.error("Lỗi upload: Không nhận được secure_url", uploadResult);
                return response(res, 500, HttpStatus.getStatus(500), { 
                    message: "Không thể upload ảnh",
                    code: 500
                });
            }

            console.log("Upload thành công, URL:", uploadResult.secure_url);

            // Nếu có productId thì cập nhật URL ảnh cho sản phẩm
            if (productId) {
                console.log("Cập nhật ảnh cho sản phẩm ID:", productId);
                
                const productExist = await Product.findOne({ pid: productId });
                if (!productExist) {
                    return response(res, 404, HttpStatus.getStatus(404), {
                        message: "Không tìm thấy sản phẩm",
                        code: 404
                    });
                }

                const result = await Product.updateOne(
                    { pid: productId },
                    { $set: { imgUrl: uploadResult.secure_url } }
                );

                if (result.modifiedCount === 0) {
                    console.log("Không cập nhật được ảnh vào database");
                    return response(res, 200, HttpStatus.getStatus(200), {
                        message: "Không thể cập nhật ảnh cho sản phẩm",
                        code: 200,
                        data: {
                            url: uploadResult.secure_url,
                            public_id: uploadResult.public_id
                        }
                    });
                }
                
                console.log("Đã cập nhật ảnh cho sản phẩm trong DB");
            }

            // Trả về thông tin URL ảnh đã upload
            return response(res, 200, HttpStatus.getStatus(200), {
                message: "Upload ảnh thành công",
                code: 200,
                data: {
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id
                }
            });
        } catch (error) {
            console.error('Lỗi khi upload ảnh sản phẩm:', error);
            return response(res, 500, HttpStatus.getStatus(500), { 
                message: "Lỗi server khi upload ảnh", 
                error: error.message,
                code: 500
            });
        }
    }
    /**
     * Lấy danh sách tất cả các danh mục sản phẩm hiện có
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} Response với danh sách categories
     */
    getCategories = async (req, res) => {
        try {
            // Lấy tất cả các danh mục khác nhau từ các sản phẩm có trong database
            const categories = await Product.distinct('category', { deleted: false });
            
            // Lọc bỏ các giá trị null, undefined hoặc rỗng
            const validCategories = categories.filter(cat => cat && cat.trim() !== '');
            
            // Mảng chứa danh mục đã được format với hình ảnh tương ứng
            const formattedCategories = [];
            
            // Với mỗi danh mục, tìm sản phẩm đầu tiên thuộc danh mục đó để lấy hình ảnh
            for (const category of validCategories) {
                // Tìm sản phẩm đầu tiên thuộc danh mục và chưa bị xóa
                const product = await Product.findOne({ 
                    category, 
                    deleted: false,
                    imgUrl: { $ne: null, $ne: '' } // Đảm bảo có hình ảnh
                }).sort('created_at');
                
                // Dữ liệu mặc định cho trường hợp không tìm thấy sản phẩm nào thuộc danh mục
                let imageUrl = 'https://res.cloudinary.com/dfgxkw3bn/image/upload/v1711011009/hela-shop/categories/default_hjkiig.jpg';
                
                // Nếu tìm thấy sản phẩm thuộc danh mục, sử dụng hình ảnh của sản phẩm đó
                if (product && product.imgUrl) {
                    imageUrl = product.imgUrl;
                } 
                
                // Thêm danh mục đã format vào mảng kết quả
                formattedCategories.push({
                    id: category.toLowerCase(),
                    type: category,
                    imageUrl: imageUrl
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                categories: formattedCategories,
                code: 200,
                message: "Lấy danh sách danh mục thành công"
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách danh mục:', error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
}
export default ProductController = new ProductController()