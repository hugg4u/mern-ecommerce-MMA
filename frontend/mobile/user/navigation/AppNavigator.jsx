import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StackNav from './AppStack/StackNav';
import AuthStack from './AuthStack/AuthStack';

const Stack = createStackNavigator();

const AppNavigator = () => {
    console.log('Khởi tạo AppNavigator'); // Debug log
    return (
        <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Main" component={StackNav} />
            <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
    );
};

export default AppNavigator; 