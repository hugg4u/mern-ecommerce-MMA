import response from "../../Utils/Constants/Response.js";
import Banner from "../../Model/Banner.js";
import HttpStatus from "../../Utils/Constants/HttpType.js";
import ResTypes from "../../Utils/Constants/ResTypes.js";
import { uploadImage } from "../../Utils/Cloudinary/CloudinaryUploader.js";

class BannerController {
    // Lấy tất cả banners
    getBanners = async (req, res) => {
        try {
            // Lấy banners từ DB, sắp xếp theo thứ tự
            const bannersFromDB = await Banner.find({ deleted: false }).sort('order');
            
            // Chuyển đổi định dạng để frontend có thể hiển thị nhất quán
            const banners = bannersFromDB.map(banner => {
                return banner.toObject();
            });
            
            return response(res, 200, HttpStatus.getStatus(200), { 
                banners,
                code: 200,
                message: "Lấy danh sách banner thành công" 
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Lấy thông tin một banner
    getBanner = async (req, res) => {
        console.log('req.body', req.body);
        const { bid } = req.body;
        console.log('bid', bid);
        
        try {
            // Tìm banner theo ID
            const bannerFromDB = await Banner.findOne({ bid });
            
            // Kiểm tra banner tồn tại
            if (!bannerFromDB) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy banner",
                    code: 404
                });
            }
            
            // Kiểm tra banner đã bị xóa chưa
            if (bannerFromDB.deleted === true) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Banner không tồn tại hoặc đã bị xóa",
                    code: 404
                });
            }
            
            // Chuyển đổi định dạng để frontend có thể hiển thị nhất quán
            const banner = bannerFromDB.toObject();
            
            return response(res, 200, HttpStatus.getStatus(200), {
                banner,
                code: 200,
                message: "Lấy thông tin banner thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Thêm banner mới
    addBanner = async (req, res) => {
        try {
            // Lấy dữ liệu từ frontend - đã được validate bởi Yup
            const { title, description, order, isActive, imageUrl } = req.body;
            
            // Log để debug
            console.log("Nhận request tạo banner:", { title, imageUrl });
            
            // Chuẩn bị dữ liệu theo cấu trúc model Banner
            const bannerData = {
                title,
                description: description || '',
                order: order || 0,
                isActive: isActive !== undefined ? isActive : true,
                imageUrl: imageUrl || '',
                deleted: false
            };
            
            console.log("URL ảnh được lưu:", bannerData.imageUrl);

            // Tạo banner mới
            const banner = new Banner(bannerData);
            const result = await banner.save();
            
            if (result) {
                console.log("Đã tạo banner thành công, ID:", result.bid);
                return response(res, 201, HttpStatus.getStatus(201), { 
                    banner: result, 
                    code: 200,  // Sử dụng code 200 để frontend nhận biết thành công
                    message: "Thêm banner thành công"
                });
            } else {
                return response(res, 403, HttpStatus.getStatus(403), {
                    message: "Thêm banner thất bại",
                    code: 403
                });
            }
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), { 
                error: error.message,
                code: 500
            });
        }
    }
    
    // Xóa banner
    deleteBanner = async (req, res) => {
        try {
            const { bid } = req.body;
            
            // Kiểm tra banner tồn tại
            const bannerExist = await Banner.findOne({ bid });
            if (!bannerExist) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy banner",
                    code: 404
                });
            }
            
            // Kiểm tra banner đã bị xóa chưa
            if (bannerExist.deleted === true) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Banner này đã bị xóa trước đó",
                    code: 200
                });
            }
            
            // Cập nhật trạng thái deleted
            const result = await Banner.updateOne(
                { bid },
                { $set: { deleted: true } }
            );
            
            if (result.modifiedCount === 0) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Không có thay đổi",
                    code: 200
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                message: "Xóa banner thành công",
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
    
    // Cập nhật banner
    updateBanner = async (req, res) => {
        try {
            // Lấy dữ liệu từ frontend
            const { bid, title, description, imageUrl, isActive, order } = req.body;
            
            // Kiểm tra banner tồn tại
            const bannerExist = await Banner.findOne({ bid });
            if (!bannerExist) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy banner",
                    code: 404
                });
            }
            
            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
                title: title || bannerExist.title,
                description: description !== undefined ? description : bannerExist.description,
                imageUrl: imageUrl || bannerExist.imageUrl,
                isActive: isActive !== undefined ? isActive : bannerExist.isActive,
                order: order !== undefined ? order : bannerExist.order
            };

            const result = await Banner.updateOne(
                { bid },
                { $set: updateData }
            );
            
            if (result.modifiedCount === 0) {
                return response(res, 200, HttpStatus.getStatus(200), {
                    message: "Không có thay đổi",
                    code: 200
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                message: "Cập nhật banner thành công",
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
    
    // Upload ảnh banner
    uploadBannerImage = async (req, res) => {
        try {
            const { image, bid } = req.body;
            
            // Kiểm tra nếu không có ảnh
            if (!image) {
                return response(res, 400, HttpStatus.getStatus(400), { 
                    message: "Không có ảnh nào được cung cấp",
                    code: 400
                });
            }
            
            // Upload ảnh lên Cloudinary
            const uploadedImage = await uploadImage(image);
            
            if (!uploadedImage.secure_url) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Lỗi upload ảnh",
                    code: 400
                });
            }
            
            // Nếu cung cấp bid, cập nhật URL ảnh vào banner
            if (bid) {
                // Kiểm tra banner tồn tại
                const bannerExist = await Banner.findOne({ bid });
                if (!bannerExist) {
                    return response(res, 404, HttpStatus.getStatus(404), {
                        message: "Không tìm thấy banner",
                        code: 404
                    });
                }
                
                // Cập nhật URL ảnh
                const result = await Banner.updateOne(
                    { bid },
                    { $set: { imageUrl: uploadedImage.secure_url } }
                );
                
                if (result.modifiedCount === 0) {
                    return response(res, 200, HttpStatus.getStatus(200), {
                        message: "Không có thay đổi",
                        code: 200
                    });
                }
                
                return response(res, 200, HttpStatus.getStatus(200), {
                    imageUrl: uploadedImage.secure_url,
                    code: 200,
                    message: "Upload ảnh banner thành công"
                });
            }
            
            // Nếu không cung cấp bid, chỉ trả về URL ảnh đã upload
            return response(res, 200, HttpStatus.getStatus(200), {
                imageUrl: uploadedImage.secure_url,
                code: 200,
                message: "Upload ảnh thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
}

export default new BannerController(); 