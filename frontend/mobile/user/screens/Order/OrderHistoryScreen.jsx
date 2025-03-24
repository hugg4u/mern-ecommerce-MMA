import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getUserOrders } from '../../services/OrderService';
import { useFocusEffect } from '@react-navigation/native';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipped', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  const fetchOrders = async (status = 'all') => {
    try {
      setLoading(true);
      const response = await getUserOrders(status);
      
      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        console.error('Error fetching orders:', response.data);
      }
    } catch (error) {
      console.error('Exception in fetchOrders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(activeTab);
    }, [activeTab])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(activeTab);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderOrderItem = ({ item }) => {
    // Format date
    const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');
    
    // Get status color and label
    const getStatusInfo = (status) => {
      switch(status) {
        case 'pending':
          return { color: Colors.warning, label: 'Chờ xác nhận' };
        case 'processing':
          return { color: '#FFC107', label: 'Đang xử lý' };
        case 'shipped':
          return { color: '#3F51B5', label: 'Đang giao hàng' };
        case 'delivered':
          return { color: Colors.success, label: 'Đã giao hàng' };
        case 'cancelled':
          return { color: Colors.error, label: 'Đã hủy' };
        case 'returned':
          return { color: '#FF5722', label: 'Đã trả hàng' };
        case 'refunded':
          return { color: '#9C27B0', label: 'Đã hoàn tiền' };
        default:
          return { color: '#808080', label: 'Không xác định' };
      }
    };
    
    const statusInfo = getStatusInfo(item.status);
    
    // Handle view detail
    const handleViewDetail = () => {
      navigation.navigate('OrderDetail', { orderId: item._id });
    };
    
    return (
      <TouchableOpacity style={styles.orderItem} onPress={handleViewDetail}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Đơn hàng: {item.orderNumber}</Text>
          <Text style={styles.orderDate}>{createdDate}</Text>
        </View>
        
        <View style={styles.orderProducts}>
          {item.items.slice(0, 2).map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Image 
                source={{ uri: product.imgUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString('vi-VN')}đ x {product.quantity}
                </Text>
              </View>
            </View>
          ))}
          
          {item.items.length > 2 && (
            <Text style={styles.moreProducts}>
              +{item.items.length - 2} sản phẩm khác
            </Text>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <View style={styles.orderStatus}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
          
          <Text style={styles.orderTotal}>
            {item.total.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* <Image 
        source={require('../../assets/images/empty-order.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      /> */}
      <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      <TouchableOpacity 
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#404040" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.emptyView} />
      </View>
      
      <View style={styles.tabContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === item.id && styles.activeTab
              ]}
              onPress={() => handleTabChange(item.id)}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === item.id && styles.activeTabText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </View>
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
  emptyView: {
    width: 34,
  },
  tabContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tabList: {
    paddingHorizontal: 15,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: '#777',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#404040',
  },
  orderDate: {
    color: '#777',
  },
  orderProducts: {
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    marginBottom: 3,
    color: '#404040',
  },
  productPrice: {
    fontSize: 13,
    color: '#777',
  },
  moreProducts: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    color: '#404040',
    fontWeight: '500',
  },
  orderTotal: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderHistoryScreen;