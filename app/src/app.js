import React from "react";
import { StyleSheet, Animated } from "react-native";
import { useColorModeValue, Box, Text } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { theme, navigatorOptions } from "./config/constants";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AppIntro from "rn-falcon-app-intro";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BillScanner from "./tabs/BillScanner";
import History from "./tabs/History";
import Profile from "./tabs/Profile";
import Finances from "./tabs/FinanceTracker";

const TESTMODE = true;

function Intro({ navigation }) {
  function finishIntro() {
    if (!TESTMODE) AsyncStorage.setItem("introDone", "yes");
    navigation.navigate("main");
  }
  return (
    <AppIntro onDoneBtnClick={finishIntro} onSkipBtnClick={finishIntro}>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[400] }]}
      >
        <Box level={10} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
        <Box level={15} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
        <Box level={8} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[200] }]}
      >
        <Box level={-10} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
        <Box level={5} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
        <Box level={20} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[700] }]}
      >
        <Box level={8} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
        <Box level={0} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
        <Box level={-10} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[500] }]}
      >
        <Box level={5} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
        <Box level={10} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
        <Box level={15} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
      </Box>
    </AppIntro>
  );
}

const Tab = createBottomTabNavigator();

function Main() {
  const background = useColorModeValue("backgroundLight", "background");

  return (
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
        name="Finances"
        component={Finances}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="finance" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function appNav({ showIntro }) {
  const Stack = createStackNavigator();

  return (
    <>
      <StatusBar style={useColorModeValue("dark", "light")} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={showIntro === "yes" ? "intro" : "main"}
          screenOptions={navigatorOptions}
        >
          <Stack.Screen name="intro" component={Intro} />
          <Stack.Screen name="main" component={Main} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
    padding: 15,
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});
