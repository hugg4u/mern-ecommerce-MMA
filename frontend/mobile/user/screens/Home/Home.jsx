import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import MainHeader from '../../components/MainHeader/MainHeader'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import ImageParallax from './components/ImageParallax'
import HomeCategory from './components/HomeCategory'
import ProductCard from './components/ProductCard'
import ProductService from '../../services/ProductService'
import { FontAwesome } from '@expo/vector-icons'

export default function Home() {
  const navigation = useNavigation()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([]) // Lưu danh sách sản phẩm gốc
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ProductService.getAllProducts()
      if (response.code === 200 && response.data && response.data.length > 0) {
        setAllProducts(response.data) // Lưu tất cả sản phẩm
        setProducts(response.data)    // Hiển thị tất cả sản phẩm ban đầu
      } else {
        setError('Không thể tải danh sách sản phẩm')
      }
    } catch (err) {
      console.error('Lỗi khi fetch products:', err)
      setError('Lỗi kết nối đến máy chủ')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Áp dụng tìm kiếm và lọc vào danh sách sản phẩm
  useEffect(() => {
    if (allProducts.length > 0) {
      filterProducts();
    }
  }, [searchText, activeFilters, allProducts]);

  // Hàm lọc sản phẩm dựa trên tìm kiếm và bộ lọc
  const filterProducts = () => {
    let filteredProducts = [...allProducts];

    // Áp dụng tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    // Áp dụng lọc theo danh mục
    if (activeFilters.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === activeFilters.category
      );
    }

    // Áp dụng lọc theo giá
    if (activeFilters.priceMin !== undefined || activeFilters.priceMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        const productPrice = product.discount 
          ? product.price * (1 - product.discount / 100) 
          : product.price;
        
        const meetsMinPrice = activeFilters.priceMin !== undefined 
          ? productPrice >= activeFilters.priceMin 
          : true;
        
        const meetsMaxPrice = activeFilters.priceMax !== undefined 
          ? productPrice <= activeFilters.priceMax 
          : true;
        
        return meetsMinPrice && meetsMaxPrice;
      });
    }

    // Áp dụng lọc theo còn hàng
    if (activeFilters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        activeFilters.inStock ? product.stock === 'in stock' : true
      );
    }

    // Áp dụng sắp xếp
    if (activeFilters.sortBy) {
      switch (activeFilters.sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case 'popular':
          filteredProducts.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        default:
          break;
      }
    }

    setProducts(filteredProducts);
  };

  // Xử lý tìm kiếm từ MainHeader
  const handleSearch = (text) => {
    setSearchText(text);
  };

  // Xử lý lọc từ MainHeader
  const handleFilter = (filters) => {
    setActiveFilters(filters);
  };

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Đang tải sản phẩm...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#ff0000', textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 }}
            onPress={fetchProducts}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (products.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            {searchText || Object.keys(activeFilters).length > 0
              ? 'Không tìm thấy sản phẩm phù hợp'
              : 'Không có sản phẩm nào'}
          </Text>
        </View>
      )
    }

    return null;
  }

  return (
    <>
      <MainHeader onSearch={handleSearch} onFilter={handleFilter} />
      <FlatList
        style={{ backgroundColor: 'white' }}
        ListHeaderComponent={
          <>
            {/* Hiển thị thông báo về bộ lọc đang áp dụng */}
            {(searchText || Object.keys(activeFilters).length > 0) && (
              <View className="px-3 py-2 bg-gray-100">
                <Text className="font-montMedium">
                  {searchText ? `Kết quả tìm kiếm cho: "${searchText}"` : 'Sản phẩm đã lọc'}
                  {activeFilters.category ? ` • ${activeFilters.category}` : ''}
                  {activeFilters.sortBy ? ` • ${activeFilters.sortBy === 'price_asc' ? 'Giá tăng dần' : 
                    activeFilters.sortBy === 'price_desc' ? 'Giá giảm dần' : 
                    activeFilters.sortBy === 'newest' ? 'Mới nhất' : 'Phổ biến'}` : ''}
                </Text>
              </View>
            )}
            
            {/* Chỉ hiển thị danh mục và banner khi không tìm kiếm/lọc */}
            {!searchText && Object.keys(activeFilters).length === 0 && (
              <>
                {/* categories section */}
                <View className="mt-0">
                  <HomeCategory />
                </View>
                {/* iamge paralla */}
                <ImageParallax />
                <View className='mb-2'></View>
              </>
            )}
            
            {/* Tiêu đề danh sách sản phẩm */}
            <View className='px-3 flex-row justify-between items-center mb-2'>
              <Text className='font-montBold text-lg'>
                {searchText || Object.keys(activeFilters).length > 0 ? 'Sản phẩm phù hợp' : 'Sản phẩm nổi bật'}
              </Text>
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 15
                }}
                onPress={() => navigation.navigate('homeStack', { 
                  screen: 'CategoryProducts', 
                  params: { category: 'all' } 
                })}
              >
                <Text className='font-montMedium text-blue-600 text-sm mr-1'>Xem tất cả</Text>
                <FontAwesome name="angle-right" size={14} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.pid}
        renderItem={({ item }) => <ProductCard item={item} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </>
  )
}