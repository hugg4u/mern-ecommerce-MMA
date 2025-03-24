import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Profile from '../../../screens/Profile/Profile'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { Colors } from '../../../constants/Colors'

export default function ProfileStack() {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.text,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'Thông tin tài khoản',
        }}
      />
    </Stack.Navigator>
  )
}