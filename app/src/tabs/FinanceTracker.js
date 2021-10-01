import React, { useEffect, useState } from "react";
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

function Overview({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [accounts, setAccounts] = useState([1]);
  const [bills, setBills] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    // const appLink = Linking.makeUrl();
    if (bills.length === 0)
      (async function () {
        let mBills = await getBills();
        mBills = mBills.filter((b) => !b.paid);
        setBills(mBills);
        setTimeout(() => {
          setLoadingInfo(false);
        }, 500);
      })();
  }, []);

  const renderAccount = ({ item }) => {
    return (
      <Box flexDirection="row" alignItems="center" h={wp(15)} px={3}>
        <Box rounded="full" bg="#999" w={wp(10)} h={wp(10)} />
        <Box pl={4}>
          <Text fontWeight="bold">
            {currencyFormat.format(Math.random() * 10000 + 16)}
          </Text>
          <Text fontSize="sm" color="gray.400">
            Revolut
          </Text>
        </Box>
      </Box>
    );
  };

  const renderUpcoming = ({ item }) => {
    const d = new Date();
    const [cMonth, cDay, cYear] = [d.getMonth(), d.getDate(), d.getFullYear()];
    const month = item.dueDate.split(" ")[1];
    const monthIndex = MONTHS.findIndex((m) => m === month); //Oct == 9
    const day = parseInt(item.dueDate.split(" ")[0]);
    const freq = item.frequency;

    d.setDate(day);
    d.setMonth(monthIndex);

    switch (freq) {
      case FREQUENCIES.Monthly: {
        break;
      }
      case FREQUENCIES.Weekly: {
        break;
      }
      case FREQUENCIES.Quarterly: {
        break;
      }
      case FREQUENCIES.Annually: {
        break;
      }
    }

    return (
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
          {day} {MONTH_TRUNC[item.dueDate.split(" ")[1]]}
        </Text>
      </Box>
    );
  };

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
          <TouchableOpacity onPress={() => {}}>
            <Text color="primary.500" fontWeight="bold" fontSize="lg">
              Manage
            </Text>
          </TouchableOpacity>
        </Box>
        {accounts.length === 0 ? (
          <Box mt={5}>
            <AwesomeButton
              onPress={() => {
                navigation.navigate("FinanceTracker");
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
          <Box h={wp(15)} alignSelf="flex-start">
            <FlatList
              data={[1, 2, 3, 4, 5]}
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
            onPress={() => {
              navigation.navigate("FinanceTracker");
            }}
          >
            <Text color="primary.500" fontWeight="bold" fontSize="lg">
              Details
            </Text>
          </TouchableOpacity>
        </Box>
        {accounts.length === 0 ? (
          <Box mt={5}>
            <AwesomeButton
              onPress={() => {}}
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
    // const appLink = Linking.makeUrl();
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
          FinanceTracker
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
            description="Total since payday"
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
      <Stack.Screen name="FinanceTracker" component={FinanceTracker} />
      <Stack.Screen name="AllRegulars" component={AllRegulars} />
      <Stack.Screen name="AddRegular" component={AddRegular} />
      <Stack.Screen name="SelectCategory" component={SelectCategory} />
    </Stack.Navigator>
  );
}
