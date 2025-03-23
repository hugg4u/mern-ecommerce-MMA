import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { Ionicons } from '@expo/vector-icons'
import Notification from '../../screens/Notification/Notification';
import Orders from '../../screens/Orders/Orders';
import Profile from '../../screens/Profile/Profile';
import HomeStack from './HomeStack/HomeStack';
import Home from '../../screens/Home/Home';
import CartScreen from '../../screens/Cart/CartScreen';
import { useCart } from '../../context/CartContext';

export default function BottomNav() {
    const Tab = createMaterialBottomTabNavigator()
    const { cart, fetchCart } = useCart();
    
    // Thêm debug log
    useEffect(() => {
        console.log("BottomNav - cart info:", 
            cart ? `totalItems: ${cart.totalItems}, items length: ${cart.items?.length || 0}` : "cart undefined");
    }, [cart]);
    
    // Đảm bảo cart có giá trị hợp lệ
    const cartItemCount = cart && cart.totalItems && !isNaN(cart.totalItems) ? cart.totalItems : 0;
    
    return (
        <Tab.Navigator
            activeColor="#017aff"
            inactiveColor="grey"
            activeIndicatorStyle={{ backgroundColor: "#f7f7f7" }}
            barStyle={{ backgroundColor: '#ffffff', height: 70 }}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? "home" : "home-outline"
                    } else if (route.name === "Notification") {
                        iconName = focused ? "notifications" : "notifications-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person-circle" : "person-circle-outline";
                    } else if (route.name === "Orders") {
                        iconName = focused ? "wallet" : "wallet-outline";
                    } else if (route.name === "Cart") {
                        iconName = focused ? "cart" : "cart-outline";
                    }
                    return <Ionicons name={iconName} size={25} color={color} />
                },
                tabBarBadge: route.name === 'Cart' && cartItemCount > 0 ? 
                    (cartItemCount > 99 ? '99+' : cartItemCount.toString()) : undefined
            })}
        >
            <Tab.Screen name='Home' component={Home} />
            <Tab.Screen name='Orders' component={Orders} />
            <Tab.Screen name='Notification' component={Notification} />
            <Tab.Screen name='Profile' component={Profile} />
        </Tab.Navigator>
    )
}