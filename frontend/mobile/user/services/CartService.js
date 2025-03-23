import { fetchWithAuth } from '../utils/apiHelper';
import { API_CONFIG } from './config';

// Sử dụng cấu hình API từ config.js
const BASE_URL = API_CONFIG.BASE_URL; 

// Lấy giỏ hàng của người dùng
export const getCart = async () => {
  console.log('Gọi API lấy giỏ hàng');
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cart/get-cart`, {
      method: 'GET',
    });
    console.log('Kết quả lấy giỏ hàng:', response.status);
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error.message);
    throw error;
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (productId, quantity = 1) => {
  console.log(`Gọi API thêm vào giỏ hàng: productId=${productId}, quantity=${quantity}`);
  
  // Convert productId sang string nếu chưa phải
  const productIdStr = String(productId);
  
  try {
    // Thử gửi dữ liệu theo format mới
    const payload = { 
      productId: productIdStr, 
      quantity: Number(quantity) 
    };
    
    console.log('Payload gửi lên:', JSON.stringify(payload));
    
    const response = await fetchWithAuth(`${BASE_URL}/cart/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Log đầy đủ phản hồi để debug
    if (response.status !== 200) {
      console.log('Phản hồi chi tiết:', JSON.stringify(response.data));
    }
    
    console.log('Kết quả thêm vào giỏ hàng:', response.status);
    return response;
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error.message);
    throw error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (productId, quantity) => {
  console.log(`Gọi API cập nhật giỏ hàng: productId=${productId}, quantity=${quantity}`);
  
  // Convert productId sang string nếu chưa phải
  const productIdStr = String(productId);
  
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cart/update-cart-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId: productIdStr, 
        quantity: Number(quantity) 
      }),
    });
    console.log('Kết quả cập nhật giỏ hàng:', response.status);
    return response;
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error.message);
    throw error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (productId) => {
  console.log(`Gọi API xóa khỏi giỏ hàng: productId=${productId}`);
  
  // Convert productId sang string nếu chưa phải
  const productIdStr = String(productId);
  
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cart/remove-from-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: productIdStr }),
    });
    console.log('Kết quả xóa khỏi giỏ hàng:', response.status);
    return response;
  } catch (error) {
    console.error('Lỗi khi xóa khỏi giỏ hàng:', error.message);
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  console.log('Gọi API xóa toàn bộ giỏ hàng');
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cart/clear-cart`, {
      method: 'POST',
    });
    console.log('Kết quả xóa toàn bộ giỏ hàng:', response.status);
    return response;
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ giỏ hàng:', error.message);
    throw error;
  }
}; 