import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home/Home';
import CategoryProducts from '../screens/CategoryProducts';
import Product from '../screens/Product/Product';
import SearchResults from '../screens/Product/SearchResults';
import ProductFilter from '../screens/Product/ProductFilter';
import Profile from '../screens/Profile/Profile';

const Stack = createStackNavigator();

const AppNavigator = () => {
    console.log('Khởi tạo AppNavigator'); // Debug log
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
            <Stack.Screen name="ProductDetail" component={Product} />
            <Stack.Screen name="SearchResults" component={SearchResults} />
            <Stack.Screen name="ProductFilter" component={ProductFilter} />
            <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
    );
};

export default AppNavigator; 