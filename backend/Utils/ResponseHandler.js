/**
 * Response handler for API responses
 */
class ResponseHandler {
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {Object|Array} data - Data to send in response
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Express response
   */
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Object|Array} data - Additional data
   * @returns {Object} Express response
   */
  static error(res, statusCode = 500, message = 'Internal Server Error', data = {}) {
    return res.status(statusCode).json({
      success: false,
      data,
      message
    });
  }

  /**
   * Send a validation error response
   * @param {Object} res - Express response object
   * @param {Array|Object} errors - Validation errors
   * @returns {Object} Express response
   */
  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      data: { errors },
      message: 'Validation Error'
    });
  }

  /**
   * Send a not found response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @returns {Object} Express response
   */
  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      data: {},
      message
    });
  }

  /**
   * Send a unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @returns {Object} Express response
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      data: {},
      message
    });
  }

  /**
   * Send a forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @returns {Object} Express response
   */
  static forbidden(res, message = 'Forbidden access') {
    return res.status(403).json({
      success: false,
      data: {},
      message
    });
  }
}

export default ResponseHandler; 