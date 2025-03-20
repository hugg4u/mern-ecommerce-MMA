import { View, Text, ImageBackground, TouchableOpacity, Image, Dimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import Header from './components/Header'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { ProductList } from '../Home/ProductList'
import { useNavigation, useRoute } from '@react-navigation/native'
import CusColors from '../../constants/Colors'
import ProductCard from '../Home/components/ProductCard'
import ProductFooter from './components/ProductFooter'
import ReviewCard from './components/ReviewCard'
import ProductBottomSheet from './components/ProductBottomSheet'
import ProductService from '../../services/ProductService'

export default function Product() {
    const route = useRoute();
    const { product } = route.params || {};
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const bottomSheetRef = useRef()
    const handleClosePress = () => bottomSheetRef.current?.close()
    const handleOpenPress = () => bottomSheetRef.current?.snapToIndex(0)

    let width = Dimensions.get('screen').width / 2 - 8
    const navigation = useNavigation()
    
    useEffect(() => {
        fetchSimilarProducts();
    }, [product]);
    
    const fetchSimilarProducts = async () => {
        if (!product) return;
        
        try {
            setLoading(true);
            const response = await ProductService.getAllProducts();
            if (response.code === 200 && response.data && response.data.length > 0) {
                // Lọc sản phẩm cùng danh mục nhưng khác pid
                const filtered = response.data.filter(
                    item => item.category === product.category && item.pid !== product.pid
                ).slice(0, 6); // Giới hạn 6 sản phẩm tương tự
                
                setSimilarProducts(filtered);
            }
        } catch (err) {
            console.error('Lỗi khi lấy sản phẩm tương tự:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Tính rating trung bình từ mảng review
    const calculateAverageRating = () => {
        if (!product || !product.review || product.review.length === 0) {
            return 0;
        }
        
        const sum = product.review.reduce((total, review) => total + review.stars, 0);
        return sum / product.review.length;
    };
    
    const averageRating = calculateAverageRating();
    const discountedPrice = product ? (product.price * (1 - product.discount / 100)).toFixed(2) : 0;
    
    // Render các ngôi sao đánh giá
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        
        // Sao đầy đủ
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        // Nửa sao
        if (halfStar) {
            stars.push(
                <FontAwesome key="half" name="star-half-o" size={16} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        // Sao trống
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {stars}
            </View>
        );
    };

    if (!product) {
        return (
            <SafeAreaView className='flex-1 bg-white justify-center items-center'>
                <Text className='font-montBold text-lg'>Không tìm thấy thông tin sản phẩm</Text>
            </SafeAreaView>
        );
    }

    return (
        <>
            <SafeAreaView className='flex-1 bg-white'>
                {/* header row */}
                <Header name={product.name}/>
                {/* main content */}
                <FlatList
                    style={{ backgroundColor: 'white' }}
                    ListHeaderComponent={
                        <>
                            <View className='px-3'>
                                <ImageBackground 
                                    source={{ uri: product.imgUrl }} 
                                    resizeMode='cover' 
                                    imageStyle={{ borderRadius: 15 }} 
                                    className='w-full h-[250px] rounded-xl'
                                />
                                {/* row 02 */}
                                <View className='flex-row justify-between items-center mt-2'>
                                    {/* rating */}
                                    <View className='flex-row justify-between items-center'>
                                        <View className='flex-row items-center'>
                                            {renderRatingStars(averageRating)}
                                            <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize font-montMedium text-xs opacity-60'> {averageRating.toFixed(1)} | </Text>
                                        </View>
                                        <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize font-montMedium text-xs opacity-60'>{product.review ? product.review.length : 0} đánh giá</Text>
                                    </View>
                                    {/* stock */}
                                    <View className=''>
                                        <Text ellipsizeMode='tail' numberOfLines={1} className={`capitalize font-montMedium text-xs ${product.stock === 'in stock' ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock === 'in stock' ? 'Còn hàng' : 'Hết hàng'}
                                        </Text>
                                    </View>
                                </View>

                                {/* row 01 */}
                                <View className='flex-row justify-between items-center mt-0'>
                                    {/* pname */}
                                    <View className='flex-1'>
                                        <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize font-montBold text-xl'>{product.name}</Text>
                                    </View>
                                    {/* pprice */}
                                    <View className='flex-1'>
                                        {product.discount > 0 ? (
                                            <View className='items-end'>
                                                <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize text-right font-montMedium text-sm line-through text-gray-500'>${product.price}</Text>
                                                <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize text-right font-montBold text-xl text-red-600'>${discountedPrice}</Text>
                                            </View>
                                        ) : (
                                            <Text ellipsizeMode='tail' numberOfLines={1} className='capitalize text-right font-montBold text-xl text-green-600'>${product.price}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* row3 - description */}
                                <View className='mt-3 flex-1'>
                                    <Text className='text-justify font-montMedium opacity-60'>{product.description}</Text>
                                </View>

                                {/* reveiws and ratings compo */}
                                <TouchableOpacity onPress={() => { handleOpenPress() }} activeOpacity={1}>
                                    <ReviewCard reviews={product.review} />
                                </TouchableOpacity>
                                
                                {/* row4 - similar products */}
                                <View className='flex-row justify-between items-center mt-3'>
                                    <Text className="font-montSemiBold text-lg opacity-60">Sản phẩm tương tự</Text>
                                    <Text className="font-montSemiBold text-lg">🛒</Text>
                                </View>
                                <View className='mb-1'></View>
                            </View>
                        </>
                    }
                    ListEmptyComponent={
                        <View className="flex-col justify-center items-center my-4">
                            <Text className="font-montSemiBold text-lg">
                                Không có sản phẩm tương tự
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                    data={similarProducts}
                    numColumns={2}
                    keyExtractor={(item) => item.pid}
                    renderItem={({ item }) => (
                        <ProductCard item={item} />
                    )}
                />
                <ProductFooter product={product} />
                <ProductBottomSheet ref={bottomSheetRef} product={product} />
            </SafeAreaView>
        </>
    )
}