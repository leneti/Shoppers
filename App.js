import "react-native-gesture-handler";
import React from "react";
import { NativeBaseProvider } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./app/src/app";

import { theme } from "./app/src/config/theme";
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
  return (
    <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
      <App />
    </NativeBaseProvider>
  );
}
