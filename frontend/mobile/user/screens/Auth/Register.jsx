import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function Register() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleRegister = async () => {
        // Kiểm tra thông tin đăng ký
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng ký');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            const response = await AuthService.register({
                name,
                email,
                password,
                role: 'user'
            });
            
            // Đăng ký thành công
            Alert.alert(
                'Đăng ký thành công',
                'Tài khoản đã được tạo thành công',
                [
                    {
                        text: 'Đăng nhập ngay',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            Alert.alert(
                'Đăng ký thất bại',
                'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
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
                {/* Logo và tiêu đề */}
                <View className="items-center my-6">
                    <Image 
                        source={require('../../assets/logos/logoAll.jpg')}
                        className="w-[200px] h-[40px] mb-4"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</Text>
                    <Text className="text-base text-gray-500 mt-2 text-center">
                        Tạo tài khoản để tiếp tục mua sắm
                    </Text>
                </View>

                {/* Form đăng ký */}
                <View className="mt-4 space-y-3">
                    <TextInput
                        label="Họ và tên"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        left={<TextInput.Icon icon="account" />}
                        className="bg-white"
                    />

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

                    <TextInput
                        label="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        mode="outlined"
                        left={<TextInput.Icon icon="lock" />}
                        right={
                            <TextInput.Icon 
                                icon={showPassword ? "eye-off" : "eye"} 
                                onPress={toggleShowPassword} 
                            />
                        }
                        className="bg-white"
                    />

                    <TextInput
                        label="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        mode="outlined"
                        left={<TextInput.Icon icon="lock-check" />}
                        right={
                            <TextInput.Icon 
                                icon={showConfirmPassword ? "eye-off" : "eye"} 
                                onPress={toggleShowConfirmPassword} 
                            />
                        }
                        className="bg-white"
                    />

                    <Text className="text-gray-500 text-sm mt-2">
                        Bằng cách đăng ký, bạn đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của HelaShop
                    </Text>

                    <Button 
                        mode="contained" 
                        onPress={handleRegister}
                        className="mt-4 py-1 bg-blue-500"
                        loading={loading}
                        disabled={loading}
                    >
                        Đăng ký
                    </Button>
                </View>

                {/* Đăng nhập */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600">Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={goToLogin}>
                        <Text className="text-blue-500 font-bold">Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
} 