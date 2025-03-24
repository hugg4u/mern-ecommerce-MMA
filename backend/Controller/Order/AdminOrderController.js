import response from "../../Utils/Constants/Response.js";
import Order from "../../Model/Order.js";
import Product from "../../Model/Product.js";
import User from "../../Model/User.js";
import HttpStatus from "../../Utils/Constants/HttpType.js";
import ResTypes from "../../Utils/Constants/ResTypes.js";
import { orderStatus } from "../../Utils/Constants/OrderStatus.js";
import mongoose from "mongoose";

class AdminOrderController {
    // Lấy danh sách tất cả đơn hàng (cho admin)
    getAllOrders = async (req, res) => {
        try {
            const { status, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            
            // Tạo query cơ bản
            const query = {};
            
            // Thêm điều kiện lọc theo status nếu có
            if (status && status !== 'all') {
                query.status = status;
            }
            
            // Thêm điều kiện tìm kiếm nếu có
            if (search) {
                query.$or = [
                    { orderNumber: { $regex: search, $options: 'i' } },
                    { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                    { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
                ];
                
                // Thêm tìm kiếm theo user nếu search là ObjectId hợp lệ
                if (mongoose.Types.ObjectId.isValid(search)) {
                    query.$or.push({ user: search });
                }
            }
            
            // Tính toán skip cho phân trang
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Tạo điều kiện sắp xếp
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            
            // Đếm tổng số đơn hàng
            const totalOrders = await Order.countDocuments(query);
            
            // Lấy danh sách đơn hàng
            const orders = await Order.find(query)
                .populate({
                    path: 'user',
                    select: 'name email'
                })
                .sort(sort)
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
    
    // Lấy thống kê về đơn hàng
    getOrderStatistics = async (req, res) => {
        try {
            // Thống kê số lượng đơn hàng theo trạng thái
            const statusCounts = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        revenue: { $sum: '$total' }
                    }
                }
            ]);
            
            // Format kết quả thành object dễ sử dụng
            const statusStats = {};
            let totalOrders = 0;
            let totalRevenue = 0;
            
            orderStatus.forEach(status => {
                statusStats[status] = { count: 0, revenue: 0 };
            });
            
            statusCounts.forEach(item => {
                statusStats[item._id] = {
                    count: item.count,
                    revenue: item.revenue
                };
                
                totalOrders += item.count;
                
                // Chỉ tính doanh thu cho đơn hàng đã giao
                if (item._id === 'delivered') {
                    totalRevenue += item.revenue;
                }
            });
            
            // Thống kê đơn hàng theo thời gian
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);
            
            const lastMonthStart = new Date(today);
            lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
            
            // Lấy số đơn hàng theo ngày
            const todayOrders = await Order.countDocuments({
                createdAt: { $gte: today }
            });
            
            const yesterdayOrders = await Order.countDocuments({
                createdAt: { $gte: yesterday, $lt: today }
            });
            
            const lastWeekOrders = await Order.countDocuments({
                createdAt: { $gte: lastWeekStart }
            });
            
            const lastMonthOrders = await Order.countDocuments({
                createdAt: { $gte: lastMonthStart }
            });
            
            // Thống kê doanh thu từ đơn hàng đã giao
            const todayRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: today },
                        status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]);
            
            const yesterdayRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: yesterday, $lt: today },
                        status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]);
            
            const lastWeekRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastWeekStart },
                        status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]);
            
            const lastMonthRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastMonthStart },
                        status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]);
            
            return response(res, 200, HttpStatus.getStatus(200), {
                totalOrders,
                totalRevenue,
                statusStats,
                timeStats: {
                    today: {
                        orders: todayOrders,
                        revenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0
                    },
                    yesterday: {
                        orders: yesterdayOrders,
                        revenue: yesterdayRevenue.length > 0 ? yesterdayRevenue[0].total : 0
                    },
                    lastWeek: {
                        orders: lastWeekOrders,
                        revenue: lastWeekRevenue.length > 0 ? lastWeekRevenue[0].total : 0
                    },
                    lastMonth: {
                        orders: lastMonthOrders,
                        revenue: lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0
                    }
                },
                code: 200
            });
            
        } catch (error) {
            console.error("Lỗi khi lấy thống kê đơn hàng:", error);
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi lấy thống kê đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
    
    // Lấy chi tiết đơn hàng (cho admin)
    getOrderDetail = async (req, res) => {
        try {
            const { orderId } = req.params;
            
            if (!orderId) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "ID đơn hàng không được cung cấp",
                    code: 400
                });
            }
            
            // Tìm đơn hàng
            const order = await Order.findById(orderId).populate({
                path: 'user',
                select: 'name email telephone photoUrl'
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
    
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status, note } = req.body;
            
            if (!orderId) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "ID đơn hàng không được cung cấp",
                    code: 400
                });
            }
            
            if (!status || !orderStatus.includes(status)) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Trạng thái đơn hàng không hợp lệ",
                    code: 400
                });
            }
            
            // Tìm đơn hàng
            const order = await Order.findById(orderId);
            
            if (!order) {
                return response(res, 404, HttpStatus.getStatus(404), {
                    message: "Không tìm thấy đơn hàng",
                    code: 404
                });
            }
            
            // Kiểm tra trạng thái hiện tại và trạng thái mới
            if (order.status === status) {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: "Đơn hàng đã ở trạng thái này",
                    code: 400
                });
            }
            
            // Không cho phép chuyển từ trạng thái cancelled/delivered sang trạng thái khác
            if ((order.status === 'cancelled' || order.status === 'delivered' || order.status === 'refunded') && 
                status !== 'returned' && status !== 'refunded') {
                return response(res, 400, HttpStatus.getStatus(400), {
                    message: `Không thể thay đổi trạng thái đơn hàng từ ${order.status}`,
                    code: 400
                });
            }
            
            // Cập nhật trạng thái
            order.status = status;
            
            // Nếu đơn hàng bị hủy, hoàn trả số lượng sản phẩm vào kho
            if (status === 'cancelled' && (order.status !== 'cancelled' && order.status !== 'returned' && order.status !== 'refunded')) {
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
            }
            
            // Thêm vào lịch sử trạng thái
            order.statusHistory.push({
                status,
                timestamp: new Date(),
                note: note || `Admin cập nhật trạng thái thành: ${status}`
            });
            
            await order.save();
            
            return response(res, 200, HttpStatus.getStatus(200), {
                order,
                message: "Cập nhật trạng thái đơn hàng thành công",
                code: 200
            });
            
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            return response(res, 500, HttpStatus.getStatus(500), {
                message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng",
                error: error.message,
                code: 500
            });
        }
    };
}

export default new AdminOrderController(); 