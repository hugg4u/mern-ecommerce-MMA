import { createPaymentUrl, verifyReturnUrl, queryTransaction } from '../../Utils/VNPay/vnpay.js';
import Order from '../../Model/Order.js';
import User from '../../Model/User.js';
import { orderStatus, paymentStatus } from '../../Utils/Constants/OrderStatus.js';
import ResponseHandler from '../../Utils/ResponseHandler.js';
import formatCurrency from '../../Utils/FormatCurrency.js';
import EmailService from '../../Utils/EmailService.js';

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const createVNPayPaymentUrl = async (req, res) => {
  try {
    const { orderId } = req.body;
    const { _id: userId } = req.user;

    console.log('Creating VNPay payment URL for order:', orderId, 'by user:', userId);

    // Kiểm tra đơn hàng
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return ResponseHandler.error(res, 404, 'Không tìm thấy đơn hàng');
    }

    console.log('Order found:', order._id, 'Order number:', order.orderNumber, 'Total:', order.total);

    // Kiểm tra tổng tiền đơn hàng, đảm bảo không quá lớn
    if (!order.total || order.total <= 0 || order.total > 1000000000) { // Tối đa 1 tỷ VND
      console.error('Invalid order total amount:', order.total);
      return ResponseHandler.error(res, 400, 'Số tiền đơn hàng không hợp lệ');
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'pending' && order.status !== 'processing') {
      console.error('Order not in valid status:', order.status);
      return ResponseHandler.error(res, 400, 'Đơn hàng không ở trạng thái có thể thanh toán');
    }

    // Kiểm tra trạng thái thanh toán
    if (order.paymentStatus === 'completed') {
      console.error('Order already paid:', orderId);
      return ResponseHandler.error(res, 400, 'Đơn hàng này đã được thanh toán');
    }

    // Thêm deep link để quay lại app
    const returnUrl = process.env.VNP_RETURN_URL || `${process.env.CLIENT_URL}/payment/callback`;
    const deepLink = `${process.env.APP_DEEP_LINK || 'helashop://'}order/${orderId}`;

    console.log('Return URL:', returnUrl);
    console.log('Deep link:', deepLink);

    // Tạo mã đơn hàng cho VNPay - phải là chuỗi ký tự hoặc số, không chứa ký tự đặc biệt
    // Sử dụng order.orderNumber để đảm bảo tính duy nhất và định dạng phù hợp
    const vnpTxnRef = order.orderNumber || `ORD-${Math.floor(Date.now() / 1000).toString()}`;
    console.log('VNPay transaction reference:', vnpTxnRef);

    // Lưu vào lịch sử thanh toán
    order.paymentHistory.push({
      status: 'pending',
      provider: 'vnpay',
      amount: order.total,
      timestamp: new Date(),
      note: 'Khởi tạo thanh toán qua VNPay'
    });

    // Tạo URL thanh toán
    const paymentUrl = createPaymentUrl({
      orderId: vnpTxnRef,
      amount: order.total,
      orderInfo: `Thanh toan don hang ${vnpTxnRef}`, // Chuỗi đơn giản, không dấu, không ký tự đặc biệt
      ipAddr: req.ip === '::1' ? '127.0.0.1' : (req.ip || '127.0.0.1'),
      returnUrl: returnUrl
    });

    console.log('Payment URL created:', paymentUrl);

    // Cập nhật đơn hàng
    order.paymentProvider = 'vnpay';
    await order.save();

    // Trả về URL thanh toán
    return ResponseHandler.success(res, {
      paymentUrl,
      orderId: order._id,
      orderNumber: order.orderNumber,
      deepLink
    });
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    return ResponseHandler.error(res, 500, 'Đã có lỗi xảy ra khi tạo URL thanh toán');
  }
};

