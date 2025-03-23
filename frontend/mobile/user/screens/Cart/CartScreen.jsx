import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';
import CusColors from '../../constants/Colors';

const CartItem = ({ item, onDecrease, onIncrease, onRemove }) => {
  return (
    <View className="flex-row p-3 bg-white mb-2 rounded-md shadow-sm">
      <Image 
        source={{ uri: item?.product?.imgUrl }} 
        className="w-20 h-20 rounded-md"
        resizeMode="cover"
      />
      
      <View className="flex-1 ml-3">
        <Text className="text-base font-montSemiBold" numberOfLines={2}>{item?.product?.name}</Text>
        <Text className="text-blue-600 font-montBold mt-1">
          {formatCurrency(item?.price)} đ
        </Text>
        
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => onDecrease(item?.product?._id)} 
              className="bg-gray-100 w-8 h-8 justify-center items-center rounded-l-md"
            >
              <Ionicons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            
            <View className="bg-white w-8 h-8 justify-center items-center border-t border-b border-gray-200">
              <Text className="font-montSemiBold">{item?.quantity}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => onIncrease(item?.product?._id)} 
              className="bg-gray-100 w-8 h-8 justify-center items-center rounded-r-md"
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => onRemove(item?.product?._id)} 
            className="p-2"
          >
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function CartScreen({ navigation }) {
  const { cart = { items: [], totalItems: 0, totalAmount: 0 }, loading, fetchCart, updateItem, removeItem } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  // Tính tổng tiền của các sản phẩm được chọn
  useEffect(() => {
    if (!cart || !cart.items) return;
    
    const total = selectedItems.reduce((acc, itemId) => {
      const item = cart.items.find(i => i?.product?._id === itemId);
      if (item) {
        return acc + (item.price * item.quantity);
      }
      return acc;
    }, 0);
    setTotalSelected(total);
  }, [selectedItems, cart?.items]);

  // Tăng số lượng sản phẩm
  const handleIncrease = async (productId) => {
    if (!cart || !cart.items) return;
    
    const item = cart.items.find(i => i?.product?._id === productId);
    if (item) {
      await updateItem(productId, item.quantity + 1);
    }
  };

  // Giảm số lượng sản phẩm
  const handleDecrease = async (productId) => {
    if (!cart || !cart.items) return;
    
    const item = cart.items.find(i => i?.product?._id === productId);
    if (item && item.quantity > 1) {
      await updateItem(productId, item.quantity - 1);
    } else {
      handleRemove(productId);
    }
  };

  // Xóa sản phẩm
  const handleRemove = (productId) => {
    if (!cart || !cart.items) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            await removeItem(productId);
            setSelectedItems(prev => prev.filter(id => id !== productId));
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Chọn/bỏ chọn sản phẩm
  const toggleSelectItem = (productId) => {
    if (!productId) return;
    
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Chọn tất cả sản phẩm
  const selectAllItems = () => {
    if (!cart || !cart.items) return;
    
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      const validProductIds = cart.items
        .filter(item => item?.product?._id)
        .map(item => item.product._id);
      setSelectedItems(validProductIds);
    }
  };

  // Thanh toán các sản phẩm đã chọn
  const handleCheckout = () => {
    if (!cart || !cart.items) return;
    
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Chuyển đến màn hình thanh toán với danh sách sản phẩm đã chọn
    navigation.navigate('Checkout', {
      selectedItems: cart.items.filter(item => selectedItems.includes(item?.product?._id))
    });
  };

  // Render khi giỏ hàng trống
  const renderEmptyCart = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text className="text-lg text-gray-400 font-montSemiBold mt-4">Giỏ hàng của bạn đang trống</Text>
      <TouchableOpacity 
        className="mt-5 bg-blue-600 px-5 py-2 rounded-md"
        onPress={() => navigation.navigate('Home')}
      >
        <Text className="text-white font-montSemiBold">Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  // Render item trong giỏ hàng
  const renderCartItem = ({ item }) => {
    if (!item?.product) return null;
    
    return (
      <View className="flex-row items-center">
        <TouchableOpacity 
          className="p-3" 
          onPress={() => toggleSelectItem(item?.product?._id)}
        >
          <Ionicons 
            name={selectedItems.includes(item?.product?._id) ? "checkbox" : "square-outline"} 
            size={24} 
            color={selectedItems.includes(item?.product?._id) ? CusColors.PRIMARY : "#999"} 
          />
        </TouchableOpacity>
        <View className="flex-1">
          <CartItem 
            item={item} 
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
            onRemove={handleRemove}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-montBold">Giỏ hàng của bạn</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={CusColors.PRIMARY} />
        </View>
      ) : (
        <>
          {/* Danh sách sản phẩm */}
          {!cart || !cart.items || cart.items.length === 0 ? (
            renderEmptyCart()
          ) : (
            <>
              <View className="flex-row justify-between items-center px-4 py-3 bg-white mt-2 border-b border-gray-200">
                <TouchableOpacity className="flex-row items-center" onPress={selectAllItems}>
                  <Ionicons 
                    name={selectedItems.length === cart.items.length ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={selectedItems.length === cart.items.length ? CusColors.PRIMARY : "#999"} 
                  />
                  <Text className="ml-2 font-montMedium">Chọn tất cả ({cart.items.length})</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={cart.items}
                keyExtractor={(item, index) => item?.product?._id || `cart-item-${index}`}
                renderItem={renderCartItem}
                contentContainerStyle={{ padding: 10 }}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
          
          {/* Footer - Thanh toán */}
          {cart && cart.items && cart.items.length > 0 && (
            <View className="bg-white p-4 shadow-lg">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-montMedium">
                  Sản phẩm đã chọn: {selectedItems.length}
                </Text>
                <Text className="text-gray-700 font-montMedium">
                  Tổng tiền: <Text className="text-blue-600 font-montBold">{formatCurrency(totalSelected)} đ</Text>
                </Text>
              </View>
              
              <TouchableOpacity 
                className="bg-blue-600 py-3 rounded-md items-center"
                onPress={handleCheckout}
              >
                <Text className="text-white font-montBold text-lg">Thanh toán</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
} 