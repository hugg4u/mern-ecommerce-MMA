const orderStatus = [
    'pending',        // Đơn hàng chờ xác nhận
    'processing',     // Đơn hàng đang xử lý
    'shipped',        // Đơn hàng đã gửi hàng
    'delivered',      // Đơn hàng đã giao
    'cancelled',      // Đơn hàng đã hủy
    'returned',       // Đơn hàng đã trả lại
    'refunded'        // Đơn hàng đã hoàn tiền
];

const paymentStatus = [
    'pending',        // Chưa thanh toán
    'completed',      // Đã thanh toán
    'failed',         // Thanh toán thất bại
    'refunded'        // Đã hoàn tiền
];

const paymentMethods = [
    'cod',            // Thanh toán khi nhận hàng
    'banking',        // Chuyển khoản ngân hàng
    'momo',           // Ví điện tử MoMo
    'zalopay',        // Ví điện tử ZaloPay
    'vnpay'           // VNPay
];

export { orderStatus, paymentStatus, paymentMethods };
export default orderStatus; 