/**
 * Xử lý callback từ VNPay
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const handleVNPayCallback = async (req, res) => {
  try {
    const vnpParams = req.query;
    
    // Kiểm tra chữ ký
    const isValidSignature = verifyReturnUrl(vnpParams);
    
    if (!isValidSignature) {
      console.error('Invalid VNPay signature');
      
      // URL chuyển hướng trực tiếp đến ứng dụng - lỗi chữ ký
      const errorMessage = encodeURIComponent('Chữ ký không hợp lệ');
      const redirectUrl = `helashop://payment/error?message=${errorMessage}`;
      
      // Tạo trang HTML với nhiều cách thử redirect khác nhau
      return sendRedirectPage(res, 'Lỗi xác thực', 'Chữ ký không hợp lệ', redirectUrl, false);
    }
    
    // Kiểm tra mã lỗi
    const vnpResponseCode = vnpParams.vnp_ResponseCode;
    const orderNumber = vnpParams.vnp_TxnRef;
    const amount = vnpParams.vnp_Amount / 100; // Chia cho 100 vì VNPay nhân với 100
    const transactionId = vnpParams.vnp_TransactionNo || '';
    const bankCode = vnpParams.vnp_BankCode || '';
    const paymentDate = vnpParams.vnp_PayDate || '';
    const responseMessage = getVNPayResponseMessage(vnpResponseCode);
    
    // Tìm đơn hàng
    const order = await Order.findOne({ orderNumber }).populate('user');
    
    if (!order) {
      console.error(`Order not found: ${orderNumber}`);
      
      // URL chuyển hướng - lỗi không tìm thấy đơn hàng
      const errorMessage = encodeURIComponent('Không tìm thấy đơn hàng');
      const redirectUrl = `helashop://payment/error?message=${errorMessage}`;
      
      return sendRedirectPage(res, 'Lỗi thanh toán', 'Không tìm thấy đơn hàng', redirectUrl, false);
    }
    
    // Kiểm tra số tiền
    if (order.total !== amount) {
      console.error(`Amount mismatch: ${amount} vs ${order.total}`);
      
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        status: 'failed',
        provider: 'vnpay',
        amount: amount,
        transactionId: transactionId,
        responseCode: 'AMOUNT_MISMATCH',
        responseMessage: 'Số tiền thanh toán không khớp với đơn hàng',
        timestamp: new Date(),
        note: `Số tiền thanh toán (${amount}) không khớp với đơn hàng (${order.total})`,
        metadata: vnpParams
      });
      
      await order.save();
      
      // Gửi email thông báo lỗi
      if (order.user && order.user.email) {
        await EmailService.sendPaymentFailedEmail(order, order.user, {
          timestamp: new Date(),
          responseCode: 'AMOUNT_MISMATCH',
          responseMessage: 'Số tiền thanh toán không khớp với đơn hàng',
          amount: amount,
          provider: 'vnpay'
        });
      }
      
      // URL chuyển hướng - lỗi số tiền không khớp
      const redirectUrl = `helashop://payment/error/${order._id}?status=failed&code=AMOUNT_MISMATCH`;
      
      return sendRedirectPage(res, 'Lỗi thanh toán', 'Số tiền thanh toán không khớp với đơn hàng', redirectUrl, false);
    }
    
    // Tạo payload cho lịch sử thanh toán
    const paymentData = {
      provider: 'vnpay',
      transactionId: transactionId,
      amount: amount,
      responseCode: vnpResponseCode,
      responseMessage: responseMessage,
      timestamp: new Date(),
      metadata: {
        bankCode,
        paymentDate,
        ...vnpParams
      }
    };
    
    // Xử lý kết quả thanh toán
    if (vnpResponseCode === '00') {
      // Thanh toán thành công
      order.paymentStatus = 'completed';
      
      // Cập nhật trạng thái đơn hàng nếu đang ở trạng thái chờ thanh toán
      if (order.status === 'pending') {
        order.status = 'processing';
        
        // Cập nhật lịch sử trạng thái
        order.statusHistory.push({
          status: 'processing',
          timestamp: new Date(),
          note: 'Đơn hàng đã được thanh toán qua VNPay'
        });
      }

      // Cập nhật thông tin thanh toán
      order.paymentDetails = {
        provider: 'vnpay',
        transactionId: transactionId,
        paymentDate: new Date(),
        amount: amount,
        rawResponse: JSON.stringify(vnpParams)
      };
      
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        ...paymentData,
        status: 'completed',
        note: 'Thanh toán thành công qua VNPay'
      });
      
      await order.save();
      
      // Gửi email thông báo thanh toán thành công
      if (order.user && order.user.email) {
        await EmailService.sendPaymentSuccessEmail(order, order.user, {
          ...paymentData,
          status: 'completed'
        });
      }
      
      // URL chuyển hướng - thanh toán thành công
      const redirectUrl = `helashop://payment/success/${order._id}?status=success`;
      
      return sendRedirectPage(res, 'Thanh toán thành công', 'Đơn hàng của bạn đã được thanh toán thành công', redirectUrl, true);
    } else {
      // Thanh toán thất bại
      order.paymentStatus = 'failed';
      
      // Cập nhật thông tin thanh toán
      order.paymentDetails = {
        provider: 'vnpay',
        transactionId: transactionId || '',
        paymentDate: new Date(),
        amount: amount,
        errorCode: vnpResponseCode,
        errorMessage: responseMessage,
        rawResponse: JSON.stringify(vnpParams)
      };
      
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        ...paymentData,
        status: 'failed',
        note: 'Thanh toán thất bại qua VNPay: ' + responseMessage
      });
      
      await order.save();
      
      // Gửi email thông báo thanh toán thất bại
      if (order.user && order.user.email) {
        await EmailService.sendPaymentFailedEmail(order, order.user, {
          ...paymentData,
          status: 'failed'
        });
      }
      
      // URL chuyển hướng - thanh toán thất bại
      const redirectUrl = `helashop://payment/error/${order._id}?status=failed&code=${vnpResponseCode}`;
      
      return sendRedirectPage(res, 'Thanh toán thất bại', responseMessage, redirectUrl, false);
    }
  } catch (error) {
    console.error('Error handling VNPay callback:', error);
    
    // Chuyển hướng khi có lỗi
    const errorMessage = encodeURIComponent('Đã có lỗi xảy ra khi xử lý thanh toán');
    const redirectUrl = `helashop://payment/error?message=${errorMessage}`;
    
    return sendRedirectPage(res, 'Có lỗi xảy ra', 'Không thể xác nhận trạng thái thanh toán', redirectUrl, false);
  }
};

/**
 * Hàm gửi trang HTML redirect tới app
 * @param {Object} res - Response object
 * @param {string} title - Tiêu đề trang
 * @param {string} message - Thông báo
 * @param {string} redirectUrl - URL redirect
 * @param {boolean} isSuccess - Là thành công hay thất bại
 */
