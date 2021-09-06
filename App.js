import React from "react";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider} from "native-base";
import BillScanner from "./app/src/tabs/BillScanner";

import { theme } from "./app/src/config/theme";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./app/src/config/secret";

initializeApp(firebaseConfig);

export default function Wrapper() {
  return (
    <NativeBaseProvider theme={theme}>
      <StatusBar style="light" />
      <BillScanner />
    </NativeBaseProvider>
  );
}
