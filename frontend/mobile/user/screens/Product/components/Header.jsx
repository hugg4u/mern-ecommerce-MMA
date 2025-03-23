import { View, Text, TouchableNativeFeedback } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import CusColors from '../../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../../context/CartContext';

export default function Header({ name = "Sản phẩm" }) {
    const navigation = useNavigation();
    const { cart } = useCart();
    
    // Đảm bảo totalItems là số hợp lệ
    const cartItemCount = cart && !isNaN(cart.items) ? cart.items.length : 0;
    
    return (
        <View className='flex-row justify-between items-center px-[12px] mt-3 mb-5'>
            <View className='flex-row justify-between items-center space-x-4'>
                <View style={{ borderRadius: 15, overflow: 'hidden' }}>
                    <TouchableNativeFeedback 
                        background={TouchableNativeFeedback.Ripple('grey')} 
                        onPress={() => navigation.goBack()}
                    >
                        <View className='bg-back rounded-full p-2'>
                            <Ionicons name="arrow-back" color={'black'} size={20} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View className='overflow-hidden'>
                    <Text className='font-montBold text-xl'>{name}</Text>
                </View>
            </View>
            {/*  btns */}
            <View className='flex-row justify-between items-center space-x-4'>
                <View style={{ borderRadius: 15, overflow: 'hidden' }}>
                    <TouchableNativeFeedback 
                        background={TouchableNativeFeedback.Ripple('grey')}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <View className='bg-back rounded-full p-2'>
                            <Ionicons name="cart" color={'black'} size={20} />
                            {cartItemCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                                    <Text className="text-white text-xs font-montBold">
                                        {cartItemCount > 9 ? '9+' : cartItemCount.toString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    );
}