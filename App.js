import "react-native-gesture-handler";
import React, { useRef, useState } from "react";
import { NativeBaseProvider } from "native-base";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./app/src/app";
import AppLoading from "expo-app-loading";

import { theme } from "./app/src/config/constants";
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

const TEST = true;

export default function Wrapper() {
  const [showIntro, setShowIntro] = useState(null);
  const i = useRef(null);

  async function getIntro() {
    try {
      i.current = await AsyncStorage.getItem("introDone");
    } catch (e) {
      return e;
    }
  }

  function handleIntro() {
    setShowIntro(!i.current ? "yes" : "no");
    if (TEST) AsyncStorage.removeItem("introDone");
  }

  return !showIntro ? (
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
