import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Avatar, RadioButton, Modal, Portal, Provider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

export default function Profile() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        age: '',
        address: '',
        addressObj: {
            district: '',
            province: '',
            city: '',
            street: '',
            postalCode: ''
        },
        avatar: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressData, setAddressData] = useState({
        district: '',
        province: '',
        city: '',
        street: '',
        postalCode: ''
    });
    const [filteredDistricts, setFilteredDistricts] = useState([]);

    useEffect(() => {
        loadUserProfile();
    }, []);


    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await UserService.getUserProfile();
            setUserData(data);
            
            // Khởi tạo dữ liệu địa chỉ
            if (data.addressObj) {
                setAddressData({
                    district: data.addressObj.district || '',
                    province: data.addressObj.province || '',
                    city: data.addressObj.city || '',
                    street: data.addressObj.street || '',
                    postalCode: data.addressObj.postalCode ? data.addressObj.postalCode.toString() : '',
                });
                
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng: ' + error.message);
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
            console.error('Lỗi khi chọn ảnh:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error.message);
        }
    };

    const uploadAvatar = async (imageUri) => {
        try {
            setLoading(true);
            
            // Trong trường hợp thực tế, bạn cần upload ảnh lên server
            // và nhận URL trả về, rồi cập nhật photoUrl
            // Ví dụ đơn giản ở đây chỉ là gửi URL ảnh
            const result = await UserService.updateAvatar(imageUri);
            
            if (result.success) {
                setUserData(prev => ({ ...prev, avatar: result.avatarUrl }));
                Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
            } else {
                throw new Error(result.message || 'Không thể cập nhật ảnh đại diện');
            }
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            if (!userData.name.trim()) {
                Alert.alert('Lỗi', 'Họ tên không được để trống');
                return;
            }
            
            setLoading(true);
            const response = await UserService.updateUserProfile(userData);
            
            if (response.success) {
                setIsEditing(false);
                Alert.alert('Thành công', 'Cập nhật thông tin thành công');
                // Tải lại thông tin người dùng sau khi cập nhật
                await loadUserProfile();
            } else {
                throw new Error(response.message || 'Không thể cập nhật thông tin');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        try {
            setLoading(true);
            const response = await UserService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            if (response.success) {
                setShowPasswordModal(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                Alert.alert('Thành công', 'Đổi mật khẩu thành công');
            } else {
                throw new Error(response.message || 'Không thể đổi mật khẩu');
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            Alert.alert('Lỗi', 'Không thể đổi mật khẩu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async () => {
        try {
            if (!addressData.province || !addressData.district || !addressData.street) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin địa chỉ');
                return;
            }
            
            setLoading(true);
            const postalCodeValue = addressData.postalCode ? parseInt(addressData.postalCode) : undefined;
            
            const response = await UserService.updateAddress({
                ...addressData,
                postalCode: postalCodeValue
            });
            
            if (response.success) {
                setShowAddressModal(false);
                Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');
                // Tải lại thông tin người dùng sau khi cập nhật
                await loadUserProfile();
            } else {
                throw new Error(response.message || 'Không thể cập nhật địa chỉ');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật địa chỉ:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            Alert.alert(
                'Xác nhận',
                'Bạn có chắc chắn muốn đăng xuất?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel'
                    },
                    {
                        text: 'Đăng xuất',
                        onPress: async () => {
                            setLoading(true);
                            const success = await AuthService.logout();
                            
                            if (success) {
                                Alert.alert('Thành công', 'Bạn đã đăng xuất thành công');
                                // Điều hướng về màn hình Home
                                navigation.navigate('homeScreen');
                            } else {
                                Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
                            }
                            setLoading(false);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng xuất');
            setLoading(false);
        }
    };

    const handleViewOrders = () => {
        navigation.navigate('OrderHistory');
    };

    return (
        <Provider>
            <ScrollView className="flex-1 bg-white">
                {loading && (
                    <View className="absolute inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                )}
                
                <View className="p-4">
                    {/* Avatar Section */}
                    <View className="items-center mb-6">
                        <TouchableOpacity onPress={handleImagePick} disabled={loading}>
                            <View className="relative">
                                <Avatar.Image
                                    size={120}
                                    source={userData.avatar ? { uri: userData.avatar } : require('../../assets/logos/user-1.jpg')}
                                />
                                <View className="absolute right-0 bottom-0 bg-primary rounded-full p-1">
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Text className="mt-2 text-lg font-bold">{userData.name}</Text>
                        <Text className="text-gray-500">{userData.email}</Text>
                    </View>

                    {/* Profile Form */}
                    <View className="space-y-4">
                        <TextInput
                            label="Họ và tên"
                            value={userData.name}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                            disabled={!isEditing || loading}
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
                            disabled={!isEditing || loading}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        
                        {isEditing ? (
                            <>
                                <View className="mb-4">
                                    <Text className="mb-2 text-gray-700">Giới tính</Text>
                                    <RadioButton.Group 
                                        onValueChange={value => setUserData(prev => ({ ...prev, gender: value }))} 
                                        value={userData.gender}
                                    >
                                        <View className="flex-row">
                                            <View className="flex-row items-center mr-4">
                                                <RadioButton value="male" disabled={loading} />
                                                <Text>Nam</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <RadioButton value="female" disabled={loading} />
                                                <Text>Nữ</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                </View>
                                
                                <TextInput
                                    label="Tuổi"
                                    value={userData.age}
                                    onChangeText={(text) => setUserData(prev => ({ ...prev, age: text }))}
                                    disabled={loading}
                                    mode="outlined"
                                    keyboardType="number-pad"
                                />
                            </>
                        ) : null}
                        
                        <View className="mb-4">
                            <Text className="mb-2 text-gray-700">Địa chỉ</Text>
                            <TouchableOpacity 
                                onPress={() => setShowAddressModal(true)} 
                                className="border border-gray-300 rounded-md p-3"
                            >
                                <Text>
                                    {userData.address || 'Chưa có địa chỉ'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View className="space-y-3 mt-4">
                            {isEditing ? (
                                <View className="flex-row space-x-2">
                                    <Button
                                        mode="contained"
                                        onPress={handleUpdateProfile}
                                        loading={loading}
                                        className="flex-1 bg-blue-500"
                                    >
                                        Lưu thay đổi
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setIsEditing(false)}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </Button>
                                </View>
                            ) : (
                                <Button
                                    mode="contained"
                                    onPress={() => setIsEditing(true)}
                                    className="bg-blue-500"
                                    disabled={loading}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            )}

                            <Button
                                mode="outlined"
                                onPress={() => setShowPasswordModal(true)}
                                className="border-blue-500"
                                disabled={loading}
                            >
                                Đổi mật khẩu
                            </Button>
                            
                            <Button
                                mode="outlined"
                                onPress={handleViewOrders}
                                className="border-green-500"
                                disabled={loading}
                                icon="history"
                            >
                                Lịch sử đơn hàng
                            </Button>
                            
                            <Button
                                mode="outlined"
                                onPress={handleLogout}
                                className="border-red-500 mt-4"
                                loading={loading}
                                icon="logout"
                                textColor="red"
                            >
                                Đăng xuất
                            </Button>
                        </View>
                    </View>
                </View>

                {/* Password Change Modal */}
                <Portal>
                    <Modal 
                        visible={showPasswordModal} 
                        onDismiss={() => setShowPasswordModal(false)}
                        contentContainerStyle={{
                            backgroundColor: 'white',
                            borderRadius: 10,
                            margin: 20,
                            padding: 20
                        }}
                    >
                        <Text className="text-xl font-bold mb-4">Đổi mật khẩu</Text>
                        <TextInput
                            label="Mật khẩu hiện tại"
                            value={passwordData.currentPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                            className="mb-2"
                        />
                        <TextInput
                            label="Mật khẩu mới"
                            value={passwordData.newPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                            className="mb-2"
                        />
                        <TextInput
                            label="Xác nhận mật khẩu mới"
                            value={passwordData.confirmPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                            secureTextEntry
                            mode="outlined"
                            className="mb-4"
                        />
                        <View className="flex-row justify-end space-x-2">
                            <Button 
                                mode="outlined" 
                                onPress={() => setShowPasswordModal(false)}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button 
                                mode="contained" 
                                onPress={handleUpdatePassword}
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                        </View>
                    </Modal>
                </Portal>

                {/* Address Modal */}
                <Portal>
                    <Modal 
                        visible={showAddressModal} 
                        onDismiss={() => setShowAddressModal(false)}
                        contentContainerStyle={{
                            backgroundColor: 'white',
                            borderRadius: 10,
                            margin: 20,
                            padding: 20
                        }}
                    >
                        <Text className="text-xl font-bold mb-4">Cập nhật địa chỉ</Text>
                        
                        <Text className="mb-1 text-gray-700">Tỉnh/Thành phố</Text>
                        <TextInput
                            label="Tỉnh/Thành phố"
                            value={addressData.province}
                            onChangeText={(text) => setAddressData(prev => ({ ...prev, province: text }))}
                            mode="outlined"
                            className="mb-2"
                            multiline
                        />
                        
                        <Text className="mb-1 text-gray-700">Quận/Huyện</Text>
                        <TextInput
                            label="Quận/huyện"
                            value={addressData.district}
                            onChangeText={(text) => setAddressData(prev => ({ ...prev, district: text }))}
                            mode="outlined"
                            className="mb-2"
                            multiline
                        />
                        
                        <TextInput
                            label="Thành phố/Thị xã"
                            value={addressData.city}
                            onChangeText={(text) => setAddressData(prev => ({ ...prev, city: text }))}
                            mode="outlined"
                            className="mb-2"
                        />
                        
                        <TextInput
                            label="Địa chỉ chi tiết"
                            value={addressData.street}
                            onChangeText={(text) => setAddressData(prev => ({ ...prev, street: text }))}
                            mode="outlined"
                            className="mb-2"
                            multiline
                        />
                        
                        <TextInput
                            label="Mã bưu điện"
                            value={addressData.postalCode}
                            onChangeText={(text) => setAddressData(prev => ({ ...prev, postalCode: text }))}
                            keyboardType="number-pad"
                            mode="outlined"
                            className="mb-4"
                        />
                        
                        <View className="flex-row justify-end space-x-2">
                            <Button 
                                mode="outlined" 
                                onPress={() => setShowAddressModal(false)}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button 
                                mode="contained" 
                                onPress={handleUpdateAddress}
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </ScrollView>
        </Provider>
    );
} 