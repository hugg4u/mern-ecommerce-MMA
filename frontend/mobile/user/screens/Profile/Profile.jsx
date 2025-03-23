import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { TextInput, Button, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import UserService from '../../services/UserService';

export default function Profile() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await UserService.getUserProfile();
            setUserData(data);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                await uploadAvatar(imageUri);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const uploadAvatar = async (imageUri) => {
        try {
            setLoading(true);
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const result = await UserService.uploadAvatar(blob);
            setUserData(prev => ({ ...prev, avatar: result.avatarUrl }));
            Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await UserService.updateUserProfile(userData);
            setIsEditing(false);
            Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        try {
            setLoading(true);
            await UserService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            Alert.alert('Thành công', 'Đổi mật khẩu thành công');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                {/* Avatar Section */}
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={handleImagePick} disabled={loading}>
                        <Avatar.Image
                            size={120}
                            source={userData.avatar ? { uri: userData.avatar } : require('../../assets/logos/user-1.jpg')}
                        />
                    </TouchableOpacity>
                    <Text className="mt-2 text-lg font-bold">{userData.name}</Text>
                </View>

                {/* Profile Form */}
                <View className="space-y-4">
                    <TextInput
                        label="Họ và tên"
                        value={userData.name}
                        onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                        disabled={!isEditing}
                        mode="outlined"
                    />
                    <TextInput
                        label="Email"
                        value={userData.email}
                        disabled={true}
                        mode="outlined"
                    />
                    <TextInput
                        label="Số điện thoại"
                        value={userData.phone}
                        onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                        disabled={!isEditing}
                        mode="outlined"
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        label="Địa chỉ"
                        value={userData.address}
                        onChangeText={(text) => setUserData(prev => ({ ...prev, address: text }))}
                        disabled={!isEditing}
                        mode="outlined"
                        multiline
                    />

                    {/* Action Buttons */}
                    <View className="space-y-3 mt-4">
                        {isEditing ? (
                            <Button
                                mode="contained"
                                onPress={handleUpdateProfile}
                                loading={loading}
                                className="bg-blue-500"
                            >
                                Lưu thay đổi
                            </Button>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={() => setIsEditing(true)}
                                className="bg-blue-500"
                            >
                                Chỉnh sửa thông tin
                            </Button>
                        )}

                        <Button
                            mode="outlined"
                            onPress={() => setShowPasswordModal(true)}
                            className="border-blue-500"
                        >
                            Đổi mật khẩu
                        </Button>
                    </View>
                </View>
            </View>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center p-4">
                    <View className="bg-white rounded-lg p-4 w-full max-w-sm">
                        <Text className="text-xl font-bold mb-4">Đổi mật khẩu</Text>
                        <TextInput
                            label="Mật khẩu hiện tại"
                            value={passwordData.currentPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                        />
                        <TextInput
                            label="Mật khẩu mới"
                            value={passwordData.newPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                        />
                        <TextInput
                            label="Xác nhận mật khẩu mới"
                            value={passwordData.confirmPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                        />
                        <View className="flex-row justify-end space-x-2 mt-4">
                            <Button
                                mode="outlined"
                                onPress={() => setShowPasswordModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleUpdatePassword}
                                loading={loading}
                                className="bg-blue-500"
                            >
                                Đổi mật khẩu
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
} 