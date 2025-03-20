import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductService from '../../../services/ProductService';

const HomeCategory = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, [retryCount]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ProductService.getCategories();
            if (response.code === 200 && response.data && response.data.length > 0) {
                setCategories(response.data);
            } else {
                setError('Không thể tải danh sách danh mục');
            }
        } catch (err) {
            console.error('Lỗi khi fetch categories:', err);
            setError('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const renderCategory = ({ item }) => (
        <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('homeStack', {
                screen: 'CategoryProducts',
                params: { category: item.type }
            })}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.categoryImage}
                resizeMode="cover"
            />
            <Text style={styles.categoryName}>{item.type}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Đang tải danh mục...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => setRetryCount(prev => prev + 1)}
                >
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Danh mục</Text>
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        marginBottom: 10,
        color: '#333',
    },
    categoryList: {
        paddingHorizontal: 8,
    },
    categoryCard: {
        marginHorizontal: 8,
        width: 100,
        alignItems: 'center',
    },
    categoryImage: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
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
});

export default HomeCategory;