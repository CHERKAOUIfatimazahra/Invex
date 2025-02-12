import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import StartScreen from "./screens/StartScreen";
import LoginScreen from "./screens/LoginScreen";
import MainDashboardScreen from "./screens/MainDashboardScreen";
import ScanScreen from "./screens/ScanScreen";
import ProductsScreen from "./screens/ProductsScreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import PDFScreen from "./screens/PDFScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import AddProductScreen from "./screens/AddProductScreen";

const Stack = createStackNavigator();

const THEME = {
  colors: {
    primary: "#2E8B57",
    black: "#000000",
    white: "#FFFFFF",
    gray: "#DDDDDD",
    red: "#FF0000",
  },
  spacing: {
    small: 10,
    medium: 20,
    large: 40,
  },
  sizes: {
    icon: {
      small: 24,
      large: 30,
    },
    header: {
      height: 70,
    },
  },
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>

        {isLoggedIn && (
          <>
            <Stack.Screen
              name="MainDashboard"
              component={MainDashboardScreen}
            />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Statistics" component={StatisticsScreen} />
            <Stack.Screen name="PDF" component={PDFScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
