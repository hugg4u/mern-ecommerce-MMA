import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db.js'
import authRouter from './Routes/Auth/AuthRoute.js'
import productRouter from './Routes/Product/ProductRoute.js'
import orderRouter from './Routes/Order/OrderRoute.js'
import cartRouter from './Routes/Cart/CartRoute.js'
import userRouter from './Routes/Profile/User/UserRoute.js'
// import adminRouter from './Routes/Admin/AdminRoute.js'
import bannerRouter from './Routes/Banner/BannerRoute.js'
// import categoryRouter from './Routes/Category/CategoryRoute.js'
import paymentRouter from './Routes/Payment/PaymentRoute.js'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import db from "./db.js"
import { handleVNPayCallback } from './Controller/Payment/VNPayController.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './Config/SwaggerConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger documentation setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Endpoint to check if the API is running
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get('/', (req, res) => {
    res.send('API is Running!!')
})

// API Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/user', userRouter)
// app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/banner', bannerRouter)
// app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/payment', paymentRouter)

// Thêm route đặc biệt cho callback VNPay theo cấu hình VNP_RETURN_URL
app.get('/api/vnpay_return', handleVNPayCallback)

//db connction
db().then(() => {
    // Khởi tạo tài khoản admin sau khi kết nối cơ sở dữ liệu thành công
    // createAdminUser();
    // seedProducts();
    // seedUsersAndReviews();
    // seedBanner();
});

const PORT = process.env.PORT || 9999
app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
})