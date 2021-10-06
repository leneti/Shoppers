import React, { useEffect, useState, useRef } from "react";
import {
  theme,
  navigatorOptions,
  currencyFormat,
  MONTHS,
  MONTH_TRUNC,
  FREQUENCIES,
  CATEGORIES,
} from "../config/constants";
import { createStackNavigator } from "@react-navigation/stack";
import {
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  View,
  Dimensions,
  Alert,
} from "react-native";
import {
  Box,
  Text,
  useColorModeValue,
  useColorMode,
  Image,
  FlatList,
  Divider,
  HStack,
  Icon,
  Center,
  Actionsheet,
  useDisclose,
  ScrollView,
  Spinner,
  SectionList,
  Menu,
} from "native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Placeholder,
  PlaceholderLine,
  PlaceholderMedia,
  Shine,
} from "rn-placeholder";
import CircularProgress from "../components/ProgressCircle";
import * as Linking from "expo-linking";
import { getBills, saveBillsToStorage } from "../api/Bills";
import { NORDIGEN_TOKEN } from "../config/secret";
import { useFetch } from "../api/FetchHook";
import {
  createEUA,
  createLINK,
  createREQ,
  deleteREQ,
  getBalance,
  getDetails,
  listAccounts,
  TEST,
} from "../api/Nordigen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import currency from "currency.js";
import { transactions } from "../config/testTransactions";

/* #region  Helpers */
/**
 * Tries to get the bank from local storage
 * @param {string} bankName
 * @returns {Promise<{bankName: string, bankLogoUrl: URL, aspsp_id: string, eua_id: string, req_id: string, accounts: string[]}>}
 */
async function getBankFromStorage(bankName) {
  try {
    const mBank = await AsyncStorage.getItem(bankName);
    return JSON.parse(mBank);
  } catch (e) {
    console.warn(e);
    return null;
  }
}

/**
 * Returns a promise resolving to the array of linked bank accounts if any exist, or null otherwise
 * @returns {Promise<String[]>}
 */
async function getLinkedBanks() {
  return JSON.parse(await AsyncStorage.getItem("linked_banks"));
}

async function tryDeleteREQ(deleteAll = true, req_id = "", name = "") {
  try {
    const banks = JSON.parse(await AsyncStorage.getItem("linked_banks"));
    if (!banks?.length) {
      console.log("No linked banks found");
      return;
    }

    if (deleteAll) {
      for (const bankName of banks) {
        const bank = JSON.parse(await AsyncStorage.getItem(bankName));
        console.log(await deleteREQ(bank.req_id));
        await AsyncStorage.removeItem(bankName);
      }
      return await AsyncStorage.removeItem("linked_banks");
    }

    console.log(await deleteREQ(req_id));
    await AsyncStorage.removeItem(name);
    const bIndex = banks.findIndex((bank) => bank === name);
    if (bIndex >= 0) {
      banks.splice(bIndex, 1);
      if (banks.length > 0) {
        await AsyncStorage.setItem("linked_banks", JSON.stringify(banks));
      } else await AsyncStorage.removeItem("linked_banks");
    }
  } catch (e) {
    console.warn(e);
  }
}
/* #endregion */

