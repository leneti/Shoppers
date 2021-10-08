import "react-native-gesture-handler";
import React, { useRef, useState, useEffect } from "react";
import { NativeBaseProvider } from "native-base";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./app/src/app";
import AppLoading from "expo-app-loading";
import {
  useFonts,
  Roboto_100Thin,
  Roboto_100Thin_Italic,
  Roboto_300Light,
  Roboto_300Light_Italic,
  Roboto_400Regular,
  Roboto_400Regular_Italic,
  Roboto_500Medium,
  Roboto_500Medium_Italic,
  Roboto_700Bold,
  Roboto_700Bold_Italic,
  Roboto_900Black,
  Roboto_900Black_Italic,
} from "@expo-google-fonts/roboto";

import { TEST, theme } from "./app/src/config/constants";
import { firebaseConfig } from "./app/src/config/secret";

import firebase from "firebase/app";

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const colorModeManager = {
  get: async () => {
    try {
      let val = await AsyncStorage.getItem("@color-mode");
      return val === "dark" ? "dark" : "light";
    } catch (e) {
      return "dark";
    }
  },
  set: async (value) => {
    try {
      await AsyncStorage.setItem("@color-mode", value);
    } catch (e) {
      console.warn(e);
    }
  },
};

export default function Wrapper() {
  const [showIntro, setShowIntro] = useState(null);
  const i = useRef(null);
  let [fontsLoaded] = useFonts({
    Roboto_100Thin,
    Roboto_100Thin_Italic,
    Roboto_300Light,
    Roboto_300Light_Italic,
    Roboto_400Regular,
    Roboto_400Regular_Italic,
    Roboto_500Medium,
    Roboto_500Medium_Italic,
    Roboto_700Bold,
    Roboto_700Bold_Italic,
    Roboto_900Black,
    Roboto_900Black_Italic,
  });

  async function getIntro() {
    try {
      i.current = await AsyncStorage.getItem("introDone");
    } catch (e) {
      return e;
    }
  }

  function handleIntro() {
    setShowIntro(!i.current ? "yes" : "no");
    if (TEST.AlwaysShowIntro) AsyncStorage.removeItem("introDone");
  }

  useEffect(() => {
    if (!firebase.auth().currentUser?.uid)
      firebase.auth().signInAnonymously().catch(console.warn);
  }, []);

  return !showIntro || !fontsLoaded ? (
    <AppLoading
      startAsync={getIntro}
      onFinish={handleIntro}
      onError={console.warn}
    />
  ) : (
    <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
      <PaperProvider>
        <App showIntro={showIntro} />
      </PaperProvider>
    </NativeBaseProvider>
  );
}
