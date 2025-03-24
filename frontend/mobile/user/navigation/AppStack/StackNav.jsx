import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomNav from './BottomNav'
import HomeStack from './HomeStack/HomeStack'
import OrderStack from './OrderStack/OrderStack'
import NotificationStack from './NotificationStack/NotificationStack'
import ProfileStack from './ProfileStack/ProfileStack'
import CartScreen from '../../screens/Cart/CartScreen'
import CheckoutScreen from '../../screens/Order/CheckoutScreen';
import OrderSuccessScreen from '../../screens/Order/OrderSuccessScreen';
import OrderHistoryScreen from '../../screens/Order/OrderHistoryScreen';
import OrderDetailScreen from '../../screens/Order/OrderDetailScreen';
import PaymentSuccessScreen from '../../screens/Payment/PaymentSuccessScreen';
import PaymentErrorScreen from '../../screens/Payment/PaymentErrorScreen';

export default function StackNav() {
    const Stack = createNativeStackNavigator()
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name='homeScreen' component={BottomNav} />
            <Stack.Screen name='homeStack' component={HomeStack} />
            <Stack.Screen name='orderStack' component={OrderStack} />
            <Stack.Screen name='notificationStack' component={NotificationStack} />
            <Stack.Screen name='profileStack' component={ProfileStack} />
            <Stack.Screen name='Cart' component={CartScreen} />
            <Stack.Screen name='Checkout' component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen 
                name="PaymentSuccess" 
                component={PaymentSuccessScreen} 
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen 
                name="PaymentError" 
                component={PaymentErrorScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack.Navigator>
    )
}