function Overview({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [accounts, setAccounts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    if (bills.length === 0)
      (async function () {
        let mBills = await getBills();
        mBills = mBills.filter((b) => !b.paid);
        setBills(mBills);
        setTimeout(() => {
          setLoadingBills(false);
        }, 500);
      })();
  }, []);

  useEffect(() => {
    (async function () {
      try {
        setLoadingAccounts(true);
        const banks = await getLinkedBanks();
        if (!banks) return;
        let accountsToBeSet = [];
        for (const bank of banks) {
          if (accountsToBeSet.findIndex((a) => a.bankName === bank) >= 0)
            continue;
          const bankInfo = await getBankFromStorage(bank);
          const {
            accounts: accs,
            bankName,
            bankLogoUrl: logo,
            req_id,
            eua_id,
          } = bankInfo;

          let bankToAdd = {
            bankName,
            logo,
            req_id,
            eua_id,
          };

          let accsToAdd = [];
          for (const acc of accs) {
            const response = await getBalance(acc);
            const balancesArr = response.balances;

            let balanceLeft;
            for (const balanceObj of balancesArr) {
              if (balanceObj.balanceType !== "interimAvailable") continue;
              const balance = balanceObj.balanceAmount;
              const currencyFormat = new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: balance.currency,
                minimumFractionDigits: 2,
              });
              balanceLeft = currencyFormat.format(balance.amount);
            }

            const info = {
              account: acc,
              balance: balanceLeft,
            };

            accsToAdd.push(info);
          }

          accsToAdd.sort((a, b) => currency(b.balance) - currency(a.balance));

          bankToAdd["accounts"] = accsToAdd;
          accountsToBeSet.push(bankToAdd);
        }
        setAccounts(accountsToBeSet);
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, [route]);

  const renderAccount = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("BankDetails", { item })}
      >
        <Box flexDirection="row" alignItems="center" h={wp(15)} pr={3}>
          <Image
            source={{ uri: item.logo }}
            w={wp(12)}
            h={wp(12)}
            rounded="full"
            alt={`${item.bankName} logo`}
          />
          <Box pl={4}>
            <Text fontWeight="bold">{item.accounts[0].balance}</Text>
            <Text fontSize="sm" color="gray.400">
              {item.bankName}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderLoadingAccount = () => (
    <Box w={wp(30)} mx={2}>
      <Placeholder
        Animation={(props) => (
          <Shine
            {...props}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.gray[300]
                  : theme.colors.gray[50],
            }}
          />
        )}
        Left={(props) => (
          <PlaceholderMedia
            {...props}
            isRound={true}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.gray[400]
                  : theme.colors.gray[200],
              width: wp(12),
              height: wp(12),
              borderRadius: wp(6),
            }}
          />
        )}
      >
        <View
          style={{ marginStart: 10, height: wp(12), justifyContent: "center" }}
        >
          <PlaceholderLine
            width={wp(Math.random() * 10 + 15)}
            height={hp(1)}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? "#777"
                  : theme.colors.backgroundLight.darker,
              borderRadius: hp(0.5),
            }}
          />
          <PlaceholderLine
            width={wp(Math.random() * 5 + 10)}
            height={hp(1)}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.background.lighter
                  : theme.colors.backgroundLight.darker,
              borderRadius: hp(0.5),
            }}
          />
        </View>
      </Placeholder>
    </Box>
  );

  const renderUpcoming = ({ item }) => (
    <Box alignItems="center" px={3} w={wp(22)}>
      <Box
        borderRadius="full"
        borderColor="primary.500"
        borderWidth={3}
        p={0.5}
      >
        <Box
          p={4}
          borderRadius="full"
          borderColor="gray.400"
          borderWidth={1}
          bg={
            colorMode === "dark"
              ? "background.lighter"
              : "backgroundLight.darker"
          }
          style={{ width: 60, height: 60 }}
          alignItems="center"
          justifyContent="center"
        >
          <Image
            source={CATEGORIES.find((c) => c.name === item.category).image}
            alt={item.category}
            style={{ width: 30, height: 30 }}
          />
        </Box>
      </Box>
      <Text mt={2} fontWeight={300} isTruncated>
        {item.name}
      </Text>
      <Text fontWeight="bold" color="primary.500">
        {currencyFormat.format(item.price)}
      </Text>
      <Text>
        {parseInt(item.dueDate.split(" ")[0])}{" "}
        {MONTH_TRUNC[item.dueDate.split(" ")[1]]}
      </Text>
    </Box>
  );

  const renderLoadingUpcoming = () => (
    <Box w={wp(22)} mx={-1}>
      <Placeholder
        Animation={(props) => (
          <Shine
            {...props}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.gray[300]
                  : theme.colors.gray[50],
            }}
          />
        )}
        style={{ alignItems: "center" }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
          }}
        >
          <PlaceholderMedia
            isRound={true}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.gray[400]
                  : theme.colors.gray[200],
              width: wp(12),
              height: wp(12),
              borderRadius: wp(6),
            }}
          />
        </View>
        <PlaceholderLine
          width={wp(Math.random() * 10 + 7)}
          height={hp(1)}
          style={{
            backgroundColor:
              colorMode === "dark"
                ? "#777"
                : theme.colors.backgroundLight.darker,
            borderRadius: hp(0.5),
            alignSelf: "center",
            marginTop: 10,
          }}
        />
        <PlaceholderLine
          width={wp(Math.random() * 5 + 5)}
          height={hp(1)}
          style={{
            backgroundColor:
              colorMode === "dark"
                ? theme.colors.background.lighter
                : theme.colors.backgroundLight.darker,
            borderRadius: hp(0.5),
            alignSelf: "center",
          }}
        />
        <PlaceholderLine
          width={wp(Math.random() * 10 + 5)}
          height={hp(1)}
          style={{
            backgroundColor:
              colorMode === "dark"
                ? "#666"
                : theme.colors.backgroundLight.darker,
            borderRadius: hp(0.5),
            alignSelf: "center",
          }}
        />
      </Placeholder>
    </Box>
  );

  return (
    <Box safeAreaTop variant="background" flex={1} alignItems="center">
      <Text fontSize="2xl" fontWeight="bold" pt={3}>
        Overview
      </Text>
      <Box mt={5} alignItems="center">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          w={wp(90)}
          pb={3}
        >
          <Text fontSize="lg" fontWeight="bold">
            Linked accounts
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LinkedAccounts", { accounts })}
          >
            <Text color="primary.500" fontWeight="bold" fontSize="lg">
              Manage
            </Text>
          </TouchableOpacity>
        </Box>
        {loadingAccounts ? (
          <Box h={wp(15)} mx={3} alignSelf="flex-start">
            <FlatList
              data={[1, 2, 3]}
              alignSelf="flex-start"
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderLoadingAccount}
            />
          </Box>
        ) : accounts.length === 0 ? (
          <Box mt={5}>
            <AwesomeButton
              onPress={() => navigation.navigate("AddAccount")}
              width={wp(50)}
              height={50}
              borderRadius={25}
              borderWidth={1}
              borderColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              backgroundColor={theme.colors[background].main}
              backgroundDarker={theme.colors[background].darker}
              raiseLevel={3}
            >
              <Icon
                mr={2}
                as={<Ionicons />}
                name="add"
                size="md"
                color="primary.500"
              />
              <Text _dark={{ color: "primary.400" }}>Add another account</Text>
            </AwesomeButton>
          </Box>
        ) : (
          <Box h={wp(15)} mx={3} alignSelf="flex-start">
            <FlatList
              data={accounts}
              alignSelf="flex-start"
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderAccount}
            />
          </Box>
        )}
      </Box>
      <Divider my={5} w={wp(90)} />
      <Box mt={5} alignItems="center">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          w={wp(90)}
          pb={5}
        >
          <Text fontSize="lg" fontWeight="bold">
            Upcoming regulars
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("FinanceTracker")}
          >
            <Text color="primary.500" fontWeight="bold" fontSize="lg">
              Details
            </Text>
          </TouchableOpacity>
        </Box>
        {loadingBills ? (
          <Box h={wp(35)} alignSelf="flex-start">
            <FlatList
              data={[1, 2, 3, 4, 5]}
              alignSelf="flex-start"
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderLoadingUpcoming}
            />
          </Box>
        ) : bills.length === 0 ? (
          <Box mt={3}>
            <AwesomeButton
              onPress={() => navigation.navigate("FinanceTracker")}
              width={wp(50)}
              height={50}
              borderRadius={25}
              borderWidth={1}
              borderColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              backgroundColor={theme.colors[background].main}
              backgroundDarker={theme.colors[background].darker}
              raiseLevel={3}
            >
              <Text _dark={{ color: "primary.400" }}>Manage Bills</Text>
            </AwesomeButton>
          </Box>
        ) : (
          <Box h={wp(35)} alignSelf="flex-start">
            <FlatList
              data={bills}
              alignSelf="flex-start"
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderUpcoming}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function AddAccount({ navigation, route }) {
  const { colorMode } = useColorMode();

  const [loadingLink, setLoadingLink] = useState(false);

  const eua = useRef(null);
  const req = useRef(null);

  const { status, data, error } = useFetch({
    url: "https://ob.nordigen.com/api/aspsps/?country=gb",
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${NORDIGEN_TOKEN}`,
    },
  });

  useEffect(() => {
    Linking.addEventListener("url", handleRedirect);
    return () => Linking.removeEventListener("url", handleRedirect);
  }, []);

  /**
   * Handles all logic behind adding the bank account
   * @param {{bic: string, countries: string[], id: string, logo: string, name: string, transaction_total_days: string}[]} bank Bank
   */
  async function handleBankSelect(bank) {
    try {
      const mBank = await getBankFromStorage(bank.name);
      if (!!mBank) {
        console.log(mBank);
        return;
      }

      eua.current = await createEUA(bank.transaction_total_days, bank.id);
      if (eua.current.status_code) {
        console.warn(eua.current);
        return;
      }

      const redirect = Linking.makeUrl("addaccount", {
        name: bank.name,
        logo: bank.logo,
        id: bank.id,
      });

      req.current = await createREQ(eua.current.id, redirect);
      if (req.current.status_code) {
        console.warn(req.current);
        return;
      }

      const { initiate: link } = await createLINK(req.current.id, bank.id);
      Linking.openURL(link);
    } catch (e) {
      console.warn(e);
    }
  }

  async function handleRedirect(event) {
    let data = Linking.parse(event.url);

    const qIndex = data.queryParams?.id.indexOf("?");
    if (qIndex >= 0)
      data.queryParams.id = data.queryParams.id.substr(0, qIndex);

    const { accounts } = await listAccounts(req.current.id);

    const {
      account: { ownerName },
    } = await getDetails(accounts[0]);

    await saveBank(
      data.queryParams.name,
      data.queryParams.logo,
      data.queryParams.id,
      accounts,
      ownerName
    );

    navigation.navigate("Overview", { newAccountLinked: true });
  }

  async function saveBank(
    bankName,
    bankLogoUrl,
    aspsp_id,
    accounts,
    ownerName
  ) {
    try {
      const banks = await getLinkedBanks();

      if (banks.includes(bankName)) return;

      await AsyncStorage.setItem(
        "linked_banks",
        JSON.stringify(!banks ? [bankName] : [...banks, bankName])
      );

      const bankToSave = {
        bankName,
        bankLogoUrl,
        aspsp_id,
        eua_id: eua.current.id,
        req_id: req.current.id,
        accounts,
        ownerName,
      };

      await AsyncStorage.setItem(bankName, JSON.stringify(bankToSave));
      console.log("Bank saved to storage:", bankToSave);
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Renders downloaded banks
   * @param {{item: {bic: String, countries: String[], id: String, logo: String, name: String, transaction_total_days: String}}}
   */
  const renderBank = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleBankSelect(item)}>
        <Box flexDirection="row" alignItems="center" w={wp(90)}>
          <Image
            alt={item.name}
            source={{ uri: item.logo }}
            w={wp(14)}
            h={wp(14)}
            borderRadius={15}
            m={2}
          />
          <Text fontSize="lg" fontWeight="bold" ml={3}>
            {item.name}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  };

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(route.params?.prevScreen ?? "Overview")
          }
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Add a new account
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (TEST) tryDeleteREQ();
          }}
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            color={
              TEST
                ? "danger.500"
                : colorMode === "dark"
                ? "background.main"
                : "backgroundLight.main"
            }
          />
        </TouchableOpacity>
      </HStack>
    );
  }

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} pt={5} alignItems="center">
        {status === "idle" || status === "fetching" ? (
          <Box flexDirection="row" alignItems="center">
            <Spinner size="lg" accessibilityLabel="Loading banks" />
            <Text fontSize="lg" fontWeight="bold" color="primary.500" ml={2}>
              Loading
            </Text>
          </Box>
        ) : status === "error" ? (
          <Text color="error.400">
            Could not load the bank list. Try again later
          </Text>
        ) : (
          <FlatList
            data={data}
            ItemSeparatorComponent={() => <Divider my={3} />}
            keyExtractor={(item, index) => `${item}-${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={renderBank}
          />
        )}
      </Box>
    </>
  );
}

