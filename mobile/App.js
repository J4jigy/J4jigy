import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CashInEntryScreen from './src/screens/CashInEntryScreen';
import CashOutEntryScreen from './src/screens/CashOutEntryScreen';
import FuelDispenserScreen from './src/screens/FuelDispenserScreen';
import FuelDispenserDetailsScreen from './src/screens/FuelDispenserDetailsScreen';
import ListViewScreen from './src/screens/ListViewScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CashIn" 
          component={CashInEntryScreen} 
          options={{ title: 'Cash In Entry' }}
        />
        <Stack.Screen 
          name="CashOut" 
          component={CashOutEntryScreen} 
          options={{ title: 'Cash Out Entry' }}
        />
        <Stack.Screen 
          name="FuelDispenser" 
          component={FuelDispenserScreen} 
          options={{
            title: 'Fuel Dispensers',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen 
          name="FuelDispenserDetails" 
          component={FuelDispenserDetailsScreen} 
          options={({ route, navigation }) => ({ 
            title: `Dispenser ${route.params?.dispenserId || ''}`,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen 
          name="ListView" 
          component={ListViewScreen} 
          options={({ route }) => ({ 
            title: route.params?.title || 'List View' 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}