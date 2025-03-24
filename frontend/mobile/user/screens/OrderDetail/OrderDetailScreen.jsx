import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/vi';
import { Colors } from '../../constants/Colors';
import { getOrderDetail, cancelOrder, openVNPayPaymentPage } from '../../services/OrderService';
import PaymentHistorySection from './PaymentHistorySection';

moment.locale('vi');

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrderDetail();
  }, []);
  
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(orderId);
      
      if (response.success) {
        setOrder(response.data.order);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải thông tin đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi người dùng nhấn vào một mục trong lịch sử thanh toán
  const handleViewPaymentDetail = (paymentItem) => {
    // Hiển thị thông tin chi tiết về giao dịch thanh toán
    Alert.alert(
      'Chi tiết giao dịch',
      `Phương thức: ${getPaymentMethodText(paymentItem?.provider || 'Không xác định')}\n` +
      `Trạng thái: ${getStatusText(paymentItem?.status || 'pending')}\n` +
      `Số tiền: ${paymentItem?.amount?.toLocaleString('vi-VN') || 'Không xác định'}đ\n` +
      `Thời gian: ${moment(paymentItem?.timestamp || '').format('DD/MM/YYYY HH:mm')}\n` +
      (paymentItem?.transactionId ? `Mã giao dịch: ${paymentItem?.transactionId || 'Không xác định'}\n` : '') +
      (paymentItem?.responseCode ? `Mã phản hồi: ${paymentItem?.responseCode || 'Không xác định'}\n` : '') +
      (paymentItem?.responseMessage ? `Thông báo: ${paymentItem?.responseMessage}\n` : '') +
      (paymentItem?.note ? `Ghi chú: ${paymentItem?.note}` : '')
    );
  };

  // Hàm helper để hiển thị text của trạng thái thanh toán
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang chờ';
      case 'processing':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      case 'refunded':
        return 'Hoàn tiền';
      default:
        return 'Không xác định';
    }
  };

  // Hàm helper để hiển thị text của phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'vnpay':
        return 'VNPay';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      default:
        return method || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Lấy thông tin trạng thái
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending':
        return { color: Colors.warning, icon: 'time-outline', label: 'Chờ xác nhận' };
      case 'processing':
        return { color: Colors.info, icon: 'sync-outline', label: 'Đang xử lý' };
      case 'shipped':
        return { color: Colors.primary, icon: 'cube-outline', label: 'Đang giao hàng' };
      case 'delivered':
        return { color: Colors.success, icon: 'checkmark-circle-outline', label: 'Đã giao hàng' };
      case 'cancelled':
        return { color: Colors.error, icon: 'close-circle-outline', label: 'Đã hủy' };
      default:
        return { color: Colors.gray, icon: 'help-circle-outline', label: 'Không xác định' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#404040" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Thông tin trạng thái */}
      <View style={[styles.statusContainer, { backgroundColor: statusInfo.color + '20' }]}>
        <Ionicons name={statusInfo.icon} size={30} color={statusInfo.color} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{statusInfo.label}</Text>
          <Text style={styles.statusDescription}>
            {order.status === 'pending' && 'Đơn hàng của bạn đang chờ xác nhận'}
            {order.status === 'processing' && 'Đơn hàng của bạn đang được xử lý'}
            {order.status === 'shipped' && 'Đơn hàng của bạn đang được giao đến bạn'}
            {order.status === 'delivered' && 'Đơn hàng đã được giao thành công'}
            {order.status === 'cancelled' && 'Đơn hàng đã bị hủy'}
          </Text>
        </View>
      </View>
      
      {/* Phần thông tin đơn hàng */}
      {/* ... (Các phần hiển thị thông tin đơn hàng, địa chỉ, sản phẩm) ... */}
      
      {/* Phần hiển thị lịch sử thanh toán */}
      {order.paymentHistory && order.paymentHistory.length > 0 && (
        <PaymentHistorySection 
          paymentHistory={order.paymentHistory} 
          onViewPaymentDetail={handleViewPaymentDetail} 
        />
      )}
      
      {/* Phần hành động */}
      <View style={styles.actionContainer}>
        {/* Nút thanh toán nếu đơn hàng chưa thanh toán và đang ở trạng thái pending/processing */}
        {order.paymentStatus === 'pending' && (order.status === 'pending' || order.status === 'processing') && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePayNow()}
          >
            <Text style={styles.payButtonText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        )}
        
        {/* Nút hủy đơn hàng nếu đơn hàng có thể hủy */}
        {(order.status === 'pending' || order.status === 'processing') && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder()}
          >
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#404040',
  },
  statusContainer: {
    flexDirection: 'row',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    marginVertical: 20,
  },
  payButton: {
    backgroundColor: Colors.success,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen; 