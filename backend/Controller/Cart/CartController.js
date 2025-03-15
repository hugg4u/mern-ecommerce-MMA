import response from "../../Utils/Constants/Response.js";
import Cart from "../../Model/Cart.js";
import Product from "../../Model/Product.js";
import HttpStatus from "../../Utils/Constants/HttpType.js";
import ResTypes from "../../Utils/Constants/ResTypes.js";

class CartController {
    // Lấy giỏ hàng của user
    getCart = async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Tìm giỏ hàng của user và populate thông tin sản phẩm
            const cart = await Cart.findOne({ user: userId }).populate({
                path: 'items.product',
                select: 'name price imgUrl pid description'
            });
            
            if (!cart) {
                // Nếu chưa có giỏ hàng, tạo giỏ hàng trống
                const newCart = new Cart({
                    user: userId,
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                });
                
                await newCart.save();
                
                return response(res, 200, HttpStatus.getStatus(200), {
                    cart: newCart,
                    code: 200,
                    message: "Giỏ hàng trống"
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                cart,
                code: 200,
                message: "Lấy giỏ hàng thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Thêm sản phẩm vào giỏ hàng
    addToCart = async (req, res) => {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;
        
        try {
            // Kiểm tra sản phẩm tồn tại
            const product = await Product.findById(productId);
            if (!product) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy sản phẩm",
                    code: 404
                });
            }
            
            // Tìm giỏ hàng của người dùng hoặc tạo mới nếu chưa có
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                cart = new Cart({
                    user: userId,
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                });
            }
            
            // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
            const itemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId
            );
            
            if (itemIndex > -1) {
                // Sản phẩm đã tồn tại, cập nhật số lượng
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Thêm sản phẩm mới vào giỏ hàng
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price
                });
            }
            
            // Lưu giỏ hàng (tự động tính toán totalAmount và totalItems nhờ middleware)
            await cart.save();
            
            // Populate thông tin sản phẩm
            await cart.populate({
                path: 'items.product',
                select: 'name price imgUrl pid description'
            });
            
            return response(res, 200, HttpStatus.getStatus(200), {
                cart,
                code: 200,
                message: "Thêm sản phẩm vào giỏ hàng thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartItem = async (req, res) => {
        const { productId, quantity } = req.body;
        const userId = req.user.id;
        
        try {
            // Kiểm tra số lượng hợp lệ
            if (quantity < 1) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Số lượng phải lớn hơn 0",
                    code: 400
                });
            }
            
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy giỏ hàng",
                    code: 404
                });
            }
            
            // Tìm sản phẩm trong giỏ hàng
            const itemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId
            );
            
            if (itemIndex === -1) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Sản phẩm không có trong giỏ hàng",
                    code: 404
                });
            }
            
            // Cập nhật số lượng
            cart.items[itemIndex].quantity = quantity;
            
            // Lưu giỏ hàng
            await cart.save();
            
            // Populate thông tin sản phẩm
            await cart.populate({
                path: 'items.product',
                select: 'name price imgUrl pid description'
            });
            
            return response(res, 200, HttpStatus.getStatus(200), {
                cart,
                code: 200,
                message: "Cập nhật giỏ hàng thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart = async (req, res) => {
        const { productId } = req.body;
        const userId = req.user.id;
        
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy giỏ hàng",
                    code: 404
                });
            }
            
            // Tìm vị trí sản phẩm trong giỏ hàng
            const itemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId
            );
            
            if (itemIndex === -1) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Sản phẩm không có trong giỏ hàng",
                    code: 404
                });
            }
            
            // Xóa sản phẩm khỏi giỏ hàng
            cart.items.splice(itemIndex, 1);
            
            // Lưu giỏ hàng
            await cart.save();
            
            // Populate thông tin sản phẩm
            await cart.populate({
                path: 'items.product',
                select: 'name price imgUrl pid description'
            });
            
            return response(res, 200, HttpStatus.getStatus(200), {
                cart,
                code: 200,
                message: "Xóa sản phẩm khỏi giỏ hàng thành công"
            });
        } catch (error) {
            console.log(error);
            return response(res, 500, HttpStatus.getStatus(500), {
                error: error.message,
                code: 500
            });
        }
    }
    
    // Xóa toàn bộ giỏ hàng
    clearCart = async (req, res) => {
        const userId = req.user.id;
        
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy giỏ hàng",
                    code: 404
                });
            }
            
            // Xóa tất cả sản phẩm
            cart.items = [];
            
            // Lưu giỏ hàng
            await cart.save();
            
            return response(res, 200, HttpStatus.getStatus(200), {
                cart,
                code: 200,
                message: "Đã xóa toàn bộ giỏ hàng"
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

export default new CartController(); 