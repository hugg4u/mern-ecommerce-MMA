import express from "express";
import OrderController from "../../Controller/Order/OrderController.js";
import AdminOrderController from "../../Controller/Order/AdminOrderController.js";
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: ID của người dùng đặt hàng
 *         orderItems:
 *           type: array
 *           description: Danh sách các sản phẩm trong đơn hàng
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID của sản phẩm
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               image:
 *                 type: string
 *                 description: URL hình ảnh sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               qty:
 *                 type: number
 *                 description: Số lượng sản phẩm
 *         shippingAddress:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Địa chỉ giao hàng
 *             city:
 *               type: string
 *               description: Thành phố
 *             postalCode:
 *               type: string
 *               description: Mã bưu điện
 *             country:
 *               type: string
 *               description: Quốc gia
 *         paymentMethod:
 *           type: string
 *           description: Phương thức thanh toán
 *         paymentResult:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             status:
 *               type: string
 *             update_time:
 *               type: string
 *             email_address:
 *               type: string
 *         itemsPrice:
 *           type: number
 *           description: Tổng giá trị sản phẩm
 *         shippingPrice:
 *           type: number
 *           description: Phí vận chuyển
 *         taxPrice:
 *           type: number
 *           description: Thuế
 *         totalPrice:
 *           type: number
 *           description: Tổng giá trị đơn hàng
 *         isPaid:
 *           type: boolean
 *           description: Trạng thái thanh toán
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian thanh toán
 *         isDelivered:
 *           type: boolean
 *           description: Trạng thái giao hàng
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian giao hàng
 *         status:
 *           type: string
 *           description: Trạng thái đơn hàng
 *           enum: [pending, processing, shipped, delivered, cancelled]
 */

/**
 * @swagger
 * /api/v1/order/create:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     name:
 *                       type: string
 *                     image:
 *                       type: string
 *                     price:
 *                       type: number
 *                     qty:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *               itemsPrice:
 *                 type: number
 *               shippingPrice:
 *                 type: number
 *               taxPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     message:
 *                       type: string
 *       400:
 *         description: Đơn hàng không hợp lệ hoặc giỏ hàng trống
 *       500:
 *         description: Lỗi server
 */
router.post("/create", validateToken, OrderController.createOrder);

/**
 * @swagger
 * /api/v1/order/my-orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của người dùng hiện tại
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.get("/my-orders", validateToken, OrderController.getUserOrders);

/**
 * @swagger
 * /api/v1/order/my-orders/{orderId}:
 *   get:
 *     summary: Lấy chi tiết một đơn hàng của người dùng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.get("/my-orders/:orderId", validateToken, OrderController.getOrderDetail);

/**
 * @swagger
 * /api/v1/order/cancel/{orderId}:
 *   put:
 *     summary: Hủy đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được hủy thành công
 *       400:
 *         description: Không thể hủy đơn hàng (đã thanh toán hoặc đã giao)
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.put("/cancel/:orderId", validateToken, OrderController.cancelOrder);

/**
 * @swagger
 * /api/v1/order/admin/all:
 *   get:
 *     summary: Lấy danh sách tất cả đơn hàng (chỉ dành cho admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get("/admin/all", validateToken, AdminOrderController.getAllOrders);

/**
 * @swagger
 * /api/v1/order/admin/statistics:
 *   get:
 *     summary: Lấy thống kê đơn hàng (chỉ dành cho admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     statusCounts:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         processing:
 *                           type: number
 *                         shipped:
 *                           type: number
 *                         delivered:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get("/admin/statistics", validateToken, AdminOrderController.getOrderStatistics);

/**
 * @swagger
 * /api/v1/order/admin/{orderId}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng (chỉ dành cho admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.get("/admin/:orderId", validateToken, AdminOrderController.getOrderDetail);

/**
 * @swagger
 * /api/v1/order/admin/status/{orderId}:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (chỉ dành cho admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng đã được cập nhật thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.put("/admin/status/:orderId", validateToken, AdminOrderController.updateOrderStatus);

export default router; 