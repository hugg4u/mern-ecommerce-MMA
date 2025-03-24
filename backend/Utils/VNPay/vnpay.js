import querystring from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config();

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'DEMO';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:3000/api/v1/payment/vnpay/callback';
const VNP_API_URL = process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} options
 * @param {string} options.orderId - Mã đơn hàng
 * @param {number} options.amount - Số tiền thanh toán (VND)
 * @param {string} options.orderInfo - Thông tin đơn hàng
 * @param {string} options.orderType - Loại hàng hóa (default: other)
 * @param {string} options.bankCode - Mã ngân hàng (optional)
 * @param {string} options.locale - Ngôn ngữ (default: vn)
 * @param {string} options.ipAddr - IP của người dùng
 * @returns {string} URL thanh toán VNPay
 */
export const createPaymentUrl = (options) => {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      orderType = 'other',
      bankCode = '',
      locale = 'vn',
      ipAddr,
      returnUrl = VNP_RETURN_URL
    } = options;

    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    // Chuẩn hóa địa chỉ IP sang IPv4
    const normalizedIpAddr = ipAddr && ipAddr.includes('::ffff:') ? 
      ipAddr.replace('::ffff:', '') : 
      (ipAddr || '127.0.0.1');
    
    // KHÔNG mã hóa orderInfo tại đây - để nguyên giá trị
    // Tạo orderInfo chuẩn, bỏ các ký tự đặc biệt
    const cleanOrderInfo = orderInfo.replace(/[#&=%]/g, '_');
    
    console.log('Normalized IP:', normalizedIpAddr);
    console.log('Clean order info:', cleanOrderInfo);
    console.log('Order amount (original):', amount);
    console.log('Order amount (for VNPay):', amount * 100);

    const vnpParams = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': VNP_TMN_CODE,
      'vnp_Locale': locale,
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': orderId,
      'vnp_OrderInfo': `Thanh toán đơn hàng #${orderId}`,
      'vnp_OrderType': orderType,
      'vnp_Amount': amount * 100, // Số tiền * 100 (VNPay yêu cầu nhân với 100)
      'vnp_ReturnUrl': returnUrl,
      'vnp_IpAddr': normalizedIpAddr,
      'vnp_CreateDate': createDate,
      'vnp_BankCode': 'NCB'
    };

    console.log('VNPay params before sorting:', vnpParams);
    
    // Sắp xếp tham số theo thứ tự a-z
    const sortedParams = sortObject(vnpParams);
    
    // Tạo chuỗi ký tự để hash
    const signData = querystring.stringify(sortedParams, { encode: false });
    console.log('VNPay sign data:', signData);
    
    // Tạo signature
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('VNPay secure hash:', signed);
    
    // Thêm chữ ký vào params
    sortedParams.vnp_SecureHash = signed;
    
    // Tạo URL thanh toán - ĐỪNG encode lại các tham số cho URL cuối cùng
    const paymentUrl = `${VNP_URL}?${querystring.stringify(sortedParams, { encode: false })}`;
    console.log('VNPay payment URL:', paymentUrl);
    return paymentUrl;
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw error;
  }
};

/**
 * Xác thực callback từ VNPay
 * @param {Object} vnpParams - Tham số trả về từ VNPay
 * @returns {boolean} Kết quả xác thực
 */
export const verifyReturnUrl = (vnpParams) => {
  try {
    // Lấy tất cả các tham số trừ vnp_SecureHash
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    if (vnpParams.vnp_SecureHashType) {
      delete vnpParams.vnp_SecureHashType;
    }

    // Sắp xếp tham số theo thứ tự a-z
    const sortedParams = sortObject(vnpParams);
    
    // Tạo chuỗi ký tự để hash
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Tạo signature
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // So sánh chữ ký
    return secureHash === signed;
  } catch (error) {
    console.error('Error verifying VNPay return URL:', error);
    return false;
  }
};

/**
 * Kiểm tra trạng thái giao dịch qua VNPay API
 * @param {string} orderId - Mã đơn hàng
 * @param {number} amount - Số tiền thanh toán
 * @param {string} transactionDate - Ngày giao dịch (yyyyMMddHHmmss)
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
export const queryTransaction = async (orderId, amount, transactionDate) => {
  try {
    const vnpParams = {
      vnp_RequestId: moment().format('HHmmssSSS'),
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Truy van GD ma: ${orderId}`,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
      vnp_IpAddr: '127.0.0.1',
      vnp_Amount: amount * 100,
    };

    // Sắp xếp tham số theo thứ tự a-z
    const sortedParams = sortObject(vnpParams);
    
    // Tạo chuỗi ký tự để hash
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Tạo signature
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Thêm chữ ký vào params
    sortedParams.vnp_SecureHash = signed;

    // Gọi API kiểm tra giao dịch
    const response = await fetch(VNP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sortedParams)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying VNPay transaction:', error);
    throw error;
  }
};

/**
 * Sắp xếp object theo key a-z
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} Object đã sắp xếp
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) {
          str.push(encodeURIComponent(key));
      }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export default {
  createPaymentUrl,
  verifyReturnUrl,
  queryTransaction
}; 