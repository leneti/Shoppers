import React from "react";
import { useColorModeValue } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BillScanner from "./tabs/BillScanner";
import History from "./tabs/History";
import Settings from "./tabs/Settings";
import { theme } from "./config/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const Tab = createBottomTabNavigator();

export default function App() {
  const background = useColorModeValue("backgroundLight", "background");
  return (
    <>
      <StatusBar style={useColorModeValue("dark", "light")} />
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
              backgroundColor: theme.colors[background].main,
              borderTopColor: theme.colors[background].mainl,
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
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="settings" size={24} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
