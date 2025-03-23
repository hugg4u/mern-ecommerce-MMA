import { View, Text, TouchableNativeFeedback, ToastAndroid, Alert } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import CusColors from '../../../constants/Colors'
import { useCart } from '../../../context/CartContext'
import { useAuth } from '../../../context/AuthContext'
import { useNavigation } from '@react-navigation/native'

export default function ProductFooter({ product }) {
    const { addItemToCart } = useCart();
    const { isAuthenticated, user, checkLoginStatus, getStoredToken } = useAuth();
    const navigation = useNavigation();
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Kiểm tra trạng thái đăng nhập khi component được render
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await checkLoginStatus();
                const token = await getStoredToken();
                console.log("ProductFooter - Token:", token ? "Có token" : "Không có token");
                console.log("ProductFooter - Trạng thái đăng nhập:", isAuthenticated);
                console.log("ProductFooter - User:", user ? user.name : "Không có thông tin");
                setIsReady(true);
            } catch (error) {
                console.error("ProductFooter - Lỗi khi kiểm tra đăng nhập:", error);
            }
        };
        
        checkAuth();
    }, []);

    // Hàm kiểm tra và điều hướng đăng nhập
    const checkAuthAndRedirect = useCallback(async () => {
        await checkLoginStatus();
        
        if (!isAuthenticated) {
            Alert.alert(
                "Thông báo",
                "Bạn cần đăng nhập để thực hiện chức năng này",
                [
                    {
                        text: "Hủy",
                        style: "cancel"
                    },
                    { 
                        text: "Đăng nhập", 
                        onPress: () => navigation.navigate('Auth', { screen: 'Login' })
                    }
                ]
            );
            return false;
        }
        
        return true;
    }, [isAuthenticated, navigation, checkLoginStatus]);

    const handleAddToCart = async () => {
        // Ngăn thao tác khi đang xử lý
        if (isProcessing) {
            console.log("Đang xử lý, vui lòng đợi");
            ToastAndroid.show('Đang xử lý, vui lòng đợi', ToastAndroid.SHORT);
            return;
        }
        
        console.log("Bấm thêm vào giỏ hàng - Trạng thái đăng nhập:", isAuthenticated);
        
        // Kiểm tra thông tin sản phẩm
        if (!product || !product._id) {
            console.error("Không tìm thấy thông tin sản phẩm");
            ToastAndroid.show('Không thể thêm vào giỏ hàng: Thiếu thông tin sản phẩm', ToastAndroid.SHORT);
            return;
        }
        
        console.log("Thông tin sản phẩm:", product._id);
        console.log("Kiểu dữ liệu productId:", typeof product._id);
        
        // Kiểm tra trạng thái đăng nhập
        const isLoggedIn = await checkAuthAndRedirect();
        if (!isLoggedIn) return;

        // Thêm sản phẩm vào giỏ hàng
        try {
            setIsProcessing(true);
            ToastAndroid.show('Đang thêm vào giỏ hàng...', ToastAndroid.SHORT);
            
            // Đảm bảo ID sản phẩm là string
            const productIdStr = String(product._id);
            console.log("ProductID đã chuyển đổi:", productIdStr);
            
            const success = await addItemToCart(productIdStr);
            
            if (success) {
                ToastAndroid.show('Đã thêm vào giỏ hàng', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error.message || error);
            ToastAndroid.show('Lỗi khi thêm vào giỏ hàng: ' + (error.message || 'Lỗi không xác định'), ToastAndroid.SHORT);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBuyNow = async () => {
        // Ngăn thao tác khi đang xử lý
        if (isProcessing) {
            console.log("Đang xử lý, vui lòng đợi");
            ToastAndroid.show('Đang xử lý, vui lòng đợi', ToastAndroid.SHORT);
            return;
        }
        
        console.log("Bấm mua ngay - Trạng thái đăng nhập:", isAuthenticated);
        
        // Kiểm tra trạng thái đăng nhập
        const isLoggedIn = await checkAuthAndRedirect();
        if (!isLoggedIn) return;

        // Kiểm tra sản phẩm
        if (!product || !product._id) {
            console.error("Không tìm thấy thông tin sản phẩm");
            ToastAndroid.show('Không thể mua ngay: Thiếu thông tin sản phẩm', ToastAndroid.SHORT);
            return;
        }

        // Thêm vào giỏ hàng và chuyển đến trang thanh toán
        try {
            setIsProcessing(true);
            ToastAndroid.show('Đang xử lý...', ToastAndroid.SHORT);
            
            // Đảm bảo ID sản phẩm là string
            const productIdStr = String(product._id);
            const success = await addItemToCart(productIdStr);
            
            if (success) {
                navigation.navigate('Cart');
            } else {
                ToastAndroid.show('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Lỗi khi mua ngay:", error.message || error);
            ToastAndroid.show('Lỗi khi xử lý: ' + (error.message || 'Lỗi không xác định'), ToastAndroid.SHORT);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View className='flex-row justify-between px-3 py-2 bg-white border-t border-gray-200'>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(CusColors.RIPPLECOLOR)}
                onPress={handleAddToCart}
                disabled={isProcessing}
            >
                <View className={`flex-1 mr-2 px-4 py-2 rounded-md ${isProcessing ? 'bg-gray-100' : 'bg-blue-100'} justify-center items-center`}>
                    <Text className={`font-montSemiBold ${isProcessing ? 'text-gray-400' : 'text-blue-600'}`}>
                        {isProcessing ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
                    </Text>
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback 
                background={TouchableNativeFeedback.Ripple(CusColors.RIPPLECOLOR)}
                onPress={handleBuyNow}
                disabled={product?.stock !== 'in stock' || isProcessing}
            >
                <View className={`flex-1 ml-2 px-4 py-2 rounded-md justify-center items-center ${isProcessing ? 'bg-gray-400' : product?.stock === 'in stock' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    <Text className='font-montSemiBold text-white'>
                        {isProcessing ? 'Đang xử lý...' : product?.stock === 'in stock' ? 'Mua ngay' : 'Hết hàng'}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}