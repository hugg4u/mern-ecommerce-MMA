import express from 'express';
import { 
  createVNPayPaymentUrl, 
  handleVNPayCallback, 
  checkPaymentStatus,
  verifyPaymentStatus,
  getPaymentTroubleshooting
} from '../../Controller/Payment/VNPayController.js';
import { verifyToken } from '../../MiddleWare/CheckAuth.js';

const router = express.Router();

// Routes cho thanh toán VNPay
router.post('/vnpay/create-payment-url', verifyToken, createVNPayPaymentUrl);
router.get('/vnpay/callback', handleVNPayCallback);
// Thêm route mới cho url callback chuẩn theo .env
router.get('/vnpay_return', handleVNPayCallback);
router.get('/vnpay/status/:orderId', verifyToken, checkPaymentStatus);
router.get('/vnpay/verify/:orderId', verifyToken, verifyPaymentStatus);
router.get('/vnpay/troubleshooting/:errorCode', getPaymentTroubleshooting);

export default router; 