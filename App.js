import React from "react";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import App from "./app/src/app";

import { theme } from "./app/src/config/theme";
import { firebaseConfig } from "./app/src/config/secret";

import firebase from "firebase/app";

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

export default function Wrapper() {
  return (
    <NativeBaseProvider theme={theme}>
      <StatusBar style="light" />
      <App />
    </NativeBaseProvider>
  );
}
