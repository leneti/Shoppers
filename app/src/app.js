import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BillScanner from "./tabs/BillScanner";
import History from "./tabs/History";
import { theme } from "./config/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Scanner"
        backBehavior="initialRoute"
        screenOptions={{
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.primary[500],
          header: () => {},
          tabBarStyle: {
            backgroundColor: theme.colors.background.main,
            borderTopColor: theme.colors.background.mainl,
          },
        }}
      >
        <Tab.Screen
          name="Scanner"
          component={BillScanner}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="scan" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={History}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="history" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
