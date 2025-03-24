import { fetchWithAuth } from '../utils/apiHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { ToastAndroid, Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';

// Hiển thị thông báo trên cả Android và iOS
const showToast = (message) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert('Thông báo', message);
    }
};

// Tạo đơn hàng mới từ giỏ hàng
export const createOrder = async (orderData) => {
    try {
        console.log('Calling API to create order with data:', JSON.stringify(orderData, null, 2));
        console.log('API URL:', `${API_URL}/order/create`);
        const response = await fetchWithAuth(`${API_URL}/order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        console.log('Create order response status:', response.status);
        console.log('Create order response data:', JSON.stringify(response.data, null, 2));
        
        if (!response.ok) {
            console.error('Error creating order:', response.data);
            showToast(response.data?.message || 'Không thể tạo đơn hàng');
            return { success: false, data: response.data };
        }

        console.log('Order created successfully:', response.data);
        showToast('Đặt hàng thành công');
        
        // Thông báo rằng có thể tiếp tục mua sắm với các sản phẩm còn lại trong giỏ hàng
        setTimeout(() => {
            showToast('Giỏ hàng của bạn đã được cập nhật, những sản phẩm khác vẫn được giữ lại');
        }, 1000);
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Exception in createOrder service:', error);
        showToast('Lỗi khi tạo đơn hàng. Vui lòng thử lại sau');
        return { success: false, error: error.message };
    }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async (status = 'all', page = 1, limit = 10) => {
    try {
        console.log(`Fetching user orders with status: ${status}, page: ${page}, limit: ${limit}`);
        const response = await fetchWithAuth(
            `${API_URL}/order/my-orders?status=${status}&page=${page}&limit=${limit}`,
            {
                method: 'GET',
            }
        );

        console.log('Get user orders response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error fetching orders:', errorData);
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log(`Fetched ${data.data?.orders?.length} orders`);
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in getUserOrders service:', error);
        return { success: false, error: error.message };
    }
};

// Lấy chi tiết một đơn hàng
export const getOrderDetail = async (orderId) => {
    try {
        console.log(`Fetching order detail for id: ${orderId}`);
        const response = await fetchWithAuth(
            `${API_URL}/order/my-orders/${orderId}`,
            {
                method: 'GET',
            }
        );

        console.log('Get order detail response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error fetching order detail:', errorData);
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('Order detail fetched successfully');
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in getOrderDetail service:', error);
        return { success: false, error: error.message };
    }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId, cancelReason) => {
    try {
        console.log(`Cancelling order with id: ${orderId}, reason: ${cancelReason}`);
        const response = await fetchWithAuth(
            `${API_URL}/order/cancel/${orderId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cancelReason }),
            }
        );

        console.log('Cancel order response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error cancelling order:', errorData);
            showToast(errorData.data?.message || 'Không thể hủy đơn hàng');
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('Order cancelled successfully');
        showToast('Hủy đơn hàng thành công');
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in cancelOrder service:', error);
        showToast('Lỗi khi hủy đơn hàng. Vui lòng thử lại sau');
        return { success: false, error: error.message };
    }
};

// Tạo URL thanh toán VNPay
export const createVNPayPaymentUrl = async (orderId) => {
    try {
        console.log(`Creating VNPay payment URL for order: ${orderId}`);
        const response = await fetchWithAuth(
            `${API_URL}/payment/vnpay/create-payment-url`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            }
        );

        console.log('Create VNPay payment URL response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error creating VNPay payment URL:', errorData);
            showToast(errorData.data?.message || 'Không thể tạo URL thanh toán');
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('VNPay payment URL created successfully:', data);
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in createVNPayPaymentUrl service:', error);
        showToast('Lỗi khi tạo URL thanh toán. Vui lòng thử lại sau');
        return { success: false, error: error.message };
    }
};

