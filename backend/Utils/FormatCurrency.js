/**
 * Format a number as Vietnamese currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default formatCurrency; 