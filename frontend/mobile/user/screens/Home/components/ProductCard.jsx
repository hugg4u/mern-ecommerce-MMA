import { View, Text, Image, Dimensions, TouchableNativeFeedback } from 'react-native'
import React from 'react'
import CusColors from '../../../constants/Colors'
import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function ProductCard({ item }) {
    const navigation = useNavigation() 
    let width = Dimensions.get('screen').width / 2 - 8
    
    // Tính giá sau khuyến mãi
    const discountedPrice = item.discount > 0 
        ? (item.price * (1 - item.discount / 100)).toFixed(2) 
        : item.price;
    
    // Tính rating trung bình
    const calculateAverageRating = () => {
        if (!item || !item.review || item.review.length === 0) {
            return 0;
        }
        
        const sum = item.review.reduce((total, review) => total + review.stars, 0);
        return sum / item.review.length;
    };
    
    const averageRating = calculateAverageRating();
    
    // Render các ngôi sao đánh giá
    const renderRatingStars = () => {
        const stars = [];
        const fullStars = Math.floor(averageRating);
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <FontAwesome key={i} name="star" size={12} color="#FFD700" style={{marginRight: 1}} />
                );
            } else {
                stars.push(
                    <FontAwesome key={i} name="star-o" size={12} color="#FFD700" style={{marginRight: 1}} />
                );
            }
        }
        
        return (
            <View style={{flexDirection: 'row'}}>
                {stars}
                <Text style={{fontSize: 10, marginLeft: 2, color: '#666'}}>
                    ({averageRating.toFixed(1)})
                </Text>
            </View>
        );
    };
    
    return (
        <TouchableNativeFeedback 
            background={TouchableNativeFeedback.Ripple(CusColors.RIPPLECOLOR)} 
            onPress={() => {
                navigation.navigate('homeStack', {
                    screen: 'product',
                    params: { product: item }
                });
            }}
        >
            <View key={item.pid} className='p-1 flex-col justify-center mx-1 my-1 rounded-lg border border-slate-50' style={{ width: width }}>
                {/* image */}
                <Image 
                    resizeMode='cover' 
                    className='h-[130px] w-full rounded-md' 
                    source={{ uri: item.imgUrl }} 
                />
                {/* text */}
                <View className='flex-row justify-between items-center mt-1'>
                    <View className='flex-col items-start justify-center flex-1'>
                        <View className='mt-1'>
                            {renderRatingStars()}
                        </View>
                        <Text className='font-montSemiBold text-xs text-ellipsis' numberOfLines={1}>{item.name}</Text>
                    </View>
                    <View className='flex-col justify-center items-end flex-wrap'>
                        {item.discount > 0 ? (
                            <>
                                <Text className='font-mont text-xs line-through text-gray-500'>${item.price}</Text>
                                <Text className='font-montBold text-xs text-red-600'>${discountedPrice}</Text>
                            </>
                        ) : (
                            <Text className='font-montBold text-xs text-green-600'>${item.price}</Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>
    )
}