import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/CartService';
import { Alert, ToastAndroid } from 'react-native';

// Tạo giá trị mặc định cho cart
const DEFAULT_CART = { items: [], totalItems: 0, totalAmount: 0 };

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.warn('useCart must be used within a CartProvider');
    // Trả về giá trị mặc định nếu context không có sẵn
    return {
      cart: DEFAULT_CART,
      loading: false,
      addItemToCart: () => Promise.resolve(false),
      updateItem: () => Promise.resolve(false),
      removeItem: () => Promise.resolve(false),
      emptyCart: () => Promise.resolve(false),
      fetchCart: () => Promise.resolve(DEFAULT_CART)
    };
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(DEFAULT_CART);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, checkLoginStatus, getStoredToken } = useAuth();

  // Log mỗi khi cart thay đổi
  useEffect(() => {
    console.log("CartContext - Cart đã được cập nhật:", 
      cart ? `${cart.totalItems} sản phẩm, ${cart.items?.length || 0} mục` : "cart là null/undefined");
  }, [cart]);

  // Lấy giỏ hàng khi người dùng đăng nhập
  useEffect(() => {
    console.log("CartContext - trạng thái đăng nhập:", isAuthenticated);
    if (isAuthenticated) {
      console.log("CartContext - Đã đăng nhập, đang lấy giỏ hàng");
      fetchCart();
    } else {
      console.log("CartContext - Chưa đăng nhập, reset giỏ hàng");
      // Reset giỏ hàng khi đăng xuất
      setCart(DEFAULT_CART);
    }
  }, [isAuthenticated]);

  // Debug token
  useEffect(() => {
    const debugToken = async () => {
      try {
        const token = await getStoredToken();
        console.log("CartContext - Debug token:", token ? token.substring(0, 10) + "..." : "Không có token");
        
        if (!token) {
          console.log("CartContext - Không có token, reset giỏ hàng");
          setCart(DEFAULT_CART);
        }
      } catch (err) {
        console.error("CartContext - Lỗi debug token:", err);
      }
    };
    
    debugToken();
  }, []);

  // Lấy thông tin giỏ hàng từ server
  const fetchCart = async () => {
    try {
      const token = await checkLoginStatus(); // Kiểm tra trạng thái đăng nhập trước khi lấy giỏ hàng
      
      if (!token) {
        console.log("fetchCart - Chưa đăng nhập, không thể lấy giỏ hàng");
        ToastAndroid.show('Vui lòng đăng nhập để xem giỏ hàng', ToastAndroid.SHORT);
        setCart(DEFAULT_CART); // Đảm bảo reset cart khi không có token
        return DEFAULT_CART;
      }
      
      setLoading(true);
      console.log("fetchCart - Đang lấy giỏ hàng từ server");
      const response = await getCart();
      console.log("fetchCart - Kết quả:", response.status);
      
      if (response.status === 200) {
        // Debug chi tiết response
        console.log('Response.data chi tiết:', JSON.stringify(response.data, null, 2));
        console.log('Cấu trúc response:', Object.keys(response.data));
        if (response.data?.data) {
          console.log('Cấu trúc response.data.data:', Object.keys(response.data.data));
          if (response.data.data.cart) {
            console.log('Cấu trúc cart:', Object.keys(response.data.data.cart));
            console.log('Cart items length:', response.data.data.cart.items?.length || 0);
          }
        }
        
        // Sửa đường dẫn truy cập giỏ hàng từ response
        // Lưu ý: giỏ hàng nằm trong response.data.data.cart
        const fetchedCart = response.data?.data?.cart || DEFAULT_CART;
        console.log('fetchedCart hung', fetchedCart);
        
        // Kiểm tra xem cart có hợp lệ không
        if (fetchedCart && Array.isArray(fetchedCart.items)) {
          setCart(fetchedCart);
          console.log("fetchCart - Lấy giỏ hàng thành công, số lượng:", 
            fetchedCart.totalItems, "số mục:", fetchedCart.items.length);
        } else {
          console.error("fetchCart - Dữ liệu giỏ hàng không hợp lệ", fetchedCart);
          setCart(DEFAULT_CART);
        }
        return fetchedCart;
      } else {
        console.error("fetchCart - Lỗi khi lấy giỏ hàng, mã lỗi:", response.status);
        ToastAndroid.show('Không thể lấy giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
        setCart(DEFAULT_CART);
        return DEFAULT_CART;
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      ToastAndroid.show('Không thể lấy giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
      setCart(DEFAULT_CART);
      return DEFAULT_CART;
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItemToCart = async (productId, quantity = 1) => {
    try {
      // Đảm bảo productId là string
      const productIdStr = String(productId);
      console.log(`addItemToCart - Kiểu dữ liệu productId: ${typeof productIdStr}, giá trị: ${productIdStr}`);
      
      // Kiểm tra trực tiếp trạng thái đăng nhập từ context
      console.log("addItemToCart - Trạng thái đăng nhập từ context:", isAuthenticated);
      if (!isAuthenticated) {
        console.log("addItemToCart - Chưa đăng nhập, không thể thêm vào giỏ hàng");
        ToastAndroid.show('Vui lòng đăng nhập để thêm vào giỏ hàng', ToastAndroid.SHORT);
        return false;
      }
      
      if (!productIdStr) {
        console.error("addItemToCart - Thiếu thông tin sản phẩm");
        ToastAndroid.show('Không thể thêm vào giỏ hàng: Thiếu ID sản phẩm', ToastAndroid.SHORT);
        return false;
      }
      
      setLoading(true);
      console.log("addItemToCart - Đang thêm sản phẩm vào giỏ hàng:", productIdStr, "số lượng:", quantity);
      
      // Thử thêm vào giỏ hàng
      const response = await addToCart(productIdStr, quantity);
      console.log("addItemToCart - Kết quả:", response.status);
      
      if (response.status === 200) {
        // Sửa đường dẫn truy cập giỏ hàng từ response
        const updatedCart = response.data?.data?.cart || DEFAULT_CART;
        setCart(updatedCart);
        console.log("addItemToCart - Thêm thành công");
        return true;
      } else if (response.status === 404) {
        console.error("addItemToCart - Sản phẩm không tồn tại");
        ToastAndroid.show('Sản phẩm không tồn tại hoặc đã bị xóa', ToastAndroid.SHORT);
        return false;
      } else if (response.status === 400) {
        console.error("addItemToCart - Dữ liệu không hợp lệ:", response.data?.message || "Không có thông tin lỗi");
        ToastAndroid.show('Không thể thêm vào giỏ hàng: ' + (response.data?.message || "Dữ liệu không hợp lệ"), ToastAndroid.SHORT);
        return false;
      } else {
        console.error("addItemToCart - Lỗi khi thêm vào giỏ hàng, mã lỗi:", response.status);
        ToastAndroid.show('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      
      if (error.message && error.message.includes('Network request failed')) {
        ToastAndroid.show('Không thể kết nối đến máy chủ. Kiểm tra kết nối internet của bạn.', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Không thể thêm vào giỏ hàng: ' + (error.message || 'Lỗi không xác định'), ToastAndroid.SHORT);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateItem = async (productId, quantity) => {
    try {
      // Đảm bảo productId là string
      const productIdStr = String(productId);
      
      const token = await checkLoginStatus();
      
      if (!token) {
        console.log("updateItem - Chưa đăng nhập, không thể cập nhật giỏ hàng");
        ToastAndroid.show('Vui lòng đăng nhập để cập nhật giỏ hàng', ToastAndroid.SHORT);
        return false;
      }
      
      if (!productIdStr) {
        console.error("updateItem - Thiếu thông tin sản phẩm");
        return false;
      }
      
      setLoading(true);
      console.log("updateItem - Đang cập nhật sản phẩm:", productIdStr, "số lượng:", quantity);
      const response = await updateCartItem(productIdStr, quantity);
      
      if (response.status === 200) {
        // Sửa đường dẫn truy cập giỏ hàng từ response
        const updatedCart = response.data?.data?.cart || DEFAULT_CART;
        setCart(updatedCart);
        console.log("updateItem - Cập nhật thành công");
        return true;
      } else {
        console.error("updateItem - Lỗi khi cập nhật giỏ hàng, mã lỗi:", response.status);
        ToastAndroid.show('Không thể cập nhật giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật giỏ hàng:', error);
      ToastAndroid.show('Không thể cập nhật giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (productId) => {
    try {
      // Đảm bảo productId là string
      const productIdStr = String(productId);
      
      const token = await checkLoginStatus();
      
      if (!token) {
        console.log("removeItem - Chưa đăng nhập, không thể xóa sản phẩm");
        ToastAndroid.show('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng', ToastAndroid.SHORT);
        return false;
      }
      
      if (!productIdStr) {
        console.error("removeItem - Thiếu thông tin sản phẩm");
        return false;
      }
      
      setLoading(true);
      console.log("removeItem - Đang xóa sản phẩm:", productIdStr);
      const response = await removeFromCart(productIdStr);
      
      if (response.status === 200) {
        // Sửa đường dẫn truy cập giỏ hàng từ response
        const updatedCart = response.data?.data?.cart || DEFAULT_CART;
        setCart(updatedCart);
        console.log("removeItem - Xóa thành công");
        return true;
      } else {
        console.error("removeItem - Lỗi khi xóa sản phẩm, mã lỗi:", response.status);
        ToastAndroid.show('Không thể xóa sản phẩm. Vui lòng thử lại.', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      ToastAndroid.show('Không thể xóa sản phẩm. Vui lòng thử lại.', ToastAndroid.SHORT);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const emptyCart = async () => {
    try {
      const token = await checkLoginStatus();
      
      if (!token) {
        console.log("emptyCart - Chưa đăng nhập, không thể xóa giỏ hàng");
        ToastAndroid.show('Vui lòng đăng nhập để xóa giỏ hàng', ToastAndroid.SHORT);
        return false;
      }
      
      setLoading(true);
      console.log("emptyCart - Đang xóa toàn bộ giỏ hàng");
      const response = await clearCart();
      
      if (response.status === 200) {
        // Sửa đường dẫn truy cập giỏ hàng từ response
        const updatedCart = response.data?.data?.cart || DEFAULT_CART;
        setCart(updatedCart);
        console.log("emptyCart - Xóa thành công");
        return true;
      } else {
        console.error("emptyCart - Lỗi khi xóa giỏ hàng, mã lỗi:", response.status);
        ToastAndroid.show('Không thể xóa giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      ToastAndroid.show('Không thể xóa giỏ hàng. Vui lòng thử lại.', ToastAndroid.SHORT);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItemToCart,
        updateItem,
        removeItem,
        emptyCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 