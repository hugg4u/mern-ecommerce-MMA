import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ProductService from '../services/ProductService';
import { FontAwesome } from '@expo/vector-icons';
import Header from './Product/components/Header';

const CategoryProducts = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { category } = route.params;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Xác định tiêu đề màn hình
    const screenTitle = category === 'all' ? 'Tất cả sản phẩm' : category;

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Bắt đầu tải danh sách sản phẩm cho danh mục:', category);
            
            const response = await ProductService.getAllProducts();
            console.log('Response từ API:', JSON.stringify(response));
            
            // Kiểm tra cả success và code để tương thích với nhiều cách trả về
            if ((response.success || response.code === 200) && response.data) {
                let productData = Array.isArray(response.data) ? response.data : response.data.products || [];
                console.log('Số lượng sản phẩm lấy được:', productData.length);
                
                if (category === 'all') {
                    // Không lọc khi xem tất cả sản phẩm
                    setProducts(productData);
                    console.log('Hiển thị tất cả sản phẩm, không lọc');
                } else {
                    // Lọc sản phẩm theo danh mục
                    console.log('Danh mục cần lọc:', category);
                    const filteredProducts = productData.filter(
                        product => product.category === category
                    );
                    console.log('Số lượng sản phẩm sau khi lọc:', filteredProducts.length);
                    setProducts(filteredProducts);
                }
            } else {
                console.error('API trả về lỗi hoặc không có dữ liệu:', response);
                setError('Không thể tải danh sách sản phẩm');
            }
        } catch (err) {
            console.error('Lỗi khi fetch products:', err);
            setError('Lỗi kết nối đến máy chủ: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị đánh giá sao
    const renderRating = (item) => {
        // Tính rating trung bình từ mảng review
        const calculateRating = () => {
            if (!item || !item.review || !Array.isArray(item.review) || item.review.length === 0) {
                return 0;
            }
            
            const sum = item.review.reduce((total, review) => {
                // Đảm bảo stars là số
                const stars = parseFloat(review.stars) || 0;
                return total + stars;
            }, 0);
            
            return sum / item.review.length;
        };
        
        const rating = item.rating || calculateRating();
        
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        
        // Đầy đủ sao
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FontAwesome key={`full-${i}`} name="star" size={14} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        // Nửa sao
        if (halfStar) {
            stars.push(
                <FontAwesome key="half" name="star-half-o" size={14} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        // Sao trống
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome key={`empty-${i}`} name="star-o" size={14} color="#FFD700" style={styles.starIcon} />
            );
        }
        
        return (
            <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>{stars}</View>
                <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
            </View>
        );
    };

    const renderProduct = ({ item }) => (
        <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigation.navigate('homeStack', {
                screen: 'product',
                params: { product: item }
            })}
        >
            <Image 
                source={{ uri: item.imgUrl }} 
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                
                {renderRating(item)}
                
                {item.discount > 0 ? (
                    <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>${item.price}</Text>
                        <Text style={styles.discountPrice}>
                            ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.price}>${item.price}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header name={screenTitle} />
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                products.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {category === 'all' ? 'Không có sản phẩm nào' : 'Không có sản phẩm nào trong danh mục này'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={item => item.pid}
                        numColumns={2}
                        contentContainerStyle={styles.productList}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    productList: {
        padding: 8,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    },
    productCard: {
        width: '47%',
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    starIcon: {
        marginRight: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    priceContainer: {
        flexDirection: 'column',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff0000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default CategoryProducts; 