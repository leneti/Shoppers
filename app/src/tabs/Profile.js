import React, { useEffect, useState } from "react";
import { theme } from "../config/constants";
import { Switch } from "react-native";
import {
  Box,
  Text,
  useColorMode,
  Icon,
  useColorModeValue,
  Select,
  CheckIcon,
} from "native-base";
import { TextInput } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const { colorMode, setColorMode } = useColorMode();
  const background = useColorModeValue("backgroundLight", "background");
  const [selectedPayday, setSelectedPayday] = useState("1");
  const days = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
  ];

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
      px={2}
      my={4}
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

  /* #region  Payday */
  useEffect(() => {
    (async function getPaydayDate() {
      try {
        const pday = await AsyncStorage.getItem("payday");
        if (!pday) return;
        setSelectedPayday(pday);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPaydayDate(), 1000);
    return () => clearTimeout(timer);
  }, [selectedPayday]);

  async function setPaydayDate() {
    try {
      await AsyncStorage.setItem("payday", selectedPayday);
    } catch (e) {
      console.warn(e);
    }
  }
  /* #endregion */

  return (
    <Box variant="background" flex={1} safeAreaTop alignItems="center">
      <Text fontSize="2xl" fontWeight="bold" py={3}>
        Settings
      </Text>
      <Box w={wp(90)}>
        <DarkModeSetting my={1} />
        <Box
          testID="Split Rate"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          my={4}
          pl={2}
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
                width: wp(19),
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
                width: wp(19),
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
        <Box
          testID="Split Rate"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          my={4}
          px={2}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon
              ml={2}
              name="dollar"
              as={<FontAwesome />}
              color="primary.500"
            />
            <Text fontSize="xl" ml={1}>
              Payday
            </Text>
          </Box>
          <Box w={wp(22)}>
            <Select
              borderColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              selectedValue={selectedPayday}
              minWidth={wp(17)}
              maxWidth={wp(22)}
              accessibilityLabel="Choose payday"
              _selectedItem={{
                bg: "primary.500",
                endIcon: <CheckIcon size="5" />,
                _text: { color: "white" },
              }}
              _item={{
                _text: {
                  color:
                    colorMode === "dark" ? "white" : "backgroundLight.dark",
                },
              }}
              onValueChange={setSelectedPayday}
            >
              {days.map((d) => (
                <Select.Item key={d} label={d} value={d} />
              ))}
            </Select>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
