import Express from "express";
import ProductController from "../../Controller/Product/ProductController.js";
import validateScehma from "../../MiddleWare/Schema/ValidateSchema.js";
import ProductYup from "../../Utils/Validation/ProductYup.js";
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";

const router = Express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         pid:
 *           type: string
 *           description: ID của sản phẩm
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *         description:
 *           type: string
 *           description: Mô tả sản phẩm
 *         price:
 *           type: number
 *           description: Giá sản phẩm
 *         imgUrl:
 *           type: string
 *           description: URL hình ảnh sản phẩm
 *         category:
 *           type: string
 *           description: Danh mục sản phẩm
 *         countInStock:
 *           type: number
 *           description: Số lượng sản phẩm trong kho
 *         rating:
 *           type: number
 *           description: Đánh giá sản phẩm
 *         numReviews:
 *           type: number
 *           description: Số lượt đánh giá
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               user:
 *                 type: string
 *         deleted:
 *           type: boolean
 *           description: Trạng thái xóa của sản phẩm
 */

/**
 * @swagger
 * /api/v1/product/get-products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm lấy thành công
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     code:
 *                       type: number
 *                     message:
 *                       type: string
 *       500:
 *         description: Lỗi server
 */
router.get("/get-products", ProductController.getProducts)

/**
 * @swagger
 * /api/v1/product/get-product:
 *   post:
 *     summary: Lấy thông tin chi tiết một sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pid
 *             properties:
 *               pid:
 *                 type: string
 *                 description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm lấy thành công
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     code:
 *                       type: number
 *                     message:
 *                       type: string
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
router.post("/get-product",validateToken,validateScehma(ProductYup.getProduct),ProductController.getProduct)

/**
 * @swagger
 * /api/v1/product/add-product:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - countInStock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imgUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               countInStock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/add-product", validateToken ,validateScehma(ProductYup.addProduct), ProductController.addProduct)

/**
 * @swagger
 * /api/v1/product/create-product:
 *   post:
 *     summary: Thêm sản phẩm mới (alias của add-product)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - countInStock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imgUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               countInStock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/create-product", validateToken ,validateScehma(ProductYup.addProduct), ProductController.addProduct)

/**
 * @swagger
 * /api/v1/product/add-product-review:
 *   post:
 *     summary: Thêm đánh giá cho sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pid
 *               - rating
 *               - comment
 *             properties:
 *               pid:
 *                 type: string
 *                 description: ID của sản phẩm
 *               rating:
 *                 type: number
 *                 description: Điểm đánh giá (1-5)
 *               comment:
 *                 type: string
 *                 description: Nội dung đánh giá
 *     responses:
 *       200:
 *         description: Đánh giá đã được thêm thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
router.post("/add-product-review", validateToken ,validateScehma(ProductYup.addReviews), ProductController.addReviews)

/**
 * @swagger
 * /api/v1/product/delete-product:
 *   post:
 *     summary: Xóa một sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pid
 *             properties:
 *               pid:
 *                 type: string
 *                 description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
router.post("/delete-product", validateToken ,validateScehma(ProductYup.deleteProduct), ProductController.deleteProduct)

/**
 * @swagger
 * /api/v1/product/update-product:
 *   post:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pid
 *             properties:
 *               pid:
 *                 type: string
 *                 description: ID của sản phẩm
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imgUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               countInStock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
router.post("/update-product", validateToken ,validateScehma(ProductYup.updateProduct), ProductController.updateProduct)

/**
 * @swagger
 * /api/v1/product/upload-image:
 *   post:
 *     summary: Tải lên hình ảnh cho sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imgUrl
 *             properties:
 *               imgUrl:
 *                 type: string
 *                 description: URL hình ảnh dạng base64
 *     responses:
 *       200:
 *         description: Hình ảnh đã được tải lên thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/upload-image", validateToken, validateScehma(ProductYup.uploadImage), ProductController.uploadProductImage)

/**
 * @swagger
 * /api/v1/product/get-categories:
 *   get:
 *     summary: Lấy danh sách tất cả các danh mục sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách danh mục lấy thành công
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     code:
 *                       type: number
 *                     message:
 *                       type: string
 *       500:
 *         description: Lỗi server
 */
router.get("/get-categories", ProductController.getCategories)

export default router