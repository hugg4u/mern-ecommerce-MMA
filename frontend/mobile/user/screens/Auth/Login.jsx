import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, StackActions } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        // Kiểm tra thông tin đăng nhập
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        try {
            setLoading(true);
            const result = await AuthService.login({
                email,
                password,
                role: 'user'
            });
            
            // Kiểm tra kết quả đăng nhập
            console.log('Kết quả đăng nhập:', JSON.stringify(result));
            
            if (result.success) {
                console.log('Đăng nhập thành công, có token');
                
                // Kiểm tra lại token
                const isLoggedIn = await AuthService.isLoggedIn();
                console.log('Kiểm tra lại đăng nhập:', isLoggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập');
                
                // Điều hướng về màn hình chính
                navigation.dispatch(
                    StackActions.replace('Main', { screen: 'homeScreen' })
                );
            } else {
                console.warn('Đăng nhập thất bại:', result.error);
                Alert.alert(
                    'Đăng nhập thất bại',
                    'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
                );
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            Alert.alert(
                'Đăng nhập thất bại',
                'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const goToRegister = () => {
        navigation.navigate('Register');
    };

    const goToForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 p-6">
                {/* Logo và tiêu đề */}
                <View className="items-center my-8">
                    <Image 
                        source={require('../../assets/logos/logoAll.jpg')}
                        className="w-[200px] h-[40px] mb-6"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-gray-800">Đăng nhập</Text>
                    <Text className="text-base text-gray-500 mt-2 text-center">
                        Vui lòng đăng nhập để tiếp tục mua sắm
                    </Text>
                </View>

                {/* Form đăng nhập */}
                <View className="mt-4 space-y-4">
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

                    <View>
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
                        
                        <TouchableOpacity 
                            onPress={goToForgotPassword}
                            className="self-end mt-2"
                        >
                            <Text className="text-blue-500">Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={handleLogin}
                        className="mt-6 py-1 bg-blue-500"
                        loading={loading}
                        disabled={loading}
                    >
                        Đăng nhập
                    </Button>
                </View>

                {/* Đăng ký */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-600">Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={goToRegister}>
                        <Text className="text-blue-500 font-bold">Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>

                {/* Tiếp tục không đăng nhập */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Main', { screen: 'homeScreen' })}
                    className="mt-10 self-center"
                >
                    <Text className="text-gray-500">Tiếp tục không đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
} 