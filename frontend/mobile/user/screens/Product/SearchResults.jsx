import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductService from '../../services/ProductService';
import ProductCard from '../../components/Product/ProductCard';

export default function SearchResults() {
    const route = useRoute();
    const navigation = useNavigation();
    const { searchQuery, filterParams } = route.params || { searchQuery: '', filterParams: null };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState(searchQuery);
    const [activeFilters, setActiveFilters] = useState(filterParams || {});
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        searchProducts();
    }, [searchQuery, activeFilters]);

    const searchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Gọi API tìm kiếm sản phẩm với các tham số tìm kiếm và lọc
            const results = await ProductService.searchProducts(searchText, activeFilters);
            setProducts(results);
        } catch (error) {
            console.error('Lỗi tìm kiếm sản phẩm:', error);
            setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        if (searchText.trim()) {
            navigation.setParams({ searchQuery: searchText.trim() });
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        searchProducts();
    };

    const handleFilter = () => {
        navigation.navigate('homeStack', {
            screen: 'ProductFilter',
            params: {
                currentFilters: activeFilters,
                onApplyFilters: (filters) => {
                    navigation.setParams({ filterParams: filters });
                    setActiveFilters(filters);
                }
            }
        });
    };

    const renderFilterBadges = () => {
        if (!activeFilters || Object.keys(activeFilters).length === 0) {
            return null;
        }

        return (
            <View className="flex-row flex-wrap mt-2">
                {Object.keys(activeFilters).map((key) => {
                    if (!activeFilters[key]) return null;
                    
                    // Xử lý hiển thị badge tùy thuộc vào loại filter
                    let displayText = '';
                    switch (key) {
                        case 'priceMin':
                            displayText = `Giá từ: ${activeFilters[key].toLocaleString('vi-VN')}đ`;
                            break;
                        case 'priceMax':
                            displayText = `Giá đến: ${activeFilters[key].toLocaleString('vi-VN')}đ`;
                            break;
                        case 'category':
                            displayText = `Danh mục: ${activeFilters[key]}`;
                            break;
                        case 'sortBy':
                            const sortLabels = {
                                'price_asc': 'Giá: Thấp đến cao',
                                'price_desc': 'Giá: Cao đến thấp',
                                'newest': 'Mới nhất',
                                'popular': 'Phổ biến nhất'
                            };
                            displayText = sortLabels[activeFilters[key]] || activeFilters[key];
                            break;
                        default:
                            displayText = `${key}: ${activeFilters[key]}`;
                    }

                    return (
                        <View key={key} className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                            <Text className="text-gray-800 text-sm">{displayText}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    const newFilters = { ...activeFilters };
                                    delete newFilters[key];
                                    setActiveFilters(newFilters);
                                }}
                                className="ml-1"
                            >
                                <Ionicons name="close-circle" size={16} color="gray" />
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {Object.keys(activeFilters).length > 0 && (
                    <TouchableOpacity
                        onPress={() => setActiveFilters({})}
                        className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2"
                    >
                        <Text className="text-gray-800 text-sm">Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderHeader = () => (
        <View className="mb-4">
            <View className="flex-row items-center bg-white px-4 py-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-1">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        placeholder="Tìm kiếm sản phẩm"
                        className="flex-1 ml-2 text-base py-1"
                        returnKeyType="search"
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="gray" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity onPress={handleFilter} className="ml-3">
                    <Ionicons name="options-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
            {renderFilterBadges()}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2 text-gray-600">Đang tải kết quả...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {renderHeader()}
            
            {error ? (
                <View className="flex-1 justify-center items-center p-4">
                    <Ionicons name="alert-circle-outline" size={48} color="red" />
                    <Text className="text-center mt-2 text-red-500">{error}</Text>
                    <TouchableOpacity 
                        onPress={searchProducts}
                        className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View className="px-4 mb-2 flex-row justify-between items-center">
                        <Text className="text-gray-700">
                            {products.length > 0 
                                ? `${products.length} kết quả cho "${searchQuery}"` 
                                : `Không tìm thấy kết quả cho "${searchQuery}"`}
                        </Text>
                    </View>
                    
                    <FlatList
                        data={products}
                        renderItem={({ item }) => <ProductCard product={item} />}
                        keyExtractor={item => item.pid.toString()}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center p-4">
                                <Ionicons name="search-outline" size={48} color="gray" />
                                <Text className="text-center mt-2 text-gray-500">
                                    Không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn
                                </Text>
                            </View>
                        }
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                </>
            )}
        </View>
    );
} 