function LinkedAccounts({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Overview")}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Linked Accounts
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const renderBank = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("BankDetails", {
            item,
            prevScreen: "LinkedAccounts",
          })
        }
      >
        <Box
          flexDirection="row"
          w={wp(90)}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box flexDirection="row" alignItems="center">
            <Image
              rounded="full"
              source={{ uri: item.logo }}
              w={wp(12)}
              h={wp(12)}
              alt={item.bankName}
            />
            <Text fontSize="lg" fontWeight="bold" ml={4}>
              {item.bankName}
            </Text>
          </Box>
          <Box justifyContent="flex-end">
            <Text fontWeight="bold" my={0.5}>
              {item.accounts[0].balance}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} py={5} alignItems="center">
        <Box w={wp(90)}>
          {route.params?.accounts?.length > 0 && (
            <FlatList
              mb={100}
              ItemSeparatorComponent={() => <Divider my={3} />}
              data={route.params.accounts}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={renderBank}
            />
          )}
        </Box>
      </Box>
      <Box pos="absolute" mb={5} bottom={0} alignSelf="center">
        <AwesomeButton
          onPress={() =>
            navigation.navigate("AddAccount", {
              prevScreen: "LinkedAccounts",
            })
          }
          width={wp(70)}
          height={50}
          borderRadius={25}
          borderWidth={1}
          borderColor={
            colorMode === "dark"
              ? theme.colors.primary[500]
              : theme.colors.backgroundLight.dark
          }
          backgroundColor={theme.colors[background].main}
          backgroundDarker={theme.colors[background].darker}
          raiseLevel={3}
        >
          <Text _dark={{ color: "primary.400" }}>Add an account</Text>
        </AwesomeButton>
      </Box>
    </>
  );
}

