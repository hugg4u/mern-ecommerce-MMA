// Format tiền tệ Việt Nam
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}; 