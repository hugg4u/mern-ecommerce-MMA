import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function ForgotPassword() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async () => {
        // Kiểm tra email
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
            return;
        }

        try {
            setLoading(true);
            
            // Gọi API reset password
            await AuthService.resetPassword({ email });
            
            // Hiển thị thông báo thành công
            setEmailSent(true);
        } catch (error) {
            console.error('Lỗi reset password:', error);
            Alert.alert(
                'Lỗi',
                'Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.'
            );
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 p-6">
                {/* Header với nút quay lại */}
                <TouchableOpacity 
                    onPress={goToLogin} 
                    className="flex-row items-center mb-6"
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                    <Text className="ml-2 text-base text-gray-800">Quay lại đăng nhập</Text>
                </TouchableOpacity>

                {/* Logo và tiêu đề */}
                <View className="items-center my-6">
                    <Image 
                        source={require('../../assets/logos/logoAll.jpg')}
                        className="w-[200px] h-[40px] mb-6"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-gray-800">Quên mật khẩu</Text>
                    <Text className="text-base text-gray-500 mt-2 text-center">
                        Nhập email của bạn để nhận liên kết khôi phục mật khẩu
                    </Text>
                </View>

                {/* Form quên mật khẩu */}
                {!emailSent ? (
                    <View className="mt-6 space-y-4">
                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="email" />}
                            className="bg-white"
                        />

                        <Button 
                            mode="contained" 
                            onPress={handleResetPassword}
                            className="mt-6 py-1 bg-blue-500"
                            loading={loading}
                            disabled={loading}
                        >
                            Gửi liên kết khôi phục
                        </Button>
                    </View>
                ) : (
                    <View className="mt-6 items-center">
                        <Ionicons name="mail-outline" size={60} color="green" />
                        <Text className="text-lg font-bold text-center mt-4">
                            Email đã được gửi!
                        </Text>
                        <Text className="text-gray-600 text-center mt-2">
                            Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn
                            để khôi phục mật khẩu.
                        </Text>
                        <Button 
                            mode="contained" 
                            onPress={goToLogin}
                            className="mt-8 py-1 bg-blue-500"
                        >
                            Quay lại đăng nhập
                        </Button>
                    </View>
                )}
            </View>
        </ScrollView>
    );
} 