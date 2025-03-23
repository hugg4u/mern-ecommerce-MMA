import { View, Text, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Appbar, Avatar } from 'react-native-paper'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import UserService from '../../services/UserService';

export default function MainHeader({ onSearch, onFilter }) {
    const navigation = useNavigation();
    const [userAvatar, setUserAvatar] = React.useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    React.useEffect(() => {
        loadUserAvatar();
    }, []);

    const loadUserAvatar = async () => {
        try {
            const userData = await UserService.getUserProfile();
            if (userData && userData.avatar) {
                setUserAvatar(userData.avatar);
            }
        } catch (error) {
            console.error('Lỗi khi tải avatar:', error);
        }
    };

    const handleAvatarPress = () => {
        navigation.navigate('Profile');
    };

    const handleSearch = (text) => {
        setSearchText(text);
        
        // Xóa timeout cũ nếu có
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Đặt timeout mới để tránh gọi quá nhiều lần khi người dùng gõ
        const newTimeout = setTimeout(() => {
            if (onSearch) {
                onSearch(text);
            }
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilter = () => {
        // Điều hướng đến màn hình lọc
        console.log('Đang mở màn hình lọc sản phẩm...');
        navigation.navigate('ProductFilter', {
            onApplyFilters: (filters) => {
                if (onFilter) onFilter(filters);
            }
        });
    };

    return (
        <>
            <Appbar.Header className="flex-row justify-between items-center px-[12px] bg-white shadow-sm">
                <Image className="w-[155px] h-[30px] ml-1" source={require('../../assets/logos/logoAll.jpg')} />
                <View className="flex-row items-center">
                    <TouchableOpacity activeOpacity={0.9} onPress={handleAvatarPress}>
                        <Avatar.Image 
                            size={35} 
                            source={userAvatar ? { uri: userAvatar } : require('../../assets/logos/user-1.jpg')} 
                        />
                    </TouchableOpacity>
                </View>
            </Appbar.Header>
            {/* row 2 view */}
            <View className="flex-row justify-between items-center bg-white px-[12px] pb-3">
                {/* search view */}
                <View className="flex-1">
                    <View className="rounded-full bg-back flex-row items-center p-2">
                        {/* search icon*/}
                        <Ionicons name="search" color={'grey'} size={20} />
                        {/* input field */}
                        <TextInput 
                            value={searchText}
                            onChangeText={handleSearch}
                            className="flex-1 text-base font-montSemiBold ml-3 text-gray-500" 
                            placeholder={`Tìm kiếm sản phẩm`} 
                            placeholderTextColor={'grey'} 
                        />
                        {searchText ? (
                            <TouchableOpacity onPress={() => handleSearch('')} className="pr-2">
                                <Ionicons name="close-circle" size={20} color="gray" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
                {/* filter button */}
            </View>
        </>
        // <Appbar.Header>
        //     <Appbar.BackAction />
        //     <Appbar.Content title="Title" />
        //     <Appbar.Action icon="magnify" />
        //     <Appbar.Action icon="dots-vertical" />
        // </Appbar.Header>
    )
}