function sendRedirectPage(res, title, message, redirectUrl, isSuccess) {
  const color = isSuccess ? '#2ecc71' : '#e74c3c';
  const bgColor = isSuccess ? '#eafaf1' : '#fdedec';
  const buttonColor = isSuccess ? '#4CAF50' : '#3498db';
  
  // Tạo trang HTML với nhiều cách để redirect
  const htmlRedirect = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 20px; 
          margin: 0;
          background-color: ${bgColor};
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .container {
          max-width: 90%;
          width: 500px;
          background: white;
          border-radius: 12px;
          padding: 30px 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        h2 { 
          color: ${color}; 
          margin-top: 0;
        }
        p { 
          margin: 20px 0; 
          color: #555;
          line-height: 1.5;
        }
        .countdown {
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
        }
        button { 
          background: ${buttonColor}; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 30px;
          font-size: 16px; 
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .spinner {
          margin: 20px auto;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: ${color};
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${title}</h2>
        <p>${message}</p>
        
        <div class="spinner" id="spinner"></div>
        <p id="redirect-status">Đang chuyển hướng về ứng dụng...</p>
        <p class="countdown" id="countdown">5</p>
        
        <button id="redirect-button" onclick="manualRedirect()">
          Nhấn vào đây để mở ứng dụng
        </button>
      </div>

      <script>
        // Lưu trữ URL redirect
        const redirectUrl = "${redirectUrl}";
        let redirectAttempts = 0;
        let countdownTimer;
        
        // Hàm chuyển hướng thủ công
        function manualRedirect() {
          window.location.href = redirectUrl;
        }
        
        // Hàm đếm ngược
        function startCountdown() {
          let count = 5;
          document.getElementById('countdown').textContent = count;
          
          countdownTimer = setInterval(() => {
            count--;
            document.getElementById('countdown').textContent = count;
            
            if (count <= 0) {
              clearInterval(countdownTimer);
              document.getElementById('countdown').style.display = 'none';
              document.getElementById('redirect-status').textContent = 'Vui lòng nhấn nút bên dưới để mở ứng dụng';
              document.getElementById('spinner').style.display = 'none';
            }
          }, 1000);
        }
        
        // Thử nhiều cách để mở app
        function tryRedirectToApp() {
          redirectAttempts++;
          
          if (redirectAttempts > 3) {
            document.getElementById('redirect-status').textContent = 'Vui lòng nhấn nút bên dưới để mở ứng dụng';
            document.getElementById('spinner').style.display = 'none';
            return;
          }
          
          // Thử cách 1: location.href
          window.location.href = redirectUrl;
          
          // Thử cách 2: window.open
          setTimeout(() => {
            window.open(redirectUrl, '_self');
          }, 500);
          
          // Thử cách 3: iframe
          setTimeout(() => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = redirectUrl;
            document.body.appendChild(iframe);
          }, 1000);
        }
        
        // Chạy khi trang load xong
        window.onload = function() {
          // Bắt đầu đếm ngược
          startCountdown();
          
          // Thử chuyển hướng ngay lập tức
          tryRedirectToApp();
          
          // Thử lại sau 1.5 giây
          setTimeout(tryRedirectToApp, 1500);
        }
      </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  return res.send(htmlRedirect);
}

/**
 * API kiểm tra trạng thái thanh toán
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id: userId } = req.user;

    // Tìm đơn hàng
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      return ResponseHandler.error(res, 404, 'Không tìm thấy đơn hàng');
    }

    // Lấy lịch sử thanh toán gần nhất
    const latestPayment = order.paymentHistory && order.paymentHistory.length > 0 
      ? order.paymentHistory[order.paymentHistory.length - 1] 
      : null;

    // Trả về trạng thái thanh toán
    return ResponseHandler.success(res, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails || {},
      latestPayment
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return ResponseHandler.error(res, 500, 'Đã có lỗi xảy ra khi kiểm tra trạng thái thanh toán');
  }
};

/**
 * API kiểm tra lại trạng thái giao dịch VNPay
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const verifyPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id: userId } = req.user;

    // Tìm đơn hàng
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      return ResponseHandler.error(res, 404, 'Không tìm thấy đơn hàng');
    }

    // Kiểm tra nếu đơn hàng đã thanh toán thành công
    if (order.paymentStatus === 'completed') {
      return ResponseHandler.success(res, {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        message: 'Đơn hàng đã được thanh toán thành công'
      });
    }

    // Nếu không có thông tin thanh toán hoặc không phải VNPay
    if (!order.paymentProvider || order.paymentProvider !== 'vnpay') {
      return ResponseHandler.error(res, 400, 'Đơn hàng không được thanh toán qua VNPay');
    }

    // Tìm lần giao dịch gần nhất
    const lastPaymentAttempt = order.paymentHistory && order.paymentHistory.length > 0
      ? order.paymentHistory[order.paymentHistory.length - 1]
      : null;

    if (!lastPaymentAttempt || !lastPaymentAttempt.metadata || !lastPaymentAttempt.metadata.paymentDate) {
      return ResponseHandler.error(res, 400, 'Không có thông tin giao dịch để kiểm tra');
    }

    // Kiểm tra trạng thái giao dịch qua VNPay API
    const queryResult = await queryTransaction(
      order.orderNumber,
      order.total,
      lastPaymentAttempt.metadata.paymentDate
    );

    if (!queryResult || !queryResult.vnp_ResponseCode) {
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        status: 'failed',
        provider: 'vnpay',
        amount: order.total,
        responseCode: 'API_ERROR',
        responseMessage: 'Không thể kiểm tra trạng thái giao dịch',
        timestamp: new Date(),
        note: 'Lỗi khi gọi API kiểm tra trạng thái VNPay',
        metadata: queryResult || {}
      });

      await order.save();

      return ResponseHandler.error(res, 500, 'Không thể kiểm tra trạng thái giao dịch');
    }

    // Xử lý kết quả kiểm tra
    const vnpResponseCode = queryResult.vnp_ResponseCode;
    const transactionId = queryResult.vnp_TransactionNo || '';
    const responseMessage = getVNPayResponseMessage(vnpResponseCode);

    // Thêm vào lịch sử thanh toán
    const paymentData = {
      provider: 'vnpay',
      transactionId: transactionId,
      amount: order.total,
      responseCode: vnpResponseCode,
      responseMessage: responseMessage,
      timestamp: new Date(),
      metadata: queryResult
    };

    if (vnpResponseCode === '00') {
      // Giao dịch thành công
      order.paymentStatus = 'completed';
      
      // Cập nhật trạng thái đơn hàng nếu đang ở trạng thái chờ thanh toán
      if (order.status === 'pending') {
        order.status = 'processing';
        
        // Cập nhật lịch sử trạng thái
        order.statusHistory.push({
          status: 'processing',
          timestamp: new Date(),
          note: 'Đơn hàng đã được thanh toán qua VNPay (xác nhận lại)'
        });
      }

      // Cập nhật thông tin thanh toán
      order.paymentDetails = {
        provider: 'vnpay',
        transactionId: transactionId,
        paymentDate: new Date(),
        amount: order.total,
        rawResponse: JSON.stringify(queryResult)
      };
      
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        ...paymentData,
        status: 'completed',
        note: 'Xác nhận lại: Thanh toán thành công qua VNPay'
      });
      
      await order.save();
      
      // Gửi email thông báo thanh toán thành công
      const user = await User.findById(order.user);
      if (user && user.email) {
        await EmailService.sendPaymentSuccessEmail(order, user, {
          ...paymentData,
          status: 'completed'
        });
      }
      
      return ResponseHandler.success(res, {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        message: 'Xác nhận lại: Đơn hàng đã được thanh toán thành công',
        transactionDetails: queryResult
      });
    } else {
      // Giao dịch thất bại
      order.paymentStatus = 'failed';
      
      // Cập nhật thông tin thanh toán
      order.paymentDetails = {
        provider: 'vnpay',
        transactionId: transactionId,
        paymentDate: new Date(),
        amount: order.total,
        errorCode: vnpResponseCode,
        errorMessage: responseMessage,
        rawResponse: JSON.stringify(queryResult)
      };
      
      // Thêm vào lịch sử thanh toán
      order.paymentHistory.push({
        ...paymentData,
        status: 'failed',
        note: 'Xác nhận lại: Thanh toán thất bại qua VNPay: ' + responseMessage
      });
      
      await order.save();
      
      return ResponseHandler.error(res, 400, `Thanh toán thất bại: ${responseMessage}`, {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        errorCode: vnpResponseCode,
        errorMessage: responseMessage,
        transactionDetails: queryResult
      });
    }
  } catch (error) {
    console.error('Error verifying payment status:', error);
    return ResponseHandler.error(res, 500, 'Đã có lỗi xảy ra khi kiểm tra trạng thái thanh toán');
  }
};

/**
 * Lấy mô tả lỗi từ mã lỗi VNPay
 * @param {string} responseCode - Mã lỗi VNPay
 * @returns {string} Mô tả lỗi
 */
function getVNPayResponseMessage(responseCode) {
  const messages = {
    '00': 'Giao dịch thành công',
    '01': 'Giao dịch đã tồn tại',
    '02': 'Merchant không hợp lệ',
    '03': 'Dữ liệu gửi sang không đúng định dạng',
    '04': 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
    '05': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định.',
    '06': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '08': 'Giao dịch không thành công. Tài khoản không đủ số dư để thực hiện giao dịch.',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ',
    '10': 'Xác thực OTP không thành công',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán nhiều lần',
    '99': 'Lỗi không xác định',
  };
  
  return messages[responseCode] || 'Lỗi không xác định';
}

/**
 * Hướng dẫn thanh toán lại nếu gặp lỗi
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getPaymentTroubleshooting = async (req, res) => {
  try {
    const { errorCode } = req.params;
    
    // Mô tả lỗi
    const errorMessage = getVNPayResponseMessage(errorCode);
    
    // Hướng dẫn khắc phục dựa trên mã lỗi
    let troubleshooting = 'Vui lòng thử lại giao dịch sau vài phút';
    
    switch(errorCode) {
      case '05':
      case '06':
      case '79':
        troubleshooting = 'Vui lòng kiểm tra lại thông tin thẻ/tài khoản và mật khẩu thanh toán';
        break;
      case '08':
      case '51':
        troubleshooting = 'Vui lòng kiểm tra số dư tài khoản của bạn trước khi thực hiện giao dịch';
        break;
      case '09':
        troubleshooting = 'Vui lòng đăng ký dịch vụ thanh toán trực tuyến với ngân hàng của bạn';
        break;
      case '10':
        troubleshooting = 'Vui lòng nhập chính xác mã OTP được gửi đến số điện thoại/email đã đăng ký với ngân hàng';
        break;
      case '11':
        troubleshooting = 'Đã hết thời gian giao dịch. Vui lòng thực hiện lại giao dịch mới';
        break;
      case '24':
        troubleshooting = 'Giao dịch đã bị hủy. Nếu muốn tiếp tục, vui lòng thực hiện lại giao dịch mới';
        break;
      case '75':
        troubleshooting = 'Ngân hàng đang bảo trì. Vui lòng thử lại sau hoặc chọn ngân hàng/phương thức thanh toán khác';
        break;
      case '65':
        troubleshooting = 'Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày. Vui lòng thử lại vào ngày mai hoặc sử dụng phương thức thanh toán khác';
        break;
      default:
        troubleshooting = 'Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng để được trợ giúp';
    }
    
    return ResponseHandler.success(res, {
      errorCode,
      errorMessage,
      troubleshooting,
      contactEmail: process.env.SUPPORT_EMAIL || 'support@helashop.com',
      contactPhone: process.env.SUPPORT_PHONE || '0123456789'
    });
  } catch (error) {
    console.error('Error getting payment troubleshooting:', error);
    return ResponseHandler.error(res, 500, 'Đã có lỗi xảy ra khi lấy thông tin hướng dẫn');
  }
};

export default {
  createVNPayPaymentUrl,
  handleVNPayCallback,
  checkPaymentStatus,
  verifyPaymentStatus,
  getPaymentTroubleshooting
}; 