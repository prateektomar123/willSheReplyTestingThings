import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFF0F5' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;