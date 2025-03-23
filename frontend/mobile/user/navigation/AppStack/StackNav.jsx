import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomNav from './BottomNav'
import HomeStack from './HomeStack/HomeStack'
import OrderStack from './OrderStack/OrderStack'
import NotificationStack from './NotificationStack/NotificationStack'
import ProfileStack from './ProfileStack/ProfileStack'
import CartScreen from '../../screens/Cart/CartScreen'
import CheckoutScreen from '../../screens/Checkout/CheckoutScreen'

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
        </Stack.Navigator>
    )
}