// Mở trang thanh toán VNPay
export const openVNPayPaymentPage = async (orderId) => {
    try {
        // Tạo URL thanh toán
        console.log('Attempting to create payment URL for order:', orderId);
        const paymentUrlResponse = await createVNPayPaymentUrl(orderId);
        
        if (!paymentUrlResponse.success) {
            console.error('Không thể tạo URL thanh toán VNPay:', JSON.stringify(paymentUrlResponse, null, 2));
            showToast('Không thể tạo URL thanh toán. Vui lòng thử lại sau');
            return paymentUrlResponse;
        }
        
        console.log('Payment URL created:', paymentUrlResponse.data.paymentUrl);
        let { paymentUrl } = paymentUrlResponse.data;
        
        // Kiểm tra xem URL có đúng định dạng không
        if (!paymentUrl || !paymentUrl.includes('vpcpay.html')) {
            console.error('URL thanh toán không hợp lệ:', paymentUrl);
            showToast('URL thanh toán không hợp lệ. Vui lòng liên hệ hỗ trợ.');
            return { success: false, error: 'Invalid payment URL', url: paymentUrl };
        }
        
        // Kiểm tra xem URL có chứa mã lỗi không
        if (paymentUrl.includes('Error.html')) {
            const errorCode = paymentUrl.match(/code=(\d+)/)?.[1] || 'unknown';
            const errorMessage = getVNPayErrorMessage(errorCode);
            console.error(`URL thanh toán có lỗi code ${errorCode}:`, errorMessage);
            showToast(`Lỗi thanh toán: ${errorMessage}`);
            return { success: false, error: errorMessage, code: errorCode, url: paymentUrl };
        }
        
        // Thêm tham số cho URL callback để quay lại ứng dụng
        const callbackUrl = encodeURIComponent(`helashop://payment/success/${orderId}`);
        const errorCallbackUrl = encodeURIComponent(`helashop://payment/error/${orderId}`);
        
        // Kiểm tra nếu URL đã có tham số hay chưa
        if (paymentUrl.includes('?')) {
            paymentUrl += `&vnp_ReturnUrl=${callbackUrl}&vnp_ErrorUrl=${errorCallbackUrl}`;
        } else {
            paymentUrl += `?vnp_ReturnUrl=${callbackUrl}&vnp_ErrorUrl=${errorCallbackUrl}`;
        }
        
        console.log('Final payment URL with callback:', paymentUrl);
        
        // Mở trang thanh toán trong trình duyệt
        const supported = await Linking.canOpenURL(paymentUrl);
        
        if (supported) {
            console.log('Opening payment URL...');
            await Linking.openURL(paymentUrl);
            return { success: true };
        } else {
            console.error('Cannot open URL:', paymentUrl);
            showToast('Không thể mở trang thanh toán. URL không được hỗ trợ');
            return { success: false, error: 'Cannot open URL', url: paymentUrl };
        }
    } catch (error) {
        console.error('Exception in openVNPayPaymentPage service:', error);
        showToast('Lỗi khi mở trang thanh toán: ' + (error.message || 'Lỗi không xác định'));
        return { success: false, error: error.message };
    }
};

// Hàm lấy thông báo lỗi từ mã lỗi VNPay
const getVNPayErrorMessage = (errorCode) => {
    const errorMessages = {
        '01': 'Giao dịch đã tồn tại',
        '02': 'Merchant không hợp lệ',
        '03': 'Dữ liệu gửi sang không đúng định dạng',
        '04': 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
        '05': 'Quý khách nhập sai mật khẩu thanh toán quá số lần quy định',
        '06': 'Quý khách nhập sai mật khẩu xác thực giao dịch',
        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ',
        '08': 'Tài khoản không đủ số dư để thực hiện giao dịch',
        '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ',
        '10': 'Xác thực OTP không thành công',
        '11': 'Đã hết hạn chờ thanh toán',
        '24': 'Khách hàng hủy giao dịch',
        '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
        '65': 'Tài khoản vượt quá hạn mức giao dịch trong ngày',
        '75': 'Ngân hàng thanh toán đang bảo trì',
        '99': 'Lỗi không xác định',
    };
    
    return errorMessages[errorCode] || 'Lỗi không xác định';
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (orderId) => {
    try {
        console.log(`Checking payment status for order: ${orderId}`);
        const response = await fetchWithAuth(
            `${API_URL}/payment/vnpay/status/${orderId}`,
            {
                method: 'GET',
            }
        );

        console.log('Check payment status response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error checking payment status:', errorData);
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('Payment status checked successfully:', data);
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in checkPaymentStatus service:', error);
        return { success: false, error: error.message };
    }
};

// Hàm xác thực trạng thái thanh toán với VNPay
export const verifyPaymentStatus = async (orderId) => {
    try {
        console.log(`Verifying payment status for order: ${orderId}`);
        const response = await fetchWithAuth(
            `${API_URL}/payment/vnpay/verify/${orderId}`,
            {
                method: 'GET',
            }
        );

        console.log('Verify payment status response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error verifying payment status:', errorData);
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('Payment status verified successfully:', data);
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in verifyPaymentStatus service:', error);
        return { success: false, error: error.message };
    }
};

// Hàm lấy hướng dẫn khắc phục lỗi thanh toán
export const getPaymentTroubleshooting = async (errorCode) => {
    try {
        console.log(`Getting troubleshooting for error code: ${errorCode}`);
        const response = await fetchWithAuth(
            `${API_URL}/payment/vnpay/troubleshooting/${errorCode}`,
            {
                method: 'GET',
            }
        );

        console.log('Get troubleshooting response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.data;
            console.error('Error getting troubleshooting:', errorData);
            return { success: false, data: errorData };
        }

        const data = await response.data;
        console.log('Troubleshooting fetched successfully:', data);
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Exception in getPaymentTroubleshooting service:', error);
        return { success: false, error: error.message };
    }
}; 