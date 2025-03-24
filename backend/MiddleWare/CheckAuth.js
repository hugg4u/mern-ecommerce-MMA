import jwt from 'jsonwebtoken';
import ResponseHandler from '../Utils/ResponseHandler.js';
import User from '../Model/User.js';

/**
 * Verify JWT token from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.error(res, 401, 'Token không hợp lệ hoặc đã hết hạn');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return ResponseHandler.error(res, 401, 'Token không hợp lệ hoặc đã hết hạn');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET || 'helashop-secret');
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return ResponseHandler.error(res, 401, 'Người dùng không tồn tại');
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return ResponseHandler.error(res, 401, 'Token không hợp lệ');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.error(res, 401, 'Token đã hết hạn');
    }
    
    return ResponseHandler.error(res, 500, 'Lỗi xác thực');
  }
};

/**
 * Check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return ResponseHandler.error(res, 403, 'Bạn không có quyền truy cập');
  }
};

/**
 * Check if user is staff or admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    return ResponseHandler.error(res, 403, 'Bạn không có quyền truy cập');
  }
};

export default {
  verifyToken,
  isAdmin,
  isStaffOrAdmin
};