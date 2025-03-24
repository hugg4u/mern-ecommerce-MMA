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
// added to remove the warning from parallax
import './ignoreWarnings';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
]);

export default function App() {
  const [loaded, error] = useFonts(fontFamList);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <NavigationContainer>
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
