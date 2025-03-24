import { View, Text, Image, TextInput, TouchableOpacity as RNTouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Appbar, Avatar } from 'react-native-paper'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import { useCart } from '../../context/CartContext';

export default function MainHeader({ onSearch, onFilter }) {
    const navigation = useNavigation();
    const [userAvatar, setUserAvatar] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [refreshCount, setRefreshCount] = useState(0); // State để theo dõi số lần làm mới
    const { cart, fetchCart } = useCart(); // Lấy thông tin giỏ hàng
    
    // Debug log khi cart thay đổi
    useEffect(() => {
        console.log("MainHeader - cart info:", 
            cart ? `totalItems: ${cart.totalItems}, items length: ${cart.items?.length || 0}` : "cart undefined");
    }, [cart]);
    
    // Đảm bảo cart có giá trị hợp lệ
    const cartItemCount = cart && !isNaN(cart.totalItems) ? cart.items?.length : 0;

    // Sử dụng useFocusEffect để cập nhật trạng thái mỗi khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            console.log('MainHeader focused - Kiểm tra đăng nhập');
            checkLoginStatus();
            // Cập nhật giỏ hàng mỗi khi màn hình được focus
            if (isLoggedIn) {
                console.log('MainHeader focused - Cập nhật giỏ hàng');
                fetchCart();
            }
            return () => {
                // Cleanup function nếu cần
            };
        }, [refreshCount, isLoggedIn]) // Phụ thuộc vào refreshCount để kích hoạt kiểm tra lại
    );

    // Vẫn giữ lại useEffect để kiểm tra ban đầu
    useEffect(() => {
        console.log('MainHeader mounted - Kiểm tra đăng nhập ban đầu');
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            // Kiểm tra trạng thái đăng nhập
            const token = await AuthService.getAuthToken();
            console.log('Token hiện tại:', token ? 'Có token' : 'Không có token');
            
            const loggedIn = await AuthService.isLoggedIn();
            console.log('Trạng thái đăng nhập:', loggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập');
            
            setIsLoggedIn(loggedIn);
            
            // Nếu đã đăng nhập, tải avatar
            if (loggedIn) {
                loadUserAvatar();
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra đăng nhập:', error);
        }
    };

    // Hàm làm mới trạng thái đăng nhập
    const refreshLoginStatus = () => {
        console.log('Làm mới trạng thái đăng nhập');
        setRefreshCount(prev => prev + 1); // Tăng refresh count để kích hoạt kiểm tra lại
    };

    const loadUserAvatar = async () => {
        try {
            const userData = await UserService.getUserProfile();
            if (userData && userData.avatar) {
                setUserAvatar(userData.avatar);
            }
        } catch (error) {
            console.error('Lỗi khi tải avatar:', error);
        }
    };

    const handleAvatarPress = () => {
        // Nếu đã đăng nhập, điều hướng đến trang Profile
        // Nếu chưa đăng nhập, điều hướng đến trang Đăng nhập/Đăng ký
        if (isLoggedIn) {
            navigation.navigate('Main', { 
                screen: 'profileStack',
                params: { screen: 'Profile' } 
            });
        } else {
            navigation.navigate('Auth', { screen: 'Login' });
        }
    };

    // Xử lý khi người dùng nhấn vào icon giỏ hàng
    const handleCartPress = () => {
        navigation.navigate('Cart');
    };

    const handleSearch = (text) => {
        setSearchText(text);
        
        // Xóa timeout cũ nếu có
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Đặt timeout mới để tránh gọi quá nhiều lần khi người dùng gõ
        const newTimeout = setTimeout(() => {
            if (onSearch) {
                onSearch(text);
            }
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilter = () => {
        // Điều hướng đến màn hình lọc
        console.log('Đang mở màn hình lọc sản phẩm...');
        // Cập nhật điều hướng để hoạt động với cấu trúc navigator mới
        navigation.navigate('Main', {
            screen: 'homeStack',
            params: {
                screen: 'ProductFilter',
                params: {
                    onApplyFilters: (filters) => {
                        if (onFilter) onFilter(filters);
                    }
                }
            }
        });
    };

    return (
        <>
            <Appbar.Header className="flex-row justify-between items-center px-[12px] bg-white shadow-sm">
                <Image className="w-[155px] h-[30px] ml-1" source={require('../../assets/logos/logoAll.jpg')} />
                <View className="flex-row items-center">
                    {/* Icon giỏ hàng với badge */}
                    <TouchableOpacity 
                        onPress={handleCartPress}
                        style={{ marginRight: 16, position: 'relative' }}
                    >
                        <Ionicons name="cart-outline" size={28} color="#333" />
                        {cartItemCount > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: -5,
                                right: -8,
                                backgroundColor: 'red',
                                borderRadius: 10,
                                minWidth: 20,
                                height: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 4,
                                zIndex: 1000
                            }}>
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                    {cartItemCount > 99 ? '99+' : cartItemCount.toString()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    {/* Nút làm mới trạng thái (chỉ hiển thị khi debug) */}
                    <TouchableOpacity 
                        onPress={refreshLoginStatus}
                        style={{ marginRight: 8 }}
                    >
                        <Ionicons name="refresh" size={24} color="#999" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity activeOpacity={0.9} onPress={handleAvatarPress}>
                        {isLoggedIn ? (
                            <Avatar.Image 
                                size={35} 
                                source={userAvatar ? { uri: userAvatar } : require('../../assets/logos/user-1.jpg')} 
                            />
                        ) : (
                            <Ionicons name="log-in-outline" size={35} color="#017aff" />
                        )}
                    </TouchableOpacity>
                </View>
            </Appbar.Header>
            {/* row 2 view */}
            <View className="flex-row justify-between items-center bg-white px-[12px] pb-3">
                {/* search view */}
                <View className="flex-1">
                    <View className="rounded-full bg-back flex-row items-center p-2">
                        {/* search icon*/}
                        <Ionicons name="search" color={'grey'} size={20} />
                        {/* input field */}
                        <TextInput 
                            value={searchText}
                            onChangeText={handleSearch}
                            className="flex-1 text-base font-montSemiBold ml-3 text-gray-500" 
                            placeholder={`Tìm kiếm sản phẩm`} 
                            placeholderTextColor={'grey'} 
                        />
                        {searchText ? (
                            <TouchableOpacity onPress={() => handleSearch('')} className="pr-2">
                                <Ionicons name="close-circle" size={20} color="gray" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
                
            </View>
        </>
    )
}