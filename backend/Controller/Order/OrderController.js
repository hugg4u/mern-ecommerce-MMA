import response from "../../Utils/Constants/Response.js";
import Order from "../../Model/Order.js";
import Cart from "../../Model/Cart.js";
import Product from "../../Model/Product.js";
import User from "../../Model/User.js";
import HttpStatus from "../../Utils/Constants/HttpType.js";
import ResTypes from "../../Utils/Constants/ResTypes.js";
import mongoose from "mongoose";

class OrderController {
    // Tạo đơn hàng mới từ giỏ hàng
    createOrder = async (req, res) => {
        try {
            const userId = req.user.id;
            console.log('userId:', userId);
            const { shippingAddress, paymentMethod, notes } = req.body;
            
            // Validate dữ liệu đầu vào
            if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
                !shippingAddress.district || !shippingAddress.province || !shippingAddress.street) {
                console.log('Thông tin địa chỉ giao hàng không đầy đủ');
                    return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Thông tin địa chỉ giao hàng không đầy đủ",
                    code: 400
                });
            }
            
            // Lấy giỏ hàng của người dùng
            const cart = await Cart.findOne({ user: userId }).populate({
                path: 'items.product',
                select: 'name price imgUrl stock pieces'
            });

            console.log('userId từ token:', userId);
            console.log('Tìm giỏ hàng với userId:', userId);
            console.log('Giỏ hàng tìm thấy:', cart ? 'Có' : 'Không');
            console.log('Thông tin giỏ hàng:', JSON.stringify(cart, null, 2));
            console.log('Số lượng items trong giỏ:', cart ? cart.items.length : 0);
            
            // if (!cart || cart.items.length === 0) {
            //     console.log('Giỏ hàng trống, không thể tạo đơn hàng');
            //     return response(res, 400, HttpStatus.getStatus(400), {
            //         message: "Giỏ hàng trống, không thể tạo đơn hàng",
            //         code: 400
            //     });
            // }
            
            // Kiểm tra sản phẩm trong kho trước khi tạo đơn hàng
            for (const item of cart.items) {
                const product = item.product;
                
                if (product.stock === 'out of stock') {
                    console.log('Sản phẩm đã hết hàng:', product.name);
                    return response(res, 400, HttpStatus.getStatus(400), {
                        message: `Sản phẩm ${product.name} đã hết hàng`,
                        code: 400
                    });
                }
                
                if (item.quantity > product.pieces) {
                    console.log('Sản phẩm không đủ số lượng:', product.name);
                    return response(res, 400, HttpStatus.getStatus(400), {
                        message: `Sản phẩm ${product.name} chỉ còn ${product.pieces} sản phẩm trong kho`,
                        code: 400
                    });
                }
            }
            
            // Tính phí vận chuyển (có thể triển khai logic tính phí vận chuyển phức tạp hơn)
            const shippingFee = 30000; // 30k VND
            
            // Chuyển đổi từ giỏ hàng sang định dạng đơn hàng
            const orderItems = cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                imgUrl: item.product.imgUrl
            }));
            
            // Tính tổng tiền
            const subtotal = cart.totalAmount;
            const total = subtotal + shippingFee;
            
            // Tạo đơn hàng mới
            const newOrder = new Order({
                user: userId,
                items: orderItems,
                shippingAddress,
                paymentMethod: paymentMethod || 'cod',
                shippingFee,
                subtotal,
                total,
                notes
            });
            
            // Lưu đơn hàng
            await newOrder.save();
            
            // Cập nhật số lượng sản phẩm trong kho
            for (const item of cart.items) {
                const product = await Product.findById(item.product._id);
                product.pieces -= item.quantity;
                
                // Kiểm tra nếu hết hàng
                if (product.pieces <= 0) {
                    product.stock = 'out of stock';
                }
                
                await product.save();
            }
            
            // Lấy danh sách productId từ đơn hàng đã tạo
            const orderedProductIds = orderItems.map(item => item.product.toString());
            console.log('ProductIDs trong đơn hàng:', orderedProductIds);

            // Cập nhật giỏ hàng - chỉ xóa những sản phẩm đã được đặt hàng
            try {
                // Lọc ra các sản phẩm không có trong đơn hàng
                cart.items = cart.items.filter(item => 
                    !orderedProductIds.includes(item.product._id.toString())
                );
                
                console.log('Số sản phẩm còn lại trong giỏ sau khi lọc:', cart.items.length);
                
                // Giỏ hàng sẽ tự động tính lại tổng tiền và số lượng nhờ pre-save hook
                await cart.save();
                
                console.log('Đã cập nhật giỏ hàng thành công');
            } catch (error) {
                console.error('Lỗi khi cập nhật giỏ hàng:', error);
                // Không return lỗi ở đây để đơn hàng vẫn được tạo thành công
            }
            
            return response(res, 201, HttpStatus.getStatus(201), {
                order: newOrder,
                message: "Đặt hàng thành công",
                code: 201
            });
            
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi tạo đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
    
    // Lấy danh sách đơn hàng của người dùng
    getUserOrders = async (req, res) => {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 10 } = req.query;
            
            // Tạo query cơ bản
            const query = { user: userId };
            
            // Thêm điều kiện lọc theo status nếu có
            if (status && status !== 'all') {
                query.status = status;
            }
            
            // Tính toán skip cho phân trang
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Đếm tổng số đơn hàng
            const totalOrders = await Order.countDocuments(query);
            
            // Lấy danh sách đơn hàng
            const orders = await Order.find(query)
                .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất lên đầu
                .skip(skip)
                .limit(parseInt(limit))
                .exec();
            
            return response(res, 200, HttpStatus.getStatus(200), {
                orders,
                pagination: {
                    totalOrders,
                    totalPages: Math.ceil(totalOrders / parseInt(limit)),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                },
                code: 200
            });
            
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
    
    // Lấy chi tiết một đơn hàng
    getOrderDetail = async (req, res) => {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            
            if (!orderId) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "ID đơn hàng không được cung cấp",
                    code: 400
                });
            }
            
            // Tìm đơn hàng
            const order = await Order.findOne({
                _id: orderId,
                user: userId
            });
            
            if (!order) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy đơn hàng",
                    code: 404
                });
            }
            
            return response(res, 200, HttpStatus.getStatus(200), {
                order,
                code: 200
            });
            
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
    
    // Hủy đơn hàng
    cancelOrder = async (req, res) => {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const { cancelReason } = req.body;
            
            if (!orderId) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "ID đơn hàng không được cung cấp",
                    code: 400
                });
            }
            
            // Tìm đơn hàng
            const order = await Order.findOne({
                _id: orderId,
                user: userId
            });
            
            if (!order) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy đơn hàng",
                    code: 404
                });
            }
            
            // Kiểm tra nếu đơn hàng có thể hủy
            if (order.status !== 'pending' && order.status !== 'processing') {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Không thể hủy đơn hàng ở trạng thái này",
                    code: 400
                });
            }
            
            // Cập nhật trạng thái
            order.status = 'cancelled';
            order.statusHistory.push({
                status: 'cancelled',
                timestamp: new Date(),
                note: cancelReason || 'Người dùng hủy đơn hàng'
            });
            
            // Hoàn trả số lượng sản phẩm vào kho
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.pieces += item.quantity;
                    
                    // Cập nhật trạng thái nếu sản phẩm còn hàng
                    if (product.pieces > 0 && product.stock === 'out of stock') {
                        product.stock = 'in stock';
                    }
                    
                    await product.save();
                }
            }
            
            await order.save();
            
            return response(res, 200, HttpStatus.getStatus(200), {
                order,
                message: "Hủy đơn hàng thành công",
                code: 200
            });
            
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi hủy đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
}

export default new OrderController(); 