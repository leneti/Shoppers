import React, { useEffect, useState } from "react";
import { theme } from "../config/theme";
import { Switch } from "react-native";
import { Box, Text, useColorMode, Icon, useColorModeValue } from "native-base";
import { TextInput } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const { colorMode, setColorMode } = useColorMode();
  const background = useColorModeValue("backgroundLight", "background");

  /* #region  Dark Mode */
  const [darkModeOn, setDarkModeOn] = useState(colorMode === "dark");

  useEffect(() => {
    setColorMode(darkModeOn ? "dark" : "light");
  }, [darkModeOn]);

  const DarkModeSetting = (props) => (
    <Box
      {...props}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius={15}
      px={2}
      py={3}
    >
      <Box flexDirection="row" alignItems="center">
        <Icon
          as={<Ionicons size={24} />}
          _dark={{ color: "primary.500", name: "moon-outline" }}
          _light={{ color: "primary.500", name: "moon" }}
        />
        <Text fontSize="xl" ml={3}>
          Dark Mode
        </Text>
      </Box>
      <Switch
        trackColor={{
          false: theme.colors.gray[500],
          true: theme.colors.primary[700],
        }}
        thumbColor={
          darkModeOn ? theme.colors.primary[500] : theme.colors.gray[200]
        }
        ios_backgroundColor="#3e3e3e"
        onValueChange={setDarkModeOn}
        value={darkModeOn}
      />
    </Box>
  );
  /* #endregion */

  /* #region  Split Rate */
  const [domShare, setDomShare] = useState("60");
  const [emShare, setEmShare] = useState("40");
  const inputTheme = {
    colors: {
      placeholder:
        colorMode === "dark"
          ? theme.colors.primary[400]
          : theme.colors.backgroundLight.dark,
      text: colorMode === "dark" ? "white" : theme.colors.backgroundLight.dark,
      primary:
        colorMode === "dark"
          ? theme.colors.primary[500]
          : theme.colors.backgroundLight.dark,
      underlineColor: "transparent",
    },
  };

  function handleDomInput(text) {
    setDomShare(text);
    setEmShare((100 - parseFloat(text)).toFixed(0));
  }

  function handleEmInput(text) {
    setEmShare(text);
    setDomShare((100 - parseFloat(text)).toFixed(0));
  }

  useEffect(() => {
    const timer = setTimeout(() => setSplitRatio(), 1000);
    return () => clearTimeout(timer);
  }, [emShare, domShare]);

  useEffect(() => {
    (async function getSplitRatio() {
      try {
        const domsShare = await AsyncStorage.getItem("splitRatio");
        if (!domsShare) return;
        setDomShare(domsShare);
        setEmShare((100 - parseFloat(domsShare)).toFixed(0));
      } catch (e) {}
    })();
  }, []);

  async function setSplitRatio() {
    try {
      await AsyncStorage.setItem("splitRatio", domShare);
    } catch (e) {
      console.warn(e);
    }
  }
  /* #endregion */

  return (
    <Box
      _light={{ bg: "backgroundLight.main" }}
      _dark={{ bg: "background.main" }}
      flex={1}
      safeAreaTop
      alignItems="center"
    >
      <Text fontSize="2xl" fontWeight="bold" py={3}>
        Settings
      </Text>
      <Box w={wp(90)}>
        <DarkModeSetting my={1} />
        <Box
          testID="Split Rate"
          my={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderRadius={15}
          px={2}
          py={3}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon
              _light={{ name: "percent" }}
              _dark={{ name: "percent-outline" }}
              as={<MaterialCommunityIcons />}
              color="primary.500"
            />
            <Text fontSize="xl" ml={3}>
              Split Rate
            </Text>
          </Box>
          <Box flexDirection="row">
            <TextInput
              label="Dom"
              placeholder="/100%"
              error={parseFloat(emShare) + parseFloat(domShare) !== 100}
              style={{
                height: hp(4),
                width: wp(15),
                marginHorizontal: wp(2),
                backgroundColor: theme.colors[background].main,
              }}
              theme={inputTheme}
              mode="outlined"
              value={domShare}
              outlineColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              onChangeText={handleDomInput}
            />
            <Text fontSize="4xl">/</Text>
            <TextInput
              label="Emilija"
              placeholder="/100%"
              error={parseFloat(emShare) + parseFloat(domShare) !== 100}
              style={{
                height: hp(4),
                width: wp(15),
                marginHorizontal: wp(2),
                backgroundColor: theme.colors[background].main,
              }}
              theme={inputTheme}
              mode="outlined"
              value={emShare}
              outlineColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              onChangeText={handleEmInput}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
