import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../../../screens/Home/Home'
import Welcome from '../../../screens/Welcome'
import Product from '../../../screens/Product/Product'
import CategoryProducts from '../../../screens/CategoryProducts'

export default function HomeStack() {
    const Stack = createNativeStackNavigator()
    return (
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name='product' component={Product} />
            <Stack.Screen options={{ headerShown: false }} name='CategoryProducts' component={CategoryProducts} />
        </Stack.Navigator>
    )
}