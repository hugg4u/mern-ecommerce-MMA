import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';

export default function CheckoutScreen({ navigation, route }) {
  const { selectedItems = [] } = route.params || {};
  
  const totalAmount = selectedItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  const renderItem = ({ item }) => (
    <View className="flex-row p-3 bg-white mb-2 rounded-md shadow-sm">
      <Image
        source={{ uri: item.product.imgUrl }}
        className="w-16 h-16 rounded-md"
        resizeMode="cover"
      />
      
      <View className="flex-1 ml-3">
        <Text className="text-base font-montSemiBold" numberOfLines={2}>{item.product.name}</Text>
        <Text className="text-gray-500 font-montMedium mt-1">
          Số lượng: {item.quantity} x {formatCurrency(item.price)} đ
        </Text>
        <Text className="text-blue-600 font-montBold mt-1">
          {formatCurrency(item.price * item.quantity)} đ
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-montBold">Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Products */}
      <View className="flex-1 p-4">
        <Text className="text-lg font-montBold mb-3">Sản phẩm đã chọn</Text>
        <FlatList
          data={selectedItems}
          keyExtractor={(item) => item.product._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-gray-400 font-montMedium">Không có sản phẩm nào được chọn</Text>
            </View>
          }
        />
      </View>
      
      {/* Footer */}
      <View className="bg-white p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-montMedium">Tổng thanh toán:</Text>
          <Text className="text-xl text-blue-600 font-montBold">
            {formatCurrency(totalAmount)} đ
          </Text>
        </View>
        
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-md items-center"
          onPress={() => {
            // Xử lý đặt hàng
            alert('Chức năng đặt hàng đang được phát triển');
          }}
        >
          <Text className="text-white font-montBold text-lg">Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 