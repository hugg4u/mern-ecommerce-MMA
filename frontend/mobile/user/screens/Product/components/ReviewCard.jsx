import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons'

export default function ReviewCard({ reviews = [] }) {
    // Tính trung bình rating
    const calculateAverageRating = () => {
        if (!reviews || reviews.length === 0) {
            return 0;
        }
        
        const sum = reviews.reduce((total, review) => total + review.stars, 0);
        return sum / reviews.length;
    };
    
    const averageRating = calculateAverageRating();
    
    // Hiển thị tối đa 3 đánh giá
    const displayReviews = reviews.slice(0, 3);
    
    // Format ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };
    
    // Render các ngôi sao đánh giá
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        
        // Sao đầy đủ
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FontAwesome key={`full-${i}`} name="star" size={12} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        // Nửa sao
        if (halfStar) {
            stars.push(
                <FontAwesome key="half" name="star-half-o" size={12} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        // Sao trống
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome key={`empty-${i}`} name="star-o" size={12} color="#FFD700" style={{marginRight: 2}} />
            );
        }
        
        return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {stars}
            </View>
        );
    };
    
    return (
        <View className='bg-white p-3 mt-3 rounded-xl border border-gray-200'>
            <View className='flex-row justify-between items-center'>
                <Text className='font-montBold text-base'>Đánh giá ({reviews.length})</Text>
                <View className='flex-row items-center'>
                    {renderRatingStars(averageRating)}
                    <Text className='ml-1 font-montMedium text-xs'>{averageRating.toFixed(1)}/5</Text>
                </View>
            </View>
            
            {/* Hiển thị các đánh giá */}
            {displayReviews.length > 0 ? (
                displayReviews.map((review, index) => (
                    <View key={index} className='mt-3 pb-2 border-b border-gray-100'>
                        <View className='flex-row justify-between items-center'>
                            <Text className='font-montSemiBold'>{review.email.split('@')[0]}</Text>
                            <Text className='text-xs text-gray-500'>{formatDate(review.created_at)}</Text>
                        </View>
                        <View className='mt-1'>
                            {renderRatingStars(review.stars)}
                        </View>
                        <Text className='mt-1 text-sm text-gray-700'>{review.text}</Text>
                    </View>
                ))
            ) : (
                <Text className='mt-3 text-sm text-gray-500 italic'>Chưa có đánh giá nào.</Text>
            )}
            
            {reviews.length > 3 && (
                <Text className='mt-3 text-sm text-blue-600 text-center font-montSemiBold'>
                    Xem thêm {reviews.length - 3} đánh giá khác
                </Text>
            )}
        </View>
    )
}