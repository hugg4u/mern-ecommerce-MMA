import express from "express";
import OrderController from "../../Controller/Order/OrderController.js";
import AdminOrderController from "../../Controller/Order/AdminOrderController.js";
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";

const router = express.Router();

// Routes cho người dùng (phải đăng nhập)
router.post("/create", validateToken, OrderController.createOrder);
router.get("/my-orders", validateToken, OrderController.getUserOrders);
router.get("/my-orders/:orderId", validateToken, OrderController.getOrderDetail);
router.put("/cancel/:orderId", validateToken, OrderController.cancelOrder);

// Routes cho admin
router.get("/admin/all", validateToken, AdminOrderController.getAllOrders);
router.get("/admin/statistics", validateToken, AdminOrderController.getOrderStatistics);
router.get("/admin/:orderId", validateToken, AdminOrderController.getOrderDetail);
router.put("/admin/status/:orderId", validateToken, AdminOrderController.updateOrderStatus);

export default router; 