import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { getPaymentTroubleshooting } from '../../services/OrderService';

const PaymentErrorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, errorCode } = route.params || {};
  const [troubleshootingInfo, setTroubleshootingInfo] = useState(null);
  
  useEffect(() => {
    const fetchTroubleshooting = async () => {
      if (errorCode) {
        try {
          const response = await getPaymentTroubleshooting(errorCode);
          if (response.success) {
            setTroubleshootingInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching troubleshooting info:', error);
        }
      }
    };
    
    fetchTroubleshooting();
  }, [errorCode]);

  const getErrorMessage = (code) => {
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
    
    return errorMessages[code] || 'Lỗi không xác định';
  };

  const handleRetryPayment = () => {
    console.log('Navigating back to OrderDetail for retry payment:', orderId);
    navigation.navigate('OrderDetail', { orderId, requestPayment: true });
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Ionicons name="close-circle" size={80} color={Colors.error} />
          <Text style={styles.errorTitle}>Thanh toán thất bại</Text>
          
          <View style={styles.errorCode}>
            <Text style={styles.errorCodeLabel}>Mã lỗi:</Text>
            <Text style={styles.errorCodeValue}>{errorCode || 'N/A'}</Text>
          </View>
          
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageTitle}>Lỗi xảy ra:</Text>
            <Text style={styles.errorMessage}>{getErrorMessage(errorCode)}</Text>
          </View>
          
          {troubleshootingInfo && (
            <View style={styles.troubleshootingContainer}>
              <Text style={styles.troubleshootingTitle}>Hướng dẫn khắc phục:</Text>
              <Text style={styles.troubleshootingText}>{troubleshootingInfo.solution}</Text>
            </View>
          )}
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoText}>
              Đơn hàng <Text style={styles.orderInfoHighlight}>#{orderId}</Text> của bạn vẫn được lưu.
              Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleRetryPayment}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.white} style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Thử lại thanh toán</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  errorCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  errorCodeLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginRight: 8,
  },
  errorCodeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
  },
  errorMessageContainer: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  troubleshootingContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F5F9FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCE0FF',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  troubleshootingText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  orderInfo: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
  },
  orderInfoText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  orderInfoHighlight: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
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
});

export default PaymentErrorScreen; 