function BankDetails({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const item = route.params.item;

  const TEST = false;

  const [sectionedData, setSectionedData] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);

  const updatedLast = useRef("Just updated");

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        py={3}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(route.params?.prevScreen ?? "Overview")
          }
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          {item.bankName}
        </Text>
        <Menu
          w={wp(25)}
          trigger={(triggerProps) => {
            return (
              <TouchableOpacity {...triggerProps}>
                <Icon
                  size="md"
                  as={<MaterialCommunityIcons name="dots-vertical" />}
                  _light={{ color: "primary.600" }}
                  _dark={{ color: "backgroundLight.main" }}
                />
              </TouchableOpacity>
            );
          }}
        >
          <Menu.Item
            onPress={unlinkBank}
            rounded="full"
            _text={{ color: "danger.500" }}
          >
            Unlink
          </Menu.Item>
        </Menu>
      </HStack>
    );
  }

  const { status, data, error } = useFetch({
    url: `https://ob.nordigen.com/api/accounts/${item.accounts[0].account}/transactions`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${NORDIGEN_TOKEN}`,
    },
    shouldFetch,
  });

  function updatedAgo(secondsAgo) {
    updatedLast.current =
      secondsAgo < 60
        ? `Updated ${secondsAgo.toFixed(0)} ${
            secondsAgo < 2 && secondsAgo > 1 ? "second" : "seconds"
          } ago`
        : `Updated ${(secondsAgo / 60).toFixed(0)} ${
            secondsAgo / 60 < 2 && secondsAgo / 60 > 1 ? "minute" : "minutes"
          } ago`;
  }

  useEffect(() => {
    if (TEST) {
      if (loadingTransactions) {
        setLoadingTransactions(false);
        setSectionedData(prepareData(transactions));
      }
      return;
    }

    if (status === "idle") {
      (async function () {
        const cachedTransactions = JSON.parse(
          await AsyncStorage.getItem("cached_transactions")
        );

        const hourPassed_SinceLastFetch =
          cachedTransactions?.created + 3.6e6 < new Date().getTime();

        if (cachedTransactions) {
          updatedAgo(
            (new Date().getTime() - cachedTransactions.created) / 1000
          );
        }

        if (!cachedTransactions || hourPassed_SinceLastFetch) {
          setShouldFetch(true);
        } else {
          setSectionedData(prepareData(cachedTransactions));
          setLoadingTransactions(false);
        }
      })();
    } else if (status === "fetched") {
      const uData = prepareData(data);
      const dataToStore = { ...data, created: new Date().getTime() };
      AsyncStorage.setItem("cached_transactions", JSON.stringify(dataToStore));
      setSectionedData(uData);
      setLoadingTransactions(false);
      updatedLast.current = "Just updated";
    }
  }, [status]);

  /**
   * Prepares data for the sectioned list - divides transactions into arrays by months
   * @param {{transactions: {booked: {currencyExchange?: {exchangeRate: string, instructedAmount: {amount: string, currency: string}, sourceCurrency: string, targetCurrency: string, unitCurrency: string}, transactionId: string, bookingDate: string, transactionAmount: {amount: string, currency: string}, debtorName: string, debtorAccount: {bban: string}, remittanceInformationUnstructuredArray: string[], proprietaryBankTransactionCode: string, valueDate: string}[], pending: {currencyExchange?: {exchangeRate: string, instructedAmount: {amount: string, currency: string}, sourceCurrency: string, targetCurrency: string, unitCurrency: string}, transactionId: string, bookingDate: string, transactionAmount: {amount: string, currency: string}, debtorName: string, debtorAccount: {bban: string}, remittanceInformationUnstructuredArray: string[], proprietaryBankTransactionCode: string}[]}}} data
   */
  function prepareData(data) {
    let uData = [];
    for (const transaction of data.transactions.booked) {
      const cDate = new Date(transaction.bookingDate);
      const cTitle = `${MONTHS[
        cDate.getMonth()
      ].toUpperCase()} ${cDate.getFullYear()}`;
      const cData = {
        date: cDate,
        type: transaction.proprietaryBankTransactionCode,
        info: transaction.remittanceInformationUnstructuredArray,
        amount: transaction.transactionAmount,
        currencyExchange: transaction.currencyExchange,
        pending: false,
      };

      if (uData.length > 0) {
        const lsIndex = uData.findIndex((section) => section.title === cTitle);
        if (lsIndex >= 0) {
          const existingSection = uData[lsIndex];
          existingSection.data.push(cData);
          continue;
        }
      }

      uData.push({
        title: cTitle,
        data: [cData],
      });
    }

    for (const transaction of data.transactions.pending) {
      const cDate = new Date(transaction.bookingDate);
      const cTitle = `${MONTHS[
        cDate.getMonth()
      ].toUpperCase()} ${cDate.getFullYear()}`;
      const cData = {
        date: cDate,
        type: transaction.proprietaryBankTransactionCode,
        info: transaction.remittanceInformationUnstructuredArray,
        amount: transaction.transactionAmount,
        currencyExchange: transaction.currencyExchange,
        pending: true,
      };

      if (uData.length > 0) {
        const lsIndex = uData.findIndex((section) => section.title === cTitle);
        if (lsIndex >= 0) {
          const existingSection = uData[lsIndex];
          existingSection.data.push(cData);
          continue;
        }
      }

      uData.push({
        title: cTitle,
        data: [cData],
      });
    }

    uData.forEach((s) =>
      s.data.sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    return uData;
  }

  async function unlinkBank() {
    try {
      Alert.alert(
        "Unlink Bank",
        "Are you sure you wish to unlink your bank accounts?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              await tryDeleteREQ(false, item.req_id, item.bankName);
              navigation.navigate("Overview", { refresh: true });
            },
          },
        ],
        { cancelable: true }
      );
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @param {{item: { pending: boolean, date: Date, type: string, info: string[], amount: {amount: string, currency: string}, currencyExchange: {exchangeRate: string, instructedAmount: {amount: string, currency: string}, sourceCurrency: string, targetCurrency: string} }}}
   * @returns {JSX.Element}
   */
  const renderTransaction = ({ item }) => {
    const currencyFormat = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: item.amount.currency,
      minimumFractionDigits: 2,
    });
    let amount = currencyFormat.format(item.amount.amount);
    let amountColor = colorMode === "dark" ? "white" : "backgroundLight.dark";
    if (amount.includes("-")) {
      amount = amount.replace("-", "");
    } else {
      amount = `+${amount}`;
      amountColor = colorMode === "dark" ? "success.300" : "success.600";
    }

    return (
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flexDirection="row" alignItems="center">
          <Box w={wp(10)} h={wp(10)} bg="#999" rounded="full" />
          <Box ml={3}>
            <Text fontWeight="bold">{item.info[0]}</Text>
            {item.info.length > 1 && (
              <Text fontSize="sm" fontWeight={colorMode === "dark" ? 100 : 300}>
                {item.info.slice(1).join(" ")}
              </Text>
            )}
          </Box>
        </Box>
        <Box flexDirection="row">
          {item.pending && (
            <Text
              mr={3}
              fontSize="sm"
              fontWeight={colorMode === "dark" ? 100 : 300}
            >
              Pending
            </Text>
          )}
          <Text color={amountColor} fontWeight="bold">
            {amount}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderMonth = ({ section: { title } }) => (
    <Box variant="background">
      <Text
        fontWeight={400}
        color={colorMode === "dark" ? "gray.200" : "gray.400"}
        alignSelf="flex-start"
        my={6}
      >
        {title}
      </Text>
    </Box>
  );

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} alignItems="center" px={wp(5)}>
        {loadingTransactions ? (
          <Box pt={7} alignItems="center">
            <Image
              rounded="full"
              source={{ uri: item.logo }}
              w={wp(12)}
              h={wp(12)}
              alt={item.bankName}
            />
            <Text mt={3} fontWeight="bold" fontSize="4xl">
              {item.accounts[0]?.balance}
            </Text>
            {item.accounts &&
              item.accounts.slice(1).map((acc, index) => (
                <Text
                  key={`${acc}-${index}`}
                  my={0.5}
                  fontWeight={100}
                  fontSize="xl"
                >
                  {acc.balance}
                </Text>
              ))}

            <Box mt={5} borderRadius={15} bg="white" w={wp(90)} h={hp(30)}>
              <Box alignItems="center" flexDirection="row" px={2} py={3}>
                <Image
                  source={{ uri: item.logo }}
                  borderTopLeftRadius={15}
                  w={wp(12)}
                  h={wp(12)}
                  alt={item.bankName}
                />
                <Box pl={2}>
                  <Text fontWeight={300} color="background.main">
                    Account owner
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="background.main">
                    {item.ownerName ?? "Dominykas Gudauskas"}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box
              flexDirection="row"
              alignSelf="flex-start"
              alignItems="center"
              mt={6}
            >
              <Text fontWeight="bold" fontSize="2xl">
                Latest transactions
              </Text>
              <Spinner ml={2} size="sm" accessibilityLabel="Loading banks" />
            </Box>
          </Box>
        ) : (
          <SectionList
            w={wp(90)}
            sections={sectionedData}
            ItemSeparatorComponent={() => (
              <Divider my={2} alignSelf="flex-end" w={wp(80)} />
            )}
            ListHeaderComponent={() => (
              <Box pt={7} alignItems="center">
                <Image
                  rounded="full"
                  source={{ uri: item.logo }}
                  w={wp(12)}
                  h={wp(12)}
                  alt={item.bankName}
                />
                <Text mt={3} fontWeight="bold" fontSize="4xl">
                  {item.accounts[0]?.balance}
                </Text>
                {item.accounts &&
                  item.accounts.slice(1).map((acc, index) => (
                    <Text
                      key={`${acc}-${index}`}
                      my={0.5}
                      fontWeight={100}
                      fontSize="xl"
                    >
                      {acc.balance}
                    </Text>
                  ))}

                <Box mt={5} borderRadius={15} bg="white" w={wp(90)} h={hp(30)}>
                  <Box alignItems="center" flexDirection="row" px={2} py={3}>
                    <Image
                      source={{ uri: item.logo }}
                      borderTopLeftRadius={15}
                      w={wp(12)}
                      h={wp(12)}
                      alt={item.bankName}
                    />
                    <Box pl={2}>
                      <Text fontWeight={300} color="background.main">
                        Account owner
                      </Text>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        color="background.main"
                      >
                        {item.ownerName ?? "Dominykas Gudauskas"}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box
                  flexDirection="row"
                  alignSelf="flex-start"
                  alignItems="center"
                  mt={6}
                >
                  <Text fontWeight="bold" fontSize="2xl">
                    Latest transactions
                  </Text>
                  <Text fontStyle="sm" color="gray.400" fontWeight={100} ml={2}>
                    {updatedLast.current}
                  </Text>
                </Box>
              </Box>
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item + index}
            stickySectionHeadersEnabled={true}
            renderItem={renderTransaction}
            renderSectionHeader={renderMonth}
          />
        )}
      </Box>
    </>
  );
}

function FinanceTracker({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [total, setTotal] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [paid, setPaid] = useState(0);
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  function calcTotals(bills) {
    const { t, u, p } = bills.reduce(
      (a, c) => ({
        t: a.t + parseFloat(c.price),
        u: !c.paid ? a.u + parseFloat(c.price) : a.u,
        p: c.paid ? a.p + parseFloat(c.price) : a.p,
      }),
      { t: 0, u: 0, p: 0 }
    );
    setTotal(t);
    setUpcoming(u);
    setPaid(p);
  }

  useEffect(() => {
    if (bills.length === 0)
      (async function () {
        let mBills = await getBills();
        setBills(mBills);
        calcTotals(mBills);
        setTimeout(() => {
          setLoadingBills(false);
        }, 500);
      })();
  }, []);

  useEffect(() => {
    if (route.params?.regular) {
      const bill = route.params.regular;
      const newBillArr = [...bills];
      const mIndex = bills.findIndex((b) => b.id === bill.id);
      if (mIndex >= 0) newBillArr.splice(mIndex, 1);
      if (!bill.delete) {
        bill.paid = new Date().getDate() > parseInt(bill.dueDate.substr(0, 2));
        // console.log(bill);
        newBillArr.push(bill);
      }
      saveBillsToStorage(newBillArr);
      setBills(newBillArr);
      calcTotals(newBillArr);
    }
  }, [route]);

  const renderBill = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("AddRegular", { toEdit: item })}
      >
        <Box
          w={wp(36)}
          h={hp(25)}
          my={4}
          bg={theme.colors[background].mainl}
          mx={2}
          borderRadius={15}
          shadow={2}
          py={3}
          px={4}
        >
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg={theme.colors[background].mainl}
            borderTopRadius={15}
          >
            <Image
              source={CATEGORIES.find((c) => c.name === item.category).image}
              alt={item.category}
              size={wp(7)}
            />
            <Box
              borderRadius={15}
              w={item.paid ? wp(10) : wp(15)}
              h={6}
              bg={
                item.paid
                  ? colorMode === "dark"
                    ? "emerald.600"
                    : "success.200"
                  : colorMode === "dark"
                  ? "gray.400"
                  : "gray.200"
              }
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontSize="sm"
                color={
                  item.paid
                    ? colorMode === "dark"
                      ? "emerald.900"
                      : "success.600"
                    : colorMode === "dark"
                    ? "gray.700"
                    : "gray.500"
                }
              >
                {item.paid ? "Paid" : "Upcoming"}
              </Text>
            </Box>
          </HStack>
          <Box pt={5} pb={3}>
            <Text fontSize="lg" numberOfLines={2}>
              {item.name}
            </Text>
            <Text
              _light={{ color: "gray.600" }}
              fontWeight="bold"
              fontSize="2xl"
              py={2}
            >
              £{item.price}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.200" : "gray.500"}
            >
              {item.dueDate.substr(0, 2) === "1 "
                ? "1st"
                : item.dueDate.substr(0, 2) === "2 "
                ? "2nd"
                : item.dueDate.substr(0, 2) === "3 "
                ? "3rd"
                : `${parseInt(item.dueDate.substr(0, 2))}th`}
              , {item.frequency}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderLoadingBill = () => {
    return (
      <Box
        w={wp(36)}
        h={hp(25)}
        my={4}
        bg={theme.colors[background].mainl}
        mx={2}
        borderRadius={15}
        shadow={2}
        py={3}
        px={4}
      >
        <Placeholder
          Animation={(props) => (
            <Shine
              {...props}
              style={{
                backgroundColor:
                  colorMode === "dark"
                    ? theme.colors.gray[300]
                    : theme.colors.gray[50],
              }}
            />
          )}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <PlaceholderMedia
              isRound={true}
              style={{
                backgroundColor:
                  colorMode === "dark"
                    ? theme.colors.gray[400]
                    : theme.colors.gray[200],
                marginBottom: 15,
              }}
            />
            <PlaceholderLine
              width={Math.random() > 0.5 ? wp(7) : wp(10)}
              height={hp(2)}
              style={{
                backgroundColor:
                  colorMode === "dark"
                    ? theme.colors.gray[400]
                    : theme.colors.gray[200],
                borderRadius: 999,
              }}
            />
          </View>
          <PlaceholderLine
            width={wp(Math.random() * 10 + 6)}
            height={hp(2)}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? "#777"
                  : theme.colors.backgroundLight.darker,
              borderRadius: 999,
            }}
          />
          <PlaceholderLine
            width={wp(Math.random() * 5 + 4)}
            height={hp(2)}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? theme.colors.background.lighter
                  : theme.colors.backgroundLight.darker,
              borderRadius: 999,
            }}
          />
          <PlaceholderLine
            width={wp(Math.random() * 10 + 10)}
            height={hp(1)}
            style={{
              backgroundColor:
                colorMode === "dark"
                  ? "#666"
                  : theme.colors.backgroundLight.darker,
              borderRadius: 999,
            }}
          />
        </Placeholder>
      </Box>
    );
  };

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Overview")}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Finance Tracker
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  return (
    <>
      <AppBar />
      <Box variant="background" pt={5} flex={1} alignItems="center">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-evenly"
          w={wp(100)}
        >
          <CircularProgress
            value={paid}
            maxValue={total}
            radius={wp(22)}
            strokeWidth={12}
            delay={500}
            duration={1000}
            valuePrefix="£"
            description="Total between paydays"
            textStyle={{
              fontWeight: "bold",
              fontSize: hp(3),
              color:
                colorMode === "dark"
                  ? "white"
                  : theme.colors.backgroundLight.dark,
              marginTop: hp(-3),
            }}
            descriptionStyle={{
              fontSize: hp(1.7),
              color:
                colorMode === "dark"
                  ? "white"
                  : theme.colors.backgroundLight.dark,
              fontWeight: "500",
              marginTop: hp(12),
            }}
            textFormatFn={(v) => (v + upcoming).toFixed(2)}
            activeStrokeColor={theme.colors.primary[500]}
            inActiveStrokeColor={
              theme.colors[background][
                colorMode === "dark" ? "lighter" : "darker"
              ]
            }
          />
          <Box>
            <Box flexDirection="row" alignItems="center">
              <Box
                w={wp(2)}
                h={wp(2)}
                mr={4}
                borderRadius={wp(1)}
                bg={
                  theme.colors[background][
                    colorMode === "dark" ? "lighter" : "darker"
                  ]
                }
              />
              <Box w={wp(16)}>
                {loadingBills ? (
                  <Placeholder
                    Animation={(props) => (
                      <Shine
                        {...props}
                        style={{
                          backgroundColor:
                            colorMode === "dark"
                              ? theme.colors.gray[300]
                              : theme.colors.gray[50],
                        }}
                      />
                    )}
                  >
                    <PlaceholderLine
                      height={hp(1.3)}
                      style={{
                        backgroundColor:
                          colorMode === "dark"
                            ? "#777"
                            : theme.colors.backgroundLight.darker,
                        borderRadius: 999,
                      }}
                    />
                  </Placeholder>
                ) : (
                  <Text fontSize="xl" fontWeight="bold">
                    £{(upcoming ?? 0).toFixed(2)}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.400">
                  Upcoming
                </Text>
              </Box>
            </Box>
            <Box flexDirection="row" alignItems="center" mt={5}>
              <Box
                w={wp(2)}
                h={wp(2)}
                mr={4}
                borderRadius={wp(1)}
                bg={theme.colors.primary[500]}
              />
              <Box w={wp(16)}>
                {loadingBills ? (
                  <Placeholder
                    Animation={(props) => (
                      <Shine
                        {...props}
                        style={{
                          backgroundColor:
                            colorMode === "dark"
                              ? theme.colors.gray[300]
                              : theme.colors.gray[50],
                        }}
                      />
                    )}
                  >
                    <PlaceholderLine
                      height={hp(1.3)}
                      style={{
                        backgroundColor:
                          colorMode === "dark"
                            ? "#777"
                            : theme.colors.backgroundLight.darker,
                        borderRadius: 999,
                      }}
                    />
                  </Placeholder>
                ) : (
                  <Text fontSize="xl" fontWeight="bold">
                    £{paid.toFixed(2)}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.400">
                  Paid
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider my={5} w={wp(90)} />

        <ScrollView
          contentContainerStyle={{ alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(90)}
          >
            <Text fontSize="lg" fontWeight="bold">
              {"Bills & Subscriptions"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!loadingBills)
                  navigation.navigate("AllRegulars", { bills });
              }}
            >
              <Text color="primary.500" fontWeight="bold" fontSize="lg">
                See all
              </Text>
            </TouchableOpacity>
          </Box>
          {loadingBills && (
            <FlatList
              data={[1, 2, 3]}
              alignSelf="flex-start"
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderLoadingBill}
            />
          )}
          {!loadingBills && bills.length > 0 && (
            <FlatList
              data={bills}
              alignSelf="flex-start"
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderBill}
            />
          )}
          <Box mt={5}>
            <AwesomeButton
              onPress={() => {
                if (!loadingBills) navigation.navigate("AddRegular");
              }}
              width={wp(50)}
              height={50}
              borderRadius={25}
              borderWidth={1}
              borderColor={
                colorMode === "dark"
                  ? theme.colors.primary[500]
                  : theme.colors.backgroundLight.dark
              }
              backgroundColor={theme.colors[background].main}
              backgroundDarker={theme.colors[background].darker}
              raiseLevel={3}
            >
              <Text _dark={{ color: "primary.400" }}>Add regulars</Text>
              <Icon
                ml={2}
                as={<MaterialIcons />}
                name="post-add"
                size="md"
                color="primary.500"
              />
            </AwesomeButton>
          </Box>
        </ScrollView>
      </Box>
    </>
  );
}

function AddRegular({ navigation, route }) {
  /* #region  Extra */
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclose();

  const [name, setName] = useState(route.params?.toEdit?.name ?? "");
  const [nameError, setNameError] = useState(false);
  const [category, setCategory] = useState(
    route.params?.toEdit?.category ?? "Bills"
  );
  const [frequency, setFrequency] = useState(
    route.params?.toEdit?.frequency ?? "Monthly"
  );
  const [dueDate, setDueDate] = useState(
    route.params?.toEdit?.dueDate ??
      `${new Date().getUTCDate()} ${MONTHS[new Date().getUTCMonth()]}`
  );
  const [price, setPrice] = useState(route.params?.toEdit?.price ?? "");

  const [YOffset, setYOffset] = useState(70);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (route.params?.selectedCategory)
      setCategory(route.params.selectedCategory);
  }, [route]);

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity
          onPress={() => {
            switch (route.params?.prevScreen) {
              case "AllRegulars": {
                navigation.navigate("AllRegulars");
                break;
              }
              default:
                navigation.navigate("FinanceTracker", { regular: null });
            }
          }}
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Add regular
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const onSelectDate = (_, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    setDueDate(
      `${currentDate.getUTCDate()} ${MONTHS[currentDate.getUTCMonth()]}`
    );
  };

  function guidGenerator() {
    const S4 = () =>
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  }

  function handleSubmit() {
    if (!name) {
      setNameError(true);
      return;
    }

    if (!price) {
      return;
    }

    navigation.navigate("FinanceTracker", {
      regular: {
        id: route.params?.toEdit?.id ?? guidGenerator(),
        name,
        category,
        frequency,
        dueDate,
        price,
      },
    });
  }

  function handleDelete() {
    navigation.navigate("FinanceTracker", {
      regular: {
        id: route.params.toEdit.id,
        delete: true,
      },
    });
  }

  const DatePicker = () => {
    return Platform.OS === "android" && show ? (
      <DateTimePicker
        value={date}
        display="calendar"
        minimumDate={new Date()}
        onChange={onSelectDate}
      />
    ) : null;
  };
  /* #endregion */

  return (
    <>
      <AppBar />
      <DatePicker />

      <Box variant="background" pt={10} flex={1} alignItems="center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "height"}
          keyboardVerticalOffset={YOffset}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Box>
              <Box w={wp(90)} h={hp(10)}>
                <TextInput
                  onTouchStart={() => setYOffset(0)}
                  onFocus={() => setNameError(false)}
                  error={nameError}
                  label="Name"
                  style={{
                    height: 50,
                    backgroundColor: theme.colors[background].main,
                  }}
                  autoCapitalize="words"
                  theme={{
                    colors: {
                      placeholder:
                        colorMode === "dark"
                          ? "white"
                          : theme.colors.backgroundLight.dark,
                      text:
                        colorMode === "dark"
                          ? "white"
                          : theme.colors.backgroundLight.dark,
                      primary:
                        colorMode === "dark"
                          ? theme.colors.primary[500]
                          : theme.colors.backgroundLight.dark,
                      underlineColor: "transparent",
                    },
                  }}
                  mode="outlined"
                  value={name}
                  outlineColor={
                    colorMode === "dark"
                      ? theme.colors.primary[500]
                      : theme.colors.backgroundLight.dark
                  }
                  onChangeText={setName}
                />
              </Box>
              <Box
                flexDirection="row"
                w={wp(90)}
                h={60}
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" alignItems="center">
                  <Image
                    alt={category}
                    source={CATEGORIES.find((c) => c.name === category).image}
                    size={wp(7)}
                  />
                  <Box ml={5}>
                    <Text fontSize="sm" _dark={{ color: "gray.400" }}>
                      Which category?
                    </Text>
                    <Text
                      fontWeight="bold"
                      _light={{ color: "background.darker" }}
                    >
                      {category}
                    </Text>
                  </Box>
                </Box>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("SelectCategory", {
                      category,
                      toEdit: route.params?.toEdit,
                    });
                  }}
                >
                  <Box p={2}>
                    <Text fontWeight="bold" fontSize="lg" color="primary.500">
                      Edit
                    </Text>
                  </Box>
                </TouchableOpacity>
              </Box>
              <Divider my={1} w={wp(90)} />
              <Box
                flexDirection="row"
                w={wp(90)}
                h={60}
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" alignItems="center">
                  <Icon
                    as={<MaterialIcons />}
                    name="timelapse"
                    color="primary.500"
                  />
                  <Box ml={5}>
                    <Text fontSize="sm" _dark={{ color: "gray.400" }}>
                      How often?
                    </Text>
                    <Text
                      fontWeight="bold"
                      _light={{ color: "background.darker" }}
                    >
                      {frequency}
                    </Text>
                  </Box>
                </Box>
                <TouchableOpacity onPress={onOpen}>
                  <Box p={2}>
                    <Text fontWeight="bold" fontSize="lg" color="primary.500">
                      Edit
                    </Text>
                  </Box>
                </TouchableOpacity>
              </Box>
              <Divider my={1} w={wp(90)} />
              <Box
                flexDirection="row"
                w={wp(90)}
                h={60}
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" alignItems="center">
                  <Icon
                    as={<MaterialIcons />}
                    name="calendar-today"
                    color="primary.500"
                  />
                  <Box ml={5}>
                    <Text fontSize="sm" _dark={{ color: "gray.400" }}>
                      When is your next bill due?
                    </Text>
                    <Text
                      fontWeight="bold"
                      _light={{ color: "background.darker" }}
                    >
                      {dueDate}
                    </Text>
                  </Box>
                </Box>

                {Platform.OS === "ios" ? (
                  <DateTimePicker
                    value={date}
                    display="calendar"
                    minimumDate={new Date()}
                    onChange={onSelectDate}
                    style={{
                      backgroundColor: theme.colors[background].main,
                      height: 30,
                      width: 100,
                    }}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setShow(true);
                    }}
                  >
                    <Box p={2}>
                      <Text fontWeight="bold" fontSize="lg" color="primary.500">
                        Edit
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}
              </Box>
              <Divider my={1} w={wp(90)} />
              <Box w={wp(90)} my={5}>
                <Text fontWeight="bold" fontSize="22px">
                  How much do you pay?
                </Text>
                <Box w={wp(90)} pt={3}>
                  <TextInput
                    onTouchStart={() => setYOffset(70)}
                    keyboardType="number-pad"
                    left={
                      <TextInput.Affix
                        textStyle={{
                          color: theme.colors.primary[500],
                          fontSize: 20 / Dimensions.get("screen").fontScale,
                          marginEnd: 5,
                        }}
                        text="£"
                      />
                    }
                    placeholder="0"
                    error={!/^[-]*\d+([.]\d\d?)?$/.test(price) && !!price}
                    style={{
                      height: 40,
                      fontSize: 20 / Dimensions.get("screen").fontScale,
                      backgroundColor: theme.colors[background].main,
                      paddingLeft: 5,
                      fontWeight: "bold",
                    }}
                    theme={{
                      colors: {
                        placeholder:
                          colorMode === "dark"
                            ? theme.colors.gray[400]
                            : theme.colors.backgroundLight.dark,
                        text:
                          colorMode === "dark"
                            ? "white"
                            : theme.colors.backgroundLight.dark,
                        primary:
                          colorMode === "dark"
                            ? theme.colors.primary[500]
                            : theme.colors.backgroundLight.dark,
                        underlineColor: "transparent",
                      },
                    }}
                    mode="flat"
                    value={price}
                    outlineColor={
                      colorMode === "dark"
                        ? theme.colors.primary[500]
                        : theme.colors.backgroundLight.dark
                    }
                    onChangeText={setPrice}
                  />
                </Box>
              </Box>
              {route.params?.toEdit && (
                <Box alignSelf="center" mt={5}>
                  <AwesomeButton
                    onPress={handleDelete}
                    width={wp(70)}
                    height={50}
                    borderRadius={25}
                    borderWidth={1}
                    borderColor={theme.colors.red[500]}
                    backgroundColor={theme.colors[background].main}
                    backgroundDarker={theme.colors[background].darker}
                    raiseLevel={3}
                  >
                    <Text color="red.400">Delete Expense</Text>
                  </AwesomeButton>
                </Box>
              )}
            </Box>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        <Box pos="absolute" mb={5} bottom={0}>
          <AwesomeButton
            onPress={handleSubmit}
            width={wp(70)}
            height={50}
            borderRadius={25}
            borderWidth={1}
            borderColor={
              colorMode === "dark"
                ? theme.colors.primary[500]
                : theme.colors.backgroundLight.dark
            }
            backgroundColor={theme.colors[background].main}
            backgroundDarker={theme.colors[background].darker}
            raiseLevel={3}
          >
            <Text _dark={{ color: "primary.400" }}>Done</Text>
          </AwesomeButton>
        </Box>
      </Box>
      <Actionsheet hideDragIndicator={true} isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Text alignSelf="flex-start" p={3} fontSize="lg">
            How often?
          </Text>
          <Actionsheet.Item
            onPress={() => {
              setFrequency(FREQUENCIES.Weekly);
              onClose();
            }}
            startIcon={
              <Icon
                as={<MaterialCommunityIcons />}
                name="calendar-month"
                color="primary.500"
                size="sm"
                mr={3}
              />
            }
          >
            <Text fontWeight="bold">Weekly</Text>
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={() => {
              setFrequency(FREQUENCIES.Monthly);
              onClose();
            }}
            startIcon={
              <Icon
                as={<MaterialCommunityIcons />}
                name="calendar-weekend"
                color="primary.500"
                size="sm"
                mr={3}
              />
            }
          >
            <Text fontWeight="bold">Monthly</Text>
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={() => {
              setFrequency(FREQUENCIES.Quarterly);
              onClose();
            }}
            startIcon={
              <Icon
                as={<MaterialCommunityIcons />}
                name="calendar-week"
                color="primary.500"
                size="sm"
                mr={3}
              />
            }
          >
            <Text fontWeight="bold">Quarterly</Text>
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={() => {
              setFrequency(FREQUENCIES.Annually);
              onClose();
            }}
            startIcon={
              <Icon
                as={<MaterialCommunityIcons />}
                name="calendar-today"
                color="primary.500"
                size="sm"
                mr={3}
              />
            }
          >
            <Text fontWeight="bold">Annualy</Text>
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}

function SelectCategory({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [selectedItem, setSelectedItem] = useState(route.params.category);

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddRegular", {
              category: null,
              toEdit: route.params?.toEdit,
            })
          }
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Select category
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const renderItem = ({ item }) => (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      w={wp(90)}
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          borderRadius={wp(6)}
          borderColor="gray.500"
          borderWidth={1}
          bg={
            theme.colors[background][colorMode === "dark" ? "mainl" : "maind"]
          }
          w={wp(12)}
          h={wp(12)}
          justifyContent="center"
          alignItems="center"
        >
          <Image alt={item.name} source={item.image} size={wp(7)} />
        </Box>
        <Text fontWeight="bold" fontSize="lg" ml={4}>
          {item.name}
        </Text>
      </Box>
      <TouchableOpacity
        style={{ width: wp(6), height: wp(6) }}
        onPress={() => setSelectedItem(item.name)}
      >
        <Center
          w={wp(5)}
          h={wp(5)}
          borderRadius={wp(2.5)}
          borderColor="primary.500"
          borderWidth={1}
        >
          <Box
            w={wp(3)}
            h={wp(3)}
            bg={
              selectedItem === item.name
                ? "primary.500"
                : theme.colors[background].main
            }
            borderRadius={wp(1.5)}
          ></Box>
        </Center>
      </TouchableOpacity>
    </Box>
  );

  return (
    <>
      <AppBar />
      <Box
        variant="background"
        flex={1}
        justifyContent="center"
        alignItems="center"
      >
        <FlatList
          mt={5}
          mb={100}
          data={CATEGORIES}
          keyExtractor={(item, index) => `${item}-${index}`}
          ItemSeparatorComponent={() => <Divider my={3} />}
          renderItem={renderItem}
        />
        <Box pos="absolute" mb={5} bottom={0}>
          <AwesomeButton
            onPress={() => {
              navigation.navigate("AddRegular", {
                selectedCategory: selectedItem,
                toEdit: route.params?.toEdit,
              });
            }}
            width={wp(70)}
            height={50}
            borderRadius={25}
            borderWidth={1}
            borderColor={
              colorMode === "dark"
                ? theme.colors.primary[500]
                : theme.colors.backgroundLight.dark
            }
            backgroundColor={theme.colors[background].main}
            backgroundDarker={theme.colors[background].darker}
            raiseLevel={3}
          >
            <Text _dark={{ color: "primary.400" }}>Done</Text>
          </AwesomeButton>
        </Box>
      </Box>
    </>
  );
}

function AllRegulars({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [allBills, setAllBills] = useState(route.params?.bills);

  useEffect(() => {
    if (route.params?.bills) setAllBills(route.params.bills);
  }, [route]);

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FinanceTracker", { regular: null })
          }
        >
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Regular payments
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const renderItem = ({ item }) => {
    const image = CATEGORIES.find((c) => c.name === item.category).image;
    return (
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w={wp(90)}
      >
        <Box flexDirection="row" alignItems="center">
          <Box
            borderRadius={wp(6)}
            borderColor="gray.500"
            borderWidth={1}
            bg={
              theme.colors[background][colorMode === "dark" ? "mainl" : "maind"]
            }
            w={wp(12)}
            h={wp(12)}
            justifyContent="center"
            alignItems="center"
          >
            <Image alt={item.category} source={image} size={wp(7)} />
          </Box>
          <Box ml={4}>
            <Text fontWeight="bold" fontSize="lg">
              {item.name}
            </Text>
            <Text fontSize="sm" _dark={{ color: "gray.400" }}>{`${
              item.frequency
            } on the ${
              item.dueDate.substr(0, 2) === "1 "
                ? "1st"
                : item.dueDate.substr(0, 2) === "2 "
                ? "2nd"
                : item.dueDate.substr(0, 2) === "3 "
                ? "3rd"
                : `${parseInt(item.dueDate.substr(0, 2))}th`
            }`}</Text>
          </Box>
        </Box>
        <Text fontWeight="bold" fontSize="lg">
          £{item.price}
        </Text>
      </Box>
    );
  };

  return (
    <>
      <AppBar />
      <Box
        variant="background"
        flex={1}
        justifyContent="center"
        alignItems="center"
      >
        <FlatList
          mt={5}
          ItemSeparatorComponent={() => <Divider my={3} />}
          showsVerticalScrollIndicator={false}
          data={allBills}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderItem}
          ListFooterComponent={() => (
            <Box alignItems="center" mt={3}>
              <Divider />
              <Box
                flexDirection="row"
                justifyContent="space-between"
                w={wp(80)}
                mt={3}
              >
                <Text fontWeight="bold" fontSize="lg">
                  Total
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                  £
                  {route.params?.bills
                    .reduce((a, c) => a + parseFloat(c.price), 0)
                    .toFixed(2)}
                </Text>
              </Box>

              <Box mt={5}>
                <AwesomeButton
                  onPress={() => {
                    navigation.navigate("AddRegular", {
                      prevScreen: "AllRegulars",
                    });
                  }}
                  width={wp(60)}
                  height={50}
                  borderRadius={25}
                  borderWidth={1}
                  borderColor={
                    colorMode === "dark"
                      ? theme.colors.primary[500]
                      : theme.colors.backgroundLight.dark
                  }
                  backgroundColor={theme.colors[background].main}
                  backgroundDarker={theme.colors[background].darker}
                  raiseLevel={3}
                >
                  <Text _dark={{ color: "primary.400" }}>Add regulars</Text>
                  <Icon
                    ml={2}
                    as={<MaterialIcons />}
                    name="post-add"
                    size="md"
                    color="primary.500"
                  />
                </AwesomeButton>
              </Box>
            </Box>
          )}
        />
      </Box>
    </>
  );
}

export default function FinanceTrackerNav() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Overview"
      screenOptions={navigatorOptions}
    >
      <Stack.Screen name="Overview" component={Overview} />
      <Stack.Screen name="AddAccount" component={AddAccount} />
      <Stack.Screen name="LinkedAccounts" component={LinkedAccounts} />
      <Stack.Screen name="BankDetails" component={BankDetails} />
      <Stack.Screen name="FinanceTracker" component={FinanceTracker} />
      <Stack.Screen name="AllRegulars" component={AllRegulars} />
      <Stack.Screen name="AddRegular" component={AddRegular} />
      <Stack.Screen name="SelectCategory" component={SelectCategory} />
    </Stack.Navigator>
  );
}
