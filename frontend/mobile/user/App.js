import { StyleSheet, LogBox } from "react-native";
import { useFonts } from "expo-font";
import React, { useEffect, useCallback } from "react";
import fontFamList from "./constants/FontFamil";
import AppNavigator from "./navigation/AppNavigator";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './constants/themeProvider';
import * as Linking from 'expo-linking';
// added to remove the warning from parallax
import './ignoreWarnings';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
]);

export default function App() {
  const [loaded, error] = useFonts(fontFamList);
  
  // Cấu hình URL scheme cho deep linking
  const linking = {
    prefixes: ['helashop://', 'https://helashop.com'],
    config: {
      screens: {
        OrderStack: {
          screens: {
            OrderDetail: 'order/:orderId',
            PaymentSuccess: 'payment/success/:orderId',
            PaymentError: 'payment/error/:orderId/:errorCode?'
          }
        },
        Home: 'home'
      }
    },
    async getInitialURL() {
      // Lấy URL được dùng để mở ứng dụng
      const url = await Linking.getInitialURL();
      console.log('Initial URL on app open:', url);
      return url;
    },
    subscribe(listener) {
      // Lắng nghe sự kiện URL khi ứng dụng đang chạy
      const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        console.log('Deep link received while app running:', url);
        listener(url);
      });

      return () => {
        // Hủy đăng ký lắng nghe khi component unmount
        linkingSubscription.remove();
      };
    },
  };

  // Đăng ký xử lý URL khi ứng dụng được mở từ URL bên ngoài
  useEffect(() => {
    // Xử lý URL ban đầu khi ứng dụng mở
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log("App opened with URL:", url);
        // URL sẽ được xử lý bởi cấu hình linking ở trên
      }
    };

    handleInitialURL();
  }, []);
  
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <NavigationContainer linking={linking}>
                  <AppNavigator />
                </NavigationContainer>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
