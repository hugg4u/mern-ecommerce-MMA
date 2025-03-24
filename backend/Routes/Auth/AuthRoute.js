import Express from "express";
const router = Express.Router();
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";
import AuthController from "../../Controller/Auth/AuthController.js";
import validateScehma from "../../MiddleWare/Schema/ValidateSchema.js";
import AuthYup from "../../Utils/Validation/AuthYup.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           description: Email người dùng
 *         password:
 *           type: string
 *           description: Mật khẩu người dùng
 *         role:
 *           type: string
 *           description: Vai trò người dùng
 *         picUrl:
 *           type: string
 *           description: URL ảnh đại diện
 *   responses:
 *     UnauthorizedError:
 *       description: Không được phép truy cập
 *     NotFoundError:
 *       description: Không tìm thấy tài nguyên
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *               picUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       403:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/register", validateScehma(AuthYup.registerSchema) ,AuthController.signUp)

/**
 * @swagger
 * /api/v1/auth/mobileRegister:
 *   post:
 *     summary: Đăng ký tài khoản cho thiết bị di động
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       403:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/mobileRegister", validateScehma(AuthYup.registerSchema) ,AuthController.mobileSignUp)

/**
 * @swagger
 * /api/v1/auth/verifyEmail/{token}:
 *   get:
 *     summary: Xác minh email đăng ký
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token xác minh email
 *     responses:
 *       201:
 *         description: Email đã được xác minh thành công
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.get("/verifyEmail/:token",AuthController.verifyEmail)

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       403:
 *         description: Mật khẩu không đúng
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.post("/login", validateScehma(AuthYup.loginSchema), AuthController.signIn)

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Gửi email yêu cầu đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email đặt lại mật khẩu đã được gửi
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.post("/reset-password",validateScehma(AuthYup.passwordReset),AuthController.resetPassword)

/**
 * @swagger
 * /api/v1/auth/verify-reset-password/{token}:
 *   post:
 *     summary: Xác minh và đặt lại mật khẩu mới
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token đặt lại mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Mật khẩu mới
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post("/verify-reset-password/:token",validateScehma(AuthYup.verifyPasswordReset),AuthController.verifyResetPassword)

export default router