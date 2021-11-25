import React from "react";
import { StyleSheet, View, Text, Image, Dimensions } from "react-native";
import { useColorModeValue, useColorMode } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { theme, navigatorOptions, TEST } from "./config/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AppIntro from "rn-falcon-app-intro";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BillScanner from "./tabs/BillScanner";
import Profile from "./tabs/Profile";
import Finances from "./tabs/FinanceTracker";
import ShoppingList from "./tabs/ShoppingList";

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import * as Linking from "expo-linking";

function Intro({ navigation }) {
  function finishIntro() {
    if (!TEST.AlwaysShowIntro) AsyncStorage.setItem("introDone", "yes");
    navigation.navigate("Main");
  }

  return (
    <AppIntro
      onDoneBtnClick={finishIntro}
      onSkipBtnClick={finishIntro}
      dotColor={theme.colors.backgroundLight.darker}
      activeDotColor={theme.colors.backgroundLight.dark}
      rightTextColor={theme.colors.backgroundLight.dark}
      leftTextColor={theme.colors.backgroundLight.dark}
      skipBtnLabel="Skip "
      doneBtnLabel="Done "
    >
      <View style={styles.slide}>
        <View style={styles.pageOne} level={5}>
          <Image
            style={styles.poImage}
            source={require("../res/images/tired/bg.png")}
          />
        </View>
        <View style={styles.pageOne} level={10}>
          <Image
            style={styles.poImage}
            source={require("../res/images/tired/1.png")}
          />
        </View>
        <View style={styles.pageOne} level={15}>
          <Image
            style={styles.poImage}
            source={require("../res/images/tired/2.png")}
          />
        </View>
        <View style={styles.pageOne} level={20}>
          <Image
            style={styles.poImage}
            source={require("../res/images/tired/3.png")}
          />
        </View>
        <View style={styles.pageOne} level={5}>
          <Image
            style={styles.poImage}
            source={require("../res/images/tired/4.png")}
          />
        </View>
        <View level={15}>
          <Text style={styles.title}>No more complicated bills!</Text>
        </View>
        <View level={8}>
          <Text style={styles.description}>
            Track all your repeating expenses in one place
          </Text>
        </View>
      </View>
      <View style={styles.slide}>
        <View style={styles.pageOne} level={5}>
          <Image
            style={styles.poImage}
            source={require("../res/images/writing/bg.png")}
          />
        </View>
        <View style={styles.pageOne} level={10}>
          <Image
            style={styles.poImage}
            source={require("../res/images/writing/1.png")}
          />
        </View>
        <View style={styles.pageOne} level={15}>
          <Image
            style={styles.poImage}
            source={require("../res/images/writing/2.png")}
          />
        </View>
        <View style={styles.pageOne} level={20}>
          <Image
            style={styles.poImage}
            source={require("../res/images/writing/3.png")}
          />
        </View>
        <View level={15}>
          <Text style={styles.title}>Write everything down</Text>
        </View>
        <View level={8}>
          <Text style={styles.description}>
            And see whether the due date has passed or not
          </Text>
        </View>
      </View>
      <View style={styles.slide}>
        <View style={styles.pageThree} level={5}>
          <Image
            style={styles.ptImage}
            source={require("../res/images/data/bg.png")}
          />
        </View>
        <View style={styles.pageThree} level={10}>
          <Image
            style={styles.ptImage}
            source={require("../res/images/data/1.png")}
          />
        </View>
        <View style={styles.pageThree} level={15}>
          <Image
            style={styles.ptImage}
            source={require("../res/images/data/2.png")}
          />
        </View>
        <View style={styles.pageThree} level={20}>
          <Image
            style={styles.ptImage}
            source={require("../res/images/data/3.png")}
          />
        </View>
        <View level={15}>
          <Text style={styles.title}>Parse your receipts</Text>
        </View>
        <View level={8}>
          <Text style={styles.description}>
            Parse your store receipts and divide the bought items between
            different people
          </Text>
        </View>
      </View>
      <View style={styles.slide}>
        <View style={styles.pageOne} level={5}>
          <Image
            style={styles.poImage}
            source={require("../res/images/profit/bg.png")}
          />
        </View>
        <View style={styles.pageOne} level={10}>
          <Image
            style={styles.poImage}
            source={require("../res/images/profit/1.png")}
          />
        </View>
        <View style={styles.pageOne} level={15}>
          <Image
            style={styles.poImage}
            source={require("../res/images/profit/2.png")}
          />
        </View>
        <View style={styles.pageOne} level={20}>
          <Image
            style={styles.poImage}
            source={require("../res/images/profit/3.png")}
          />
        </View>
        <View level={15}>
          <Text style={styles.title}>Profit!</Text>
        </View>
        <View level={8}>
          <Text style={styles.description}>
            Be conscious of your spending and consider saving more
          </Text>
        </View>
      </View>
    </AppIntro>
  );
}

const Tab = createBottomTabNavigator();

function Main() {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  return (
    <Tab.Navigator
      initialRouteName="Finances"
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
        name="Finances"
        component={Finances}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="finance" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={BillScanner}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="scan" size={24} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Shopping"
        component={ShoppingList}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name={colorMode === "dark" ? "settings-outline" : "settings"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function appNav({ showIntro }) {
  const Stack = createStackNavigator();

  const linking = {
    prefixes: [Linking.makeUrl("/")],
    config: {
      screens: {
        Main: {
          screens: {
            Finances: {
              screens: {
                AddAccount: "addaccount/",
                BankDetails: "bankdetails/",
              },
            },
          },
        },
      },
    },
  };

  return (
    <>
      <StatusBar style={useColorModeValue("dark", "light")} />
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName={showIntro === "yes" ? "Intro" : "Main"}
          screenOptions={navigatorOptions}
        >
          <Stack.Screen name="Intro" component={Intro} />
          <Stack.Screen name="Main" component={Main} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  pageOne: {
    position: "absolute",
    top: hp(18),
    left: wp(3.5),
    width: wp(100),
    height: hp(100),
  },
  poImage: { width: wp(86), height: wp(43) },
  pageThree: {
    position: "absolute",
    top: hp(16),
    left: wp(-2),
    width: wp(100),
    height: hp(100),
  },
  ptImage: { width: wp(108), height: wp(54) },
  slide: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 150,
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight.main,
    padding: 15,
  },
  title: {
    color: "#404040",
    fontSize: 25 / Dimensions.get("screen").fontScale,
    fontFamily: "Roboto_700Bold",
  },
  description: {
    color: "#3e3e3e",
    fontSize: 15 / Dimensions.get("screen").fontScale,
    width: wp(50),
    textAlign: "center",
    marginTop: hp(2),
    fontFamily: "Roboto_300Light",
  },
});
