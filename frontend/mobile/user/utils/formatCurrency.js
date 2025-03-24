/**
 * Hàm định dạng số thành định dạng tiền tệ VND
 * @param {number} amount - Số tiền cần định dạng
 * @param {string} currencySymbol - Ký hiệu tiền tệ (mặc định là đ)
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount, currencySymbol = 'đ') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    console.log('Invalid amount for formatting:', amount);
    return '0 ' + currencySymbol;
  }

  try {
    // Định dạng số với dấu phân cách hàng nghìn
    const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);
    return formattedAmount + ' ' + currencySymbol;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return amount.toString() + ' ' + currencySymbol;
  }
};

/**
 * Hàm định dạng số thành định dạng tiền tệ VND ngắn gọn (ví dụ: 1.5Tr)
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng ngắn gọn
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    console.log('Invalid amount for compact formatting:', amount);
    return '0đ';
  }

  try {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + 'T';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'Tr';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    } else {
      return amount.toString() + 'đ';
    }
  } catch (error) {
    console.error('Error formatting compact currency:', error);
    return amount.toString() + 'đ';
  }
};

export default formatCurrency; 