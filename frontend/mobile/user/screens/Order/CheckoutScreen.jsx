import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ToastAndroid
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { createOrder, openVNPayPaymentPage } from '../../services/OrderService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import vietnameseProvinces from '../../constants/Address/Provinces';
import vietnameseDistricts from '../../constants/Address/Districts';
import { Picker } from '@react-native-picker/picker';

const CheckoutScreen = ({ navigation, route }) => {
  const { cart, emptyCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Debug thông tin giỏ hàng
  useEffect(() => {
    console.log('CheckoutScreen - Cart info:', JSON.stringify(cart, null, 2));
    console.log('CheckoutScreen - Cart items:', cart?.items?.length || 0);
    console.log('CheckoutScreen - Cart totalAmount:', cart?.totalAmount || 0);
  }, [cart]);
  
  // Địa chỉ giao hàng
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.telephone || '',
    province: user?.address?.province || '',
    district: user?.address?.district || '',
    street: user?.address?.street || '',
    note: ''
  });

  // Phí vận chuyển (có thể tính dựa trên địa chỉ)
  const shippingFee = 30000;

  useEffect(() => {
    // Kiểm tra nếu giỏ hàng trống, quay về trang giỏ hàng
    if (!cart || !cart.items || cart.items.length === 0) {
      ToastAndroid.show('Giỏ hàng trống. Vui lòng thêm sản phẩm để đặt hàng.', ToastAndroid.LONG);
      navigation.navigate('Cart');
    }
  }, [cart]);

  const handleInputChange = (field, value) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  const validateForm = () => {
    if (!shippingAddress.fullName.trim()) {
      ToastAndroid.show('Vui lòng nhập họ tên người nhận', ToastAndroid.SHORT);
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      ToastAndroid.show('Vui lòng nhập số điện thoại', ToastAndroid.SHORT);
      return false;
    }
    if (!shippingAddress.province.trim()) {
      ToastAndroid.show('Vui lòng chọn tỉnh/thành phố', ToastAndroid.SHORT);
      return false;
    }
    if (!shippingAddress.district.trim()) {
      ToastAndroid.show('Vui lòng chọn quận/huyện', ToastAndroid.SHORT);
      return false;
    }
    if (!shippingAddress.street.trim()) {
      ToastAndroid.show('Vui lòng nhập địa chỉ cụ thể', ToastAndroid.SHORT);
      return false;
    }
    // Thêm kiểm tra định dạng SĐT nếu cần
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const orderData = {
        shippingAddress,
        paymentMethod,
        notes: orderNote
      };

      const response = await createOrder(orderData);

      if (response.success) {
        console.log('response.data.order', response);
        
        if (paymentMethod === 'vnpay') {
          // Nếu thanh toán qua VNPay, mở trang thanh toán
          const orderId = response.data.data.order._id;
          const paymentResponse = await openVNPayPaymentPage(orderId);
          
          if (!paymentResponse.success) {
            // Nếu không thể mở trang thanh toán, vẫn chuyển đến trang thành công
            // và người dùng có thể thanh toán sau
            ToastAndroid.show('Không thể mở trang thanh toán. Bạn có thể thanh toán sau.', ToastAndroid.LONG);
          }
        }

        
        
        // Chuyển đến trang thành công
        const orderParamsForSuccess = {
          orderId: response.data.data.order._id,
          orderNumber: response.data.data.order.orderNumber
        };

        console.log('Checkout - Chuyển đến OrderSuccess với params:', orderParamsForSuccess);

        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'OrderSuccess', 
            params: orderParamsForSuccess
          }],
        });
      } else {
        ToastAndroid.show(response.data?.message || 'Có lỗi xảy ra khi đặt hàng', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      ToastAndroid.show('Có lỗi xảy ra khi đặt hàng', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang xử lý đơn hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm ({cart?.items?.length || 0})</Text>
        {cart?.items?.map((item, index) => (
          <View key={index} style={styles.productItem}>
            <Image 
              source={{ uri: item.product.imgUrl }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}đ x {item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Thông tin giao hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ tên người nhận <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            placeholder="Nhập họ tên người nhận hàng"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số điện thoại <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Nhập số điện thoại liên hệ"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tỉnh/Thành phố <Text style={styles.required}>*</Text></Text>
          <View style={styles.pickerContainer}>
          <TextInput
            style={styles.input}
            value={shippingAddress.province}
            onChangeText={(text) => handleInputChange('province', text)}
            placeholder="Nhập tỉnh/thành phố"
          />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quận/Huyện <Text style={styles.required}>*</Text></Text>
          <View style={styles.pickerContainer}>
          <TextInput
            style={styles.input}
            value={shippingAddress.district}
            onChangeText={(text) => handleInputChange('district', text)}
            placeholder="Nhập quận/huyện"
          />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Địa chỉ cụ thể <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.street}
            onChangeText={(text) => handleInputChange('street', text)}
            placeholder="Nhập số nhà, tên đường, phường/xã"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ghi chú cho đơn hàng</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={orderNote}
            onChangeText={setOrderNote}
            placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Phương thức thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        
        <TouchableOpacity 
          style={[styles.paymentMethod, paymentMethod === 'cod' && styles.paymentMethodSelected]}
          onPress={() => setPaymentMethod('cod')}
        >
          <View style={styles.paymentMethodLeft}>
            <MaterialIcons 
              name={paymentMethod === 'cod' ? "radio-button-checked" : "radio-button-unchecked"} 
              size={24} 
              color={paymentMethod === 'cod' ? Colors.primary : Colors.text} 
            />
            <Text style={styles.paymentMethodText}>Thanh toán khi nhận hàng (COD)</Text>
          </View>
          <Ionicons name="cash-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.paymentMethod, paymentMethod === 'vnpay' && styles.paymentMethodSelected]}
          onPress={() => setPaymentMethod('vnpay')}
        >
          <View style={styles.paymentMethodLeft}>
            <MaterialIcons 
              name={paymentMethod === 'vnpay' ? "radio-button-checked" : "radio-button-unchecked"} 
              size={24} 
              color={paymentMethod === 'vnpay' ? Colors.primary : Colors.text} 
            />
            <Text style={styles.paymentMethodText}>Thanh toán qua VNPay</Text>
          </View>
          <Image 
            source={require('../../assets/images/vnpay-logo.png')}
            style={styles.paymentLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={[styles.paymentMethod, paymentMethod === 'banking' && styles.paymentMethodSelected]}
          onPress={() => setPaymentMethod('banking')}
        >
          <View style={styles.paymentMethodLeft}>
            <MaterialIcons 
              name={paymentMethod === 'banking' ? "radio-button-checked" : "radio-button-unchecked"} 
              size={24} 
              color={paymentMethod === 'banking' ? Colors.primary : Colors.text} 
            />
            <Text style={styles.paymentMethodText}>Chuyển khoản ngân hàng</Text>
          </View>
          <Ionicons name="card-outline" size={24} color={Colors.text} />
        </TouchableOpacity> */}
      </View>

      {/* Tổng tiền */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
          <Text style={styles.summaryValue}>{cart?.totalAmount?.toLocaleString('vi-VN')}đ</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.summaryValue}>{shippingFee.toLocaleString('vi-VN')}đ</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Giảm giá:</Text>
          <Text style={styles.summaryValue}>0đ</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{(cart?.totalAmount + shippingFee).toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>

      {/* Nút đặt hàng */}
      <TouchableOpacity 
        style={styles.checkoutButton} 
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.checkoutButtonText}>
          {loading ? 'Đang xử lý...' : 'Đặt hàng'}
        </Text>
      </TouchableOpacity>
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    marginBottom: 5,
    color: Colors.text,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: Colors.text,
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    color: Colors.text,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentMethodSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(65, 137, 230, 0.05)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.text,
  },
  paymentLogo: {
    width: 40,
    height: 24,
    marginRight: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
    marginTop: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: Colors.text,
  },
});

export default CheckoutScreen; 