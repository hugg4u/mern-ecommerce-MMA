import { useFonts } from "expo-font";
import Welcome from "./screens/Welcome";
import fontFamList from "./constants/FontFamil";
import AppNavigator from "./navigation/AppNavigator";
import AuthStack from "./navigation/AuthStack/AuthStack";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
// added to remove the warnig from parallax
import './ignoreWarnings'

export default function App() {
  const [loaded, error] = useFonts(fontFamList);
  if (!loaded) {
    return error;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
          {/* <AuthStack/> */}
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
