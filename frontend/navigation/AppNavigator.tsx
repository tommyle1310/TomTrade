import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import TradingScreen from '../screens/TradingScreen';
import OrdersScreen from '../screens/OrdersScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import BalanceScreen from '../screens/BalanceScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StockPickerScreen from '../screens/StockPickerScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import AuthNavigator from './AuthNavigator';
import FloatingTabBar from './FloatingTabBar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{
          tabBarLabel: 'Portfolio',
        }}
      />
      <Tab.Screen 
        name="Trading" 
        component={TradingScreen}
        options={{
          tabBarLabel: 'Trading',
        }}
      />
      <Tab.Screen 
        name="Watchlist" 
        component={WatchlistScreen}
        options={{
          tabBarLabel: 'Watchlist',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigatorContent() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Balance" component={BalanceScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="StockPicker" component={StockPickerScreen} />
            <Stack.Screen name="StockDetail" component={StockDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigatorContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}