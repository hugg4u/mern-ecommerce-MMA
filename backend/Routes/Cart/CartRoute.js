import Express from "express";
import CartController from "../../Controller/Cart/CartController.js";
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";
import validateScehma from "../../MiddleWare/Schema/ValidateSchema.js";
import CartYup from "../../Utils/Validation/CartYup.js";

const router = Express.Router();

// Route lấy giỏ hàng của user
router.get("/get-cart", validateToken, CartController.getCart);

// Route thêm sản phẩm vào giỏ hàng
router.post("/add-to-cart", validateToken, CartController.addToCart);

// Route cập nhật số lượng sản phẩm trong giỏ hàng
router.post("/update-cart-item", validateToken, CartController.updateCartItem);

// Route xóa sản phẩm khỏi giỏ hàng
router.post("/remove-from-cart", validateToken, CartController.removeFromCart);

// Route xóa toàn bộ giỏ hàng
router.post("/clear-cart", validateToken, CartController.clearCart);

export default router; 