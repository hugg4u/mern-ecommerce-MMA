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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ProductService.getAllProducts()
      if (response.code === 200 && response.data && response.data.length > 0) {
        setProducts(response.data)
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

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
          Không có sản phẩm nào
        </Text>
      </View>
    )
  }

  return (
    <>
      <MainHeader />
      <FlatList
        style={{ backgroundColor: 'white' }}
        ListHeaderComponent={
          <>
            {/* categories section */}
            <View className="mt-0">
              <HomeCategory />
            </View>
            {/* iamge paralla */}
            <ImageParallax />
            <View className='mb-2'></View>
            {/* Tiêu đề danh sách sản phẩm */}
            <View className='px-3 flex-row justify-between items-center mb-2'>
              <Text className='font-montBold text-lg'>Sản phẩm nổi bật</Text>
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