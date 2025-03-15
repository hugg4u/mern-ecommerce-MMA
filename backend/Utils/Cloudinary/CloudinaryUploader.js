import cloudinary from '../../Config/CloudinaryConfig.js';

/**
 * Hàm upload ảnh lên Cloudinary
 * @param {string} imageBase64 - Ảnh dạng base64 string
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary (mặc định là 'HelaShop')
 * @returns {Promise} - Promise chứa kết quả upload từ Cloudinary
 */
export const uploadImage = async (imageBase64, folder = 'HelaShop') => {
  try {
    // Kiểm tra nếu ảnh đã là URL Cloudinary, trả về ngay
    if (typeof imageBase64 === 'string' && imageBase64.startsWith('https://res.cloudinary.com/')) {
      console.log('Ảnh đã là URL Cloudinary, trả về trực tiếp');
      return { secure_url: imageBase64 };
    }
    
    // Debug
    console.log('Đang chuẩn bị upload ảnh lên Cloudinary...');
    
    // Đảm bảo dữ liệu base64 có định dạng đúng
    let uploadData = imageBase64;
    
    // Nếu base64 có header, sử dụng trực tiếp
    if (typeof imageBase64 === 'string' && !imageBase64.startsWith('data:')) {
      uploadData = `data:image/jpeg;base64,${imageBase64}`;
      console.log('Đã thêm prefix cho base64 image');
    }
    
    // Thực hiện upload
    const result = await cloudinary.uploader.upload(uploadData, {
      folder: folder,
      resource_type: 'auto',
    });
    
    console.log('Upload thành công, nhận được URL:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
    throw error;
  }
};

/**
 * Hàm xóa ảnh khỏi Cloudinary
 * @param {string} publicId - Public ID của ảnh trên Cloudinary
 * @returns {Promise} - Promise chứa kết quả xóa từ Cloudinary
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
    throw error;
  }
}; 