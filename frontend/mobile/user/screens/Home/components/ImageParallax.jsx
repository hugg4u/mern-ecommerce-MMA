import { View, Text, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'

// Xử lý lỗi ViewPropTypes
import * as DeprecatedViewPropTypes from 'deprecated-react-native-prop-types';

// Tùy chỉnh lại cách import để giải quyết vấn đề với ViewPropTypes
const createCompatComponent = (Component) => {
  // Wrap component trong một HOC
  const WrappedComponent = (props) => {
    return <Component {...props} />;
  };
  return WrappedComponent;
};

// Import components với ViewPropTypes đã được xử lý
import Carousel from 'react-native-snap-carousel';
import { ParallaxImage } from 'react-native-snap-carousel';

// Tạo component tương thích
const CompatCarousel = createCompatComponent(Carousel);
const CompatParallaxImage = createCompatComponent(ParallaxImage);

import BannerService from '../../../services/BannerService'

const { width: screenWidth } = Dimensions.get('window');

export default function ImageParallax() {
    const [imageData, setImageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Hàm để fetch dữ liệu banner từ API
    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Bắt đầu fetch banner...');
            
            // Sử dụng BannerService để lấy các banner đang active
            const response = await BannerService.getActiveBanners();
            
            if (response.code === 200 && response.data && response.data.length > 0) {
                console.log(`Đã lấy được ${response.data.length} banner từ server`);
                
                // Kiểm tra cấu trúc dữ liệu và đảm bảo các trường bắt buộc tồn tại
                const validBanners = response.data.filter(banner => 
                    banner && banner.imageUrl && (
                        typeof banner.imageUrl === 'string' || 
                        typeof banner.imageUrl === 'number'
                    )
                );
                
                if (validBanners.length > 0) {
                    setImageData(validBanners);
                } else {
                    console.log('Không có banner hợp lệ, sử dụng dữ liệu mặc định');
                    setImageData(BannerService.getDefaultBanners());
                }
            } else {
                console.log('Không có banner nào từ API, sử dụng dữ liệu mặc định');
                // Sử dụng defaultBanners từ BannerService
                setImageData(BannerService.getDefaultBanners());
            }
        } catch (err) {
            console.error('Lỗi khi fetch banner:', err);
            setError(err);
            console.log('Sử dụng dữ liệu mặc định do lỗi');
            // Sử dụng defaultBanners từ BannerService
            setImageData(BannerService.getDefaultBanners());
        } finally {
            setLoading(false);
        }
    }, []);

    // Retry fetching banners with a delay
    const retryFetchBanners = useCallback(() => {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchBanners, 2000); // Thử lại sau 2 giây
    }, [fetchBanners]);

    // Gọi API khi component mount
    useEffect(() => {
        // Kiểm tra kết nối trực tiếp trước
        const testDirectConnection = async () => {
            try {
                console.log("Đang kiểm tra kết nối trực tiếp...");
                const baseUrl = 'http://10.0.2.2:9999/api/v1'; // URL trực tiếp để kiểm tra
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(`${baseUrl}/banner/get-banners`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const data = await response.json();
                console.log("Kết nối trực tiếp thành công:", data?.data?.banners?.length || 0, "banners");
            } catch (err) {
                console.error("Lỗi kết nối trực tiếp:", err.message);
            } finally {
                // Sau khi kiểm tra kết nối trực tiếp, thử gọi service chính
                fetchBanners();
            }
        };
        
        testDirectConnection();
    }, [fetchBanners]);

    // Hiển thị loading khi đang fetch dữ liệu
    if (loading) {
        return (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Hiển thị thông báo lỗi nếu có và không có dữ liệu
    if (error && (!imageData || imageData.length === 0)) {
        return (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
                    Không thể tải banner. Vui lòng kiểm tra kết nối mạng và thử lại.
                </Text>
                <TouchableOpacity 
                    onPress={retryFetchBanners}
                    style={{
                        backgroundColor: '#2196F3',
                        padding: 10,
                        borderRadius: 5
                    }}
                >
                    <Text style={{ color: 'white' }}>Thử lại ({retryCount})</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Đảm bảo có dữ liệu để hiển thị
    if (!imageData || imageData.length === 0) {
        setImageData(BannerService.getDefaultBanners());
    }

    return (
        <CompatCarousel
            data={imageData}
            loop={true}
            autoplay={true}
            renderItem={ItemCard}
            hasParallaxImages={true}
            sliderWidth={screenWidth}
            firstItem={1}
            autoplayInterval={4000}
            itemWidth={screenWidth - 70}
            slideStyle={{ display: 'flex', alignItems: 'center' }}
        />
    )
}

const ItemCard = ({ item, index }, parallaxProps) => {
    // Kiểm tra và xử lý source cho ParallaxImage
    let source;
    if (typeof item === 'object' && item.imageUrl) {
        // Xử lý các loại dữ liệu imageUrl khác nhau
        if (typeof item.imageUrl === 'string') {
            // Trường hợp URL từ API
            source = { uri: item.imageUrl };
        } else {
            // Trường hợp require() local image
            source = item.imageUrl;
        }
    } else {
        // Fallback nếu không có cấu trúc dữ liệu chuẩn
        source = item;
    }

    return (
        <View className='mt-1' style={{width: screenWidth - 70, height: 200 }}>
            <CompatParallaxImage
                source={source}
                containerStyle={{ borderRadius: 10, flex: 1 }}
                style={{ resizeMode: 'contain' }}
                parallaxFactor={1}
                {...parallaxProps}
            />
        </View>
    )
}