import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Handlebars from 'handlebars';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Đọc nội dung template email
 * @param {string} templateName - Tên file template
 * @returns {string} Nội dung template
 */
const getEmailTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, '../Templates/Emails', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error reading email template ${templateName}:`, error);
    return '';
  }
};

/**
 * Gửi email
 * @param {Object} options - Options cho email
 * @param {string} options.to - Email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.text - Nội dung text (nếu không có HTML)
 * @param {string} options.html - Nội dung HTML
 * @returns {Promise<Object>} Kết quả gửi email
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"HelaShop" <${process.env.MAIL_USERNAME}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo đơn hàng đã được tạo
 * @param {Object} order - Đơn hàng
 * @param {Object} user - Thông tin người dùng
 * @returns {Promise<Object>} Kết quả gửi email
 */
const sendOrderCreatedEmail = async (order, user) => {
  try {
    const template = getEmailTemplate('order-created');
    if (!template) {
      throw new Error('Email template not found');
    }

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName: user.name,
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleString('vi-VN'),
      items: order.items,
      total: order.total.toLocaleString('vi-VN'),
      shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`,
      paymentMethod: order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
                     order.paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 
                     order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' : order.paymentMethod,
      trackingUrl: `${process.env.CLIENT_URL}/order/${order._id}`
    });

    return await sendEmail({
      to: user.email,
      subject: `HelaShop - Đơn hàng #${order.orderNumber} đã được tạo`,
      html
    });
  } catch (error) {
    console.error('Error sending order created email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo thanh toán thành công
 * @param {Object} order - Đơn hàng
 * @param {Object} user - Thông tin người dùng
 * @param {Object} payment - Thông tin thanh toán
 * @returns {Promise<Object>} Kết quả gửi email
 */
const sendPaymentSuccessEmail = async (order, user, payment) => {
  try {
    const template = getEmailTemplate('payment-success');
    if (!template) {
      throw new Error('Email template not found');
    }

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName: user.name,
      orderNumber: order.orderNumber,
      transactionDate: new Date(payment.timestamp).toLocaleString('vi-VN'),
      transactionId: payment.transactionId,
      amount: payment.amount.toLocaleString('vi-VN'),
      paymentMethod: payment.provider === 'vnpay' ? 'VNPay' : payment.provider,
      orderDetails: `${process.env.CLIENT_URL}/order/${order._id}`
    });

    return await sendEmail({
      to: user.email,
      subject: `HelaShop - Thanh toán đơn hàng #${order.orderNumber} thành công`,
      html
    });
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo thanh toán thất bại
 * @param {Object} order - Đơn hàng
 * @param {Object} user - Thông tin người dùng
 * @param {Object} payment - Thông tin thanh toán
 * @returns {Promise<Object>} Kết quả gửi email
 */
const sendPaymentFailedEmail = async (order, user, payment) => {
  try {
    const template = getEmailTemplate('payment-failed');
    if (!template) {
      throw new Error('Email template not found');
    }

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName: user.name,
      orderNumber: order.orderNumber,
      transactionDate: new Date(payment.timestamp).toLocaleString('vi-VN'),
      errorCode: payment.responseCode,
      errorMessage: payment.responseMessage,
      amount: payment.amount.toLocaleString('vi-VN'),
      paymentMethod: payment.provider === 'vnpay' ? 'VNPay' : payment.provider,
      retryUrl: `${process.env.CLIENT_URL}/order/${order._id}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@helashop.com'
    });

    return await sendEmail({
      to: user.email,
      subject: `HelaShop - Thanh toán đơn hàng #${order.orderNumber} thất bại`,
      html
    });
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendOrderCreatedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail
}; 