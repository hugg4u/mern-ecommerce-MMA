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
import { Colors } from '../../constants/Colors';
import { getOrderDetail, cancelOrder, openVNPayPaymentPage } from '../../services/OrderService';

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId, requestPayment } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrderDetail();
  }, []);
  
  // Nếu có yêu cầu thanh toán lại, tự động mở màn hình thanh toán
  useEffect(() => {
    const handleAutoRequestPayment = async () => {
      if (requestPayment && order && order.status === 'pending' && !order.isPaid) {
        console.log('Auto requesting payment for order:', orderId);
        handlePayWithVNPay();
      }
    };
    
    if (!loading) {
      handleAutoRequestPayment();
    }
  }, [loading, requestPayment, order]);
  
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
  
  // Xử lý hủy đơn hàng
  const handleCancelOrder = () => {
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có, hủy đơn hàng', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await cancelOrder(orderId, 'Người dùng chủ động hủy đơn hàng');
              
              if (response.success) {
                // Cập nhật lại thông tin đơn hàng
                setOrder(response.data.order);
                Alert.alert('Thành công', 'Đơn hàng đã được hủy thành công');
              } else {
                Alert.alert('Lỗi', response.data?.message || 'Không thể hủy đơn hàng');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi hủy đơn hàng');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }
  
  if (!order) {
    return null;
  }
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };
  
  // Get status information
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending':
        return { color: Colors.warning, label: 'Chờ xác nhận', icon: 'time-outline' };
      case 'processing':
        return { color: '#FFC107', label: 'Đang xử lý', icon: 'settings-outline' };
      case 'shipped':
        return { color: '#3F51B5', label: 'Đang giao hàng', icon: 'car-outline' };
      case 'delivered':
        return { color: Colors.success, label: 'Đã giao hàng', icon: 'checkmark-circle-outline' };
      case 'cancelled':
        return { color: Colors.error, label: 'Đã hủy', icon: 'close-circle-outline' };
      case 'returned':
        return { color: '#FF5722', label: 'Đã trả hàng', icon: 'return-down-back-outline' };
      case 'refunded':
        return { color: '#9C27B0', label: 'Đã hoàn tiền', icon: 'cash-outline' };
      default:
        return { color: '#808080', label: 'Không xác định', icon: 'help-circle-outline' };
    }
  };
  
  const statusInfo = getStatusInfo(order.status);
  
  // Kiểm tra xem có thể hủy đơn hàng hay không
  const canCancel = order && (order.status === 'pending' || order.status === 'processing');
  
  // Kiểm tra xem có thể thanh toán hay không
  const canPay = order && order.paymentStatus === 'pending' && 
                (order.paymentMethod === 'vnpay' || order.paymentMethod === 'banking');
  
  // Xử lý thanh toán
  const handlePayment = async () => {
    try {
      setLoading(true);
      const paymentResponse = await openVNPayPaymentPage(order._id);
      
      if (!paymentResponse.success) {
        Alert.alert('Lỗi', 'Không thể mở trang thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi mở trang thanh toán');
    } finally {
      setLoading(false);
    }
  };
  
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
            {order.status === 'returned' && 'Đơn hàng đã được trả lại'}
            {order.status === 'refunded' && 'Đơn hàng đã được hoàn tiền'}
          </Text>
        </View>
      </View>
      
      {/* Thông tin đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
          <Text style={styles.infoValue}>{order.orderNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày đặt hàng:</Text>
          <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.infoValue}>
            {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
             order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' : 
             order.paymentMethod}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái thanh toán:</Text>
          <Text style={[
            styles.infoValue, 
            { color: order.paymentStatus === 'completed' ? Colors.success : Colors.warning }
          ]}>
            {order.paymentStatus === 'pending' ? 'Chưa thanh toán' : 
             order.paymentStatus === 'completed' ? 'Đã thanh toán' : 
             order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 
             order.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 
             order.paymentStatus}
          </Text>
        </View>
      </View>
      
      {/* Địa chỉ giao hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
        <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
        <Text style={styles.addressDetail}>
          {order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.province}
        </Text>
        {order.shippingAddress.note && (
          <Text style={styles.addressNote}>Ghi chú: {order.shippingAddress.note}</Text>
        )}
      </View>
      
      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.productItem}>
            <Image 
              source={{ uri: item.imgUrl }} 
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.productPriceContainer}>
                <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.productQuantity}>x{item.quantity}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      {/* Thông tin thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Tạm tính:</Text>
          <Text style={styles.paymentValue}>{order.subtotal.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
          <Text style={styles.paymentValue}>{order.shippingFee.toLocaleString('vi-VN')}đ</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Giảm giá:</Text>
            <Text style={styles.discountValue}>-{order.discount.toLocaleString('vi-VN')}đ</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{order.total.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>
      
      {/* Lịch sử trạng thái */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử đơn hàng</Text>
        {order.statusHistory.map((status, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyDot} />
            <View style={styles.historyContent}>
              <Text style={styles.historyStatus}>
                {getStatusInfo(status.status).label}
              </Text>
              <Text style={styles.historyTime}>
                {formatDate(status.timestamp)}
              </Text>
              {status.note && (
                <Text style={styles.historyNote}>{status.note}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
      
      {/* Nút thanh toán */}
      {canPay && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>Thanh toán ngay</Text>
        </TouchableOpacity>
      )}
      
      {/* Nút hủy đơn hàng */}
      {canCancel && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelOrder}
        >
          <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#404040',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: 'rgba(65, 137, 230, 0.1)',
    marginBottom: 10,
  },
  statusTextContainer: {
    marginLeft: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#404040',
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#404040',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontWeight: '500',
    color: '#404040',
    flex: 1,
    textAlign: 'right',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#404040',
    marginBottom: 5,
  },
  addressPhone: {
    fontSize: 14,
    color: '#404040',
    marginBottom: 5,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: '#404040',
    marginBottom: 5,
  },
  productPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    color: '#666',
  },
  paymentValue: {
    color: '#404040',
  },
  discountValue: {
    color: Colors.error,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#404040',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#404040',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
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