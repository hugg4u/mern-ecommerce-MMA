import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductCard({ product }) {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('homeStack', {
            screen: 'ProductDetail',
            params: { productId: product.pid }
        });
    };

    // Tính giá sau giảm giá
    const discountedPrice = product.price * (1 - product.discount / 100);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* Ảnh sản phẩm */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.imgUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {product.discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                )}
                {product.stock === 'out of stock' && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Hết hàng</Text>
                    </View>
                )}
            </View>

            {/* Thông tin sản phẩm */}
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                
                <View style={styles.priceContainer}>
                    <Text style={styles.discountedPrice}>
                        {discountedPrice.toLocaleString('vi-VN')}đ
                    </Text>
                    
                    {product.discount > 0 && (
                        <Text style={styles.originalPrice}>
                            {product.price.toLocaleString('vi-VN')}đ
                        </Text>
                    )}
                </View>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                        {product.rating || '5.0'}
                    </Text>
                    <Text style={styles.reviewCount}>
                        ({product.reviewCount || (product.review ? product.review.length : 0)})
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        maxWidth: '48%',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        height: 40,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    discountedPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    originalPrice: {
        fontSize: 12,
        color: 'gray',
        textDecorationLine: 'line-through',
        marginLeft: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 2,
    },
    reviewCount: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 2,
    },
}); 