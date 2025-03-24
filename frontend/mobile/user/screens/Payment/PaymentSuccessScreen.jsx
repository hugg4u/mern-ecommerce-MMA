import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { verifyPaymentStatus, getOrderDetail } from '../../services/OrderService';
import { useAuth } from '../../context/AuthContext';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('Verifying payment for orderId:', orderId);
        if (!orderId) {
          setError('Không tìm thấy thông tin đơn hàng');
          setLoading(false);
          return;
        }

        // Xác thực trạng thái thanh toán
        const verifyResponse = await verifyPaymentStatus(orderId);
        console.log('Verify payment response:', verifyResponse);

        if (!verifyResponse.success) {
          setError(verifyResponse.error || 'Không thể xác thực thanh toán');
          setLoading(false);
          return;
        }

        // Lấy thông tin chi tiết đơn hàng
        const orderResponse = await getOrderDetail(orderId);
        console.log('Order details response:', orderResponse);

        if (orderResponse.success) {
          setOrderData(orderResponse.data.order);
        } else {
          setError('Không thể tải thông tin đơn hàng');
        }
      } catch (error) {
        console.error('Error in payment verification:', error);
        setError('Đã xảy ra lỗi khi xác thực thanh toán');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  const handleViewOrder = () => {
    console.log('Navigating to order detail with ID:', orderId);
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleContinueShopping = () => {
    console.log('Navigating to Home');
    // Quay về màn hình Home trong Bottom Tab
    navigation.reset({
      index: 0,
      routes: [{ name: 'homeScreen' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang xác thực thanh toán...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="close-circle" size={80} color={Colors.error} />
            <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleContinueShopping}
            >
              <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.successMessage}>
              Đơn hàng của bạn đã được thanh toán và đang được xử lý
            </Text>
            
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
              <Text style={styles.orderValue}>#{orderData?.orderNumber || 'N/A'}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleViewOrder}
              >
                <Ionicons name="document-text-outline" size={18} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Xem chi tiết đơn hàng</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleContinueShopping}
              >
                <Ionicons name="cart-outline" size={18} color={Colors.primary} style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  orderLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginRight: 8,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PaymentSuccessScreen; 