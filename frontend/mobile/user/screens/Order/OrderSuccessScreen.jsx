import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderId, orderNumber } = route.params || {};

  const handleViewOrder = () => {
    console.log('OrderSuccessScreen - handleViewOrder - orderId:', orderId);
    console.log('OrderSuccessScreen - handleViewOrder - orderNumber:', orderNumber);
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleContinueShopping = () => {
    console.log('OrderSuccessScreen - handleContinueShopping - Reset về màn hình Main');
    
    // Reset toàn bộ stack navigation về màn hình chính
    navigation.navigate('Home')
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Animation */}
        {/* <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/animations/order-success.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </View> */}

        {/* Success message */}
        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.message}>
          Cảm ơn bạn đã đặt hàng tại HelaShop. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
        </Text>

        {/* Order info */}
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderInfoLabel}>Mã đơn hàng:</Text>
          <Text style={styles.orderInfoValue}>{orderNumber}</Text>
        </View>
        
        {/* Order tracking info */}
        <View style={styles.trackingContainer}>
          <View style={styles.trackingHeader}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.trackingTitle}>Theo dõi đơn hàng</Text>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Đơn hàng đã đặt</Text>
              <Text style={styles.stepTime}>{new Date().toLocaleString('vi-VN')}</Text>
            </View>
          </View>
          
          <View style={[styles.stepLine, styles.stepInactive]} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, styles.stepInactive]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, styles.textInactive]}>Đang xử lý</Text>
            </View>
          </View>
          
          <View style={[styles.stepLine, styles.stepInactive]} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, styles.stepInactive]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, styles.textInactive]}>Đang giao hàng</Text>
            </View>
          </View>
          
          <View style={[styles.stepLine, styles.stepInactive]} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, styles.stepInactive]}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, styles.textInactive]}>Đã giao hàng</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleViewOrder}
          >
            <Text style={styles.primaryButtonText}>Xem chi tiết đơn hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleContinueShopping}
          >
            <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.success,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.text,
    lineHeight: 22,
  },
  orderInfoContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  orderInfoLabel: {
    fontSize: 16,
    color: Colors.text,
    marginRight: 5,
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  trackingContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.text,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepInactive: {
    backgroundColor: '#ddd',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepLine: {
    width: 2,
    height: 30,
    marginLeft: 14,
    marginVertical: 5,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  textInactive: {
    color: '#999',
  },
  stepTime: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },
  actions: {
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderSuccessScreen; 