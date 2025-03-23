import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Slider, Chip, Divider, Switch } from 'react-native-paper';
import ProductService from '../../services/ProductService';

export default function ProductFilter() {
    const route = useRoute();
    const navigation = useNavigation();
    const { onApplyFilters, currentFilters = {} } = route.params || {};

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: currentFilters.category || null,
        priceMin: currentFilters.priceMin || 0,
        priceMax: currentFilters.priceMax || 10000000,
        sortBy: currentFilters.sortBy || 'newest',
        inStock: currentFilters.inStock !== undefined ? currentFilters.inStock : true,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            console.log('Backend API chưa sẵn sàng, sử dụng danh mục mẫu');
            setCategories(ProductService.getDefaultCategories());
            /*
            const result = await ProductService.getCategories();
            if (result && result.data) {
                setCategories(result.data);
            } else {
                // Sử dụng danh mục mặc định nếu không có dữ liệu từ API
                setCategories(ProductService.getDefaultCategories());
            }
            */
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
            // Sử dụng danh mục mặc định trong trường hợp lỗi
            setCategories(ProductService.getDefaultCategories());
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setFilters(prev => ({
            ...prev,
            category: prev.category === categoryId ? null : categoryId
        }));
    };

    const handleSortSelect = (sortOption) => {
        setFilters(prev => ({
            ...prev,
            sortBy: sortOption
        }));
    };

    const handlePriceChange = (values) => {
        setFilters(prev => ({
            ...prev,
            priceMin: values[0],
            priceMax: values[1]
        }));
    };

    const handleStockChange = (value) => {
        setFilters(prev => ({
            ...prev,
            inStock: value
        }));
    };

    const handleApplyFilters = () => {
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
        navigation.goBack();
    };

    const handleResetFilters = () => {
        setFilters({
            category: null,
            priceMin: 0,
            priceMax: 10000000,
            sortBy: 'newest',
            inStock: true
        });
    };

    // Định dạng số tiền
    const formatCurrency = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Lọc sản phẩm</Text>
                <TouchableOpacity onPress={handleResetFilters}>
                    <Text style={styles.resetText}>Đặt lại</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Danh mục */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danh mục</Text>
                    <View style={styles.categoryContainer}>
                        {categories.map(category => (
                            <Chip
                                key={category.id}
                                selected={filters.category === category.id}
                                onPress={() => handleCategorySelect(category.id)}
                                style={[
                                    styles.categoryChip,
                                    filters.category === category.id && styles.selectedCategoryChip
                                ]}
                                textStyle={[
                                    styles.categoryChipText,
                                    filters.category === category.id && styles.selectedCategoryChipText
                                ]}
                            >
                                {category.type}
                            </Chip>
                        ))}
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Khoảng giá */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Khoảng giá</Text>
                    <Text style={styles.priceRange}>
                        {formatCurrency(filters.priceMin)} - {formatCurrency(filters.priceMax)}
                    </Text>
                    <Slider
                        value={[filters.priceMin, filters.priceMax]}
                        onValueChange={handlePriceChange}
                        minimumValue={0}
                        maximumValue={10000000}
                        step={100000}
                        range
                        style={styles.slider}
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Sắp xếp */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
                    <View style={styles.sortContainer}>
                        <TouchableOpacity
                            style={[
                                styles.sortOption,
                                filters.sortBy === 'newest' && styles.selectedSortOption
                            ]}
                            onPress={() => handleSortSelect('newest')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                filters.sortBy === 'newest' && styles.selectedSortOptionText
                            ]}>Mới nhất</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sortOption,
                                filters.sortBy === 'popular' && styles.selectedSortOption
                            ]}
                            onPress={() => handleSortSelect('popular')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                filters.sortBy === 'popular' && styles.selectedSortOptionText
                            ]}>Phổ biến</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sortOption,
                                filters.sortBy === 'price_asc' && styles.selectedSortOption
                            ]}
                            onPress={() => handleSortSelect('price_asc')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                filters.sortBy === 'price_asc' && styles.selectedSortOptionText
                            ]}>Giá tăng dần</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sortOption,
                                filters.sortBy === 'price_desc' && styles.selectedSortOption
                            ]}
                            onPress={() => handleSortSelect('price_desc')}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                filters.sortBy === 'price_desc' && styles.selectedSortOptionText
                            ]}>Giá giảm dần</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Trạng thái còn hàng */}
                <View style={styles.section}>
                    <View style={styles.stockContainer}>
                        <Text style={styles.sectionTitle}>Chỉ hiển thị sản phẩm còn hàng</Text>
                        <Switch
                            value={filters.inStock}
                            onValueChange={handleStockChange}
                            color="#FFC107"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleApplyFilters}
                    style={styles.applyButton}
                    labelStyle={styles.applyButtonText}
                >
                    Áp dụng
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetText: {
        color: '#FFC107',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
    },
    selectedCategoryChip: {
        backgroundColor: '#FFC107',
    },
    categoryChipText: {
        color: '#000',
    },
    selectedCategoryChipText: {
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    priceRange: {
        marginBottom: 12,
        color: '#FFC107',
        fontWeight: '600',
    },
    slider: {
        height: 40,
    },
    sortContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sortOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    selectedSortOption: {
        backgroundColor: '#FFC107',
    },
    sortOptionText: {
        color: '#000',
    },
    selectedSortOptionText: {
        color: '#fff',
    },
    stockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    applyButton: {
        backgroundColor: '#FFC107',
    },
    applyButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
}); 