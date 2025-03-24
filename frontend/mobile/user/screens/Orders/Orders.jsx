import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getUserOrders } from '../../services/OrderService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderStatusText = {
  'pending': 'Chờ xác nhận',
  'processing': 'Đang xử lý',
  'delivering': 'Đang giao hàng',
  'completed': 'Đã giao hàng',
  'cancelled': 'Đã hủy',
  'refunded': 'Hoàn tiền'
};

const OrderStatusColor = {
  'pending': Colors.warning,
  'processing': Colors.primary,
  'delivering': Colors.info,
  'completed': Colors.success,
  'cancelled': Colors.danger,
  'refunded': Colors.secondary
};

const Orders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const statusFilters = useMemo(() => [
    { id: 'all', label: 'Tất cả', icon: 'albums-outline' },
    { id: 'pending', label: 'Chờ xác nhận', icon: 'time-outline' },
    { id: 'processing', label: 'Đang xử lý', icon: 'sync-outline' },
    { id: 'delivering', label: 'Đang giao', icon: 'bicycle-outline' },
    { id: 'completed', label: 'Đã giao', icon: 'checkmark-circle-outline' },
    { id: 'cancelled', label: 'Đã hủy', icon: 'close-circle-outline' }
  ], []);

  const fetchOrders = useCallback(async (status = currentStatus, pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setLoading(true);
      }
      
      setError(null);
      console.log(`Fetching orders with status: ${status}, page: ${pageNum}`);
      const response = await getUserOrders(status, pageNum, 10);
      
      if (response.success) {
        const newOrders = response.data.orders || [];
        console.log(`Received ${newOrders.length} orders`);
        
        if (shouldRefresh || pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }
        
        setTotalPages(response.data.pagination?.totalPages || 1);
        setHasMore(pageNum < (response.data.pagination?.totalPages || 1));
      } else {
        console.error('Error fetching orders:', response.error);
        setError(response.error || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Exception in fetchOrders:', error);
      setError('Đã xảy ra lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentStatus]);

  // Sử dụng useFocusEffect để tải lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log('Orders screen is focused, refreshing data');
      setPage(1);
      fetchOrders(currentStatus, 1, true);
      return () => {
        // Dọn dẹp khi màn hình bị unfocus
        console.log('Orders screen is unfocused');
      };
    }, [currentStatus, fetchOrders])
  );

  const handleRefresh = useCallback(() => {
    console.log('Refreshing orders list');
    setRefreshing(true);
    setPage(1);
    fetchOrders(currentStatus, 1, true);
  }, [currentStatus, fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      console.log(`Loading more orders, page ${nextPage}`);
      setPage(nextPage);
      fetchOrders(currentStatus, nextPage, false);
    }
  }, [loading, hasMore, page, currentStatus, fetchOrders]);

  const handleViewOrderDetail = useCallback((orderId) => {
    console.log(`Navigating to order detail for ID: ${orderId}`);
    navigation.navigate('OrderDetail', { orderId });
  }, [navigation]);

  const formatOrderDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Không xác định';
      }
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString || 'Không xác định';
    }
  }, []);

  const renderOrderItem = useCallback(({ item }) => {
    const statusColor = OrderStatusColor[item.status] || Colors.text;
    const statusText = OrderStatusText[item.status] || 'Không xác định';
    
    // Lấy thông tin sản phẩm đầu tiên và tính tổng số sản phẩm
    const firstItem = item.items && item.items.length > 0 ? item.items[0] : null;
    const totalItems = item.items ? item.items.length : 0;
    
    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        onPress={() => handleViewOrderDetail(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Đơn hàng #{item.orderNumber || 'N/A'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.orderDate}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
          <Text style={styles.dateText}>
            {formatOrderDate(item.createdAt)}
          </Text>
        </View>
        
        {firstItem && (
          <View style={styles.productPreview}>
            <Image 
              source={{ uri: firstItem.imgUrl }} 
              style={styles.productImage} 
              resizeMode="cover"
              defaultSource={require('../../assets/icon.png')}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{firstItem.name || 'Sản phẩm'}</Text>
              <Text style={styles.productPrice}>{formatCurrency(firstItem.price)} x {firstItem.quantity || 1}</Text>
              {totalItems > 1 && (
                <Text style={styles.moreItems}>+{totalItems - 1} sản phẩm khác</Text>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
        </View>
        
        <View style={styles.viewDetailWrapper}>
          <Text style={styles.viewDetailText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }, [formatOrderDate, handleViewOrderDetail]);

  const renderFilterTab = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        currentStatus === item.id && styles.filterTabActive
      ]}
      onPress={() => {
        if (currentStatus !== item.id) {
          setCurrentStatus(item.id);
          setPage(1);
        }
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={currentStatus === item.id ? Colors.white : Colors.text} 
        style={styles.filterIcon}
      />
      <Text
        style={[
          styles.filterTabText,
          currentStatus === item.id && styles.filterTabTextActive
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  ), [currentStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>
        
        <FlatList
          horizontal
          data={statusFilters}
          renderItem={renderFilterTab}
          keyExtractor={item => item.id}
          style={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
        
        {loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopNowText}>Mua sắm ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.ordersList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loading && page > 1 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
                </View>
              ) : hasMore ? (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                >
                  <Text style={styles.loadMoreText}>Tải thêm</Text>
                </TouchableOpacity>
              ) : orders.length > 0 ? (
                <Text style={styles.noMoreText}>Đã hiển thị tất cả đơn hàng</Text>
              ) : null
            }
          />
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 60,
    maxHeight: 60,
  },
  filtersContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '500',
  },
  ordersList: {
    padding: 12,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 5,
  },
  productPreview: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  viewDetailWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailText: {
    fontSize: 13,
    color: Colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopNowText: {
    color: Colors.white,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLoaderText: {
    color: Colors.textLight,
    marginLeft: 8,
  },
  loadMoreButton: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  loadMoreText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  noMoreText: {
    textAlign: 'center',
    color: Colors.textLight,
    paddingVertical: 15,
  }
});

export default Orders;