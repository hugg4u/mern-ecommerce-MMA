import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons'

export default function ReviewCard({ reviews = [] }) {
    // Tính điểm đánh giá trung bình
    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
        return sum / reviews.length;
    };
    
    const averageRating = calculateAverageRating();
    
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
    
    // Chọn tối đa 2 đánh giá để hiển thị
    const displayedReviews = reviews.slice(0, 2);
    
    return (
        <View className="my-3 p-3 bg-gray-50 rounded-md">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-montBold text-lg">Đánh giá</Text>
                <View className="flex-row items-center">
                    {renderRatingStars(averageRating)}
                    <Text className="ml-2 font-montSemiBold text-gray-500">
                        {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                    </Text>
                </View>
            </View>
            
            {reviews.length === 0 ? (
                <View className="py-2">
                    <Text className="text-gray-500 italic">Chưa có đánh giá nào</Text>
                </View>
            ) : (
                <>
                    {displayedReviews.map((review, index) => (
                        <View key={index} className="mb-2 pb-2 border-b border-gray-200">
                            <View className="flex-row justify-between items-center">
                                <Text className="font-montSemiBold">
                                    {review.email ? review.email.split('@')[0] : 'Khách hàng'}
                                </Text>
                                <View className="flex-row items-center">
                                    {renderRatingStars(review.stars)}
                                </View>
                            </View>
                            <Text className="mt-1 text-gray-700">{review.text}</Text>
                        </View>
                    ))}
                    
                    {reviews.length > 2 && (
                        <View className="mt-2">
                            <Text className="text-blue-500 font-montSemiBold">
                                Xem thêm {reviews.length - 2} đánh giá khác
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    )
}