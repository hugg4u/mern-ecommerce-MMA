import { View, Text, TouchableNativeFeedback } from 'react-native'
import React from 'react'
import CusColors from '../../../constants/Colors'

export default function ProductFooter({ product }) {
    const handleAddToCart = () => {
        // Xử lý thêm vào giỏ hàng
        console.log('Thêm vào giỏ hàng:', product?.name);
    };

    const handleBuyNow = () => {
        // Xử lý mua ngay
        console.log('Mua ngay:', product?.name);
    };

    return (
        <View className='flex-row justify-between px-3 py-2 bg-white border-t border-gray-200'>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(CusColors.RIPPLECOLOR)}
                onPress={handleAddToCart}
            >
                <View className='flex-1 mr-2 px-4 py-2 rounded-md bg-blue-100 justify-center items-center'>
                    <Text className='font-montSemiBold text-blue-600'>Thêm vào giỏ hàng</Text>
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback 
                background={TouchableNativeFeedback.Ripple(CusColors.RIPPLECOLOR)}
                onPress={handleBuyNow}
                disabled={product?.stock !== 'in stock'}
            >
                <View className={`flex-1 ml-2 px-4 py-2 rounded-md justify-center items-center ${product?.stock === 'in stock' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    <Text className='font-montSemiBold text-white'>
                        {product?.stock === 'in stock' ? 'Mua ngay' : 'Hết hàng'}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}