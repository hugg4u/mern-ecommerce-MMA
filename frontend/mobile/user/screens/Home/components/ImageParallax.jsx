import { View, Text, Image, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Carousel, { ParallaxImage } from 'react-native-snap-carousel'
import BannerService from '../../../services/BannerService'

const { width: screenWidth } = Dimensions.get('window');

export default function ImageParallax() {
    const [imageData, setImageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm để fetch dữ liệu banner từ API
    const fetchBanners = async () => {
        try {
            setLoading(true);
            console.log('Bắt đầu fetch banner...');
            
            // Sử dụng BannerService để lấy các banner đang active
            const response = await BannerService.getActiveBanners();
            
            if (response.code === 200 && response.data && response.data.length > 0) {
                console.log(`Đã lấy được ${response.data.length} banner từ server`);
                setImageData(response.data);
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
    };

    // Gọi API khi component mount
    useEffect(() => {
        // Kiểm tra kết nối trực tiếp trước
        const testDirectConnection = async () => {
            try {
                console.log("Đang kiểm tra kết nối trực tiếp...");
                const baseUrl = 'http://10.0.2.2:9999/api/v1'; // URL trực tiếp để kiểm tra
                const response = await fetch(`${baseUrl}/banner/get-banners`);
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
    }, []);

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
                <Text style={{ color: 'red', textAlign: 'center' }}>
                    Không thể tải banner. Vui lòng kiểm tra kết nối mạng và thử lại.
                </Text>
            </View>
        );
    }

    // Đảm bảo có dữ liệu để hiển thị
    if (!imageData || imageData.length === 0) {
        setImageData(BannerService.getDefaultBanners());
    }

    return (
        <Carousel
            data={imageData}
            loop={true}
            autoplay={true}
            renderItem={ItemCard}
            hasParallaxImages={true}
            sliderWidth={screenWidth} // Use your desired width
            firstItem={1}
            autoplayInterval={4000}
            itemWidth={screenWidth - 70} // Use your desired width
            slideStyle={{ display: 'flex', alignItems: 'center' }}
        />
    )
}

const ItemCard = ({ item, index }, parallaxProps) => {
    // Xử lý source cho ParallaxImage, hỗ trợ cả local image và URL
    const source = typeof item === 'object' && item.imageUrl 
        ? (typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl)
        : item;

    return (
        <View className='mt-1' style={{width: screenWidth - 70, height: 200 }}>
            <ParallaxImage
                source={source}
                containerStyle={{ borderRadius: 10, flex: 1 }}
                style={{ resizeMode: 'contain' }}
                parallaxFactor={1}
                {...parallaxProps}
            />
        </View>
    )
}