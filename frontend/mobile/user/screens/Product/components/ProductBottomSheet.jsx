import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { forwardRef, useCallback, useMemo } from 'react'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { FontAwesome } from '@expo/vector-icons'

const ProductBottomSheet = forwardRef(({ product }, ref) => {
    // renders
    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );
    
    // Định nghĩa các điểm dừng của bottom sheet
    const snapPoints = useMemo(() => ['50%', '90%'], []);
    
    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return '';
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
                <FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        // Nửa sao
        if (halfStar) {
            stars.push(
                <FontAwesome key="half" name="star-half-o" size={16} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        // Sao trống
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        return (
            <View style={styles.starsContainer}>
                {stars}
            </View>
        );
    };
    
    // Tính rating trung bình
    const calculateAverageRating = () => {
        if (!product || !product.review || product.review.length === 0) {
            return 0;
        }
        
        const sum = product.review.reduce((total, review) => total + review.stars, 0);
        return sum / product.review.length;
    };
    
    // Render từng đánh giá
    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{item.email.split('@')[0]}</Text>
                <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
            </View>
            
            <View style={styles.reviewRating}>
                {renderRatingStars(item.stars)}
                <Text style={styles.ratingNumber}>{item.stars.toFixed(1)}</Text>
            </View>
            
            <Text style={styles.reviewText}>{item.text}</Text>
        </View>
    );
    
    const averageRating = calculateAverageRating();
    const reviews = product?.review || [];
    
    return (
        <BottomSheet
            index={-1}
            ref={ref}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            enableOverDrag
            snapPoints={snapPoints}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Đánh giá và nhận xét</Text>
                
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingLeft}>
                        <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                        <Text style={styles.outOf}>trên 5</Text>
                    </View>
                    
                    <View style={styles.ratingRight}>
                        <View style={styles.ratingStarsContainer}>
                            {renderRatingStars(averageRating)}
                        </View>
                        <Text style={styles.totalReviews}>
                            {reviews.length} {reviews.length === 1 ? 'đánh giá' : 'đánh giá'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.divider} />
                
                {reviews.length === 0 ? (
                    <View style={styles.noReviewsContainer}>
                        <Text style={styles.noReviewsText}>Chưa có đánh giá nào cho sản phẩm này</Text>
                    </View>
                ) : (
                    <BottomSheetScrollView contentContainerStyle={styles.reviewsListContainer}>
                        {reviews.map((review, index) => (
                            <View key={index}>
                                {renderReviewItem({ item: review })}
                                {index < reviews.length - 1 && <View style={styles.reviewDivider} />}
                            </View>
                        ))}
                    </BottomSheetScrollView>
                )}
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingLeft: {
        flex: 1,
        alignItems: 'center',
    },
    averageRating: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
    },
    outOf: {
        fontSize: 14,
        color: '#666',
    },
    ratingRight: {
        flex: 2,
        paddingLeft: 16,
    },
    ratingStarsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    totalReviews: {
        fontSize: 14,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    noReviewsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    reviewsListContainer: {
        paddingBottom: 16,
    },
    reviewItem: {
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        marginRight: 4,
    },
    ratingNumber: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    reviewText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    reviewDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
});

export default ProductBottomSheet;
