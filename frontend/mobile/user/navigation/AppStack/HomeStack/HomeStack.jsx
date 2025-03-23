import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../../../screens/Home/Home'
import Welcome from '../../../screens/Welcome'
import Product from '../../../screens/Product/Product'
import CategoryProducts from '../../../screens/CategoryProducts'
import SearchResults from '../../../screens/Product/SearchResults'
import ProductFilter from '../../../screens/Product/ProductFilter'

export default function HomeStack() {
    const Stack = createNativeStackNavigator()
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name='product' component={Product} />
            <Stack.Screen name='CategoryProducts' component={CategoryProducts} />
            <Stack.Screen name='SearchResults' component={SearchResults} />
            <Stack.Screen name='ProductFilter' component={ProductFilter} />
        </Stack.Navigator>
    )
}