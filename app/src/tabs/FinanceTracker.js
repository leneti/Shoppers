import React, { useEffect, useState } from "react";
import { theme, navigatorOptions } from "../config/constants";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
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
} from "native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import firebase from "firebase";
import Svg, { Circle } from "react-native-svg";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  Foundation,
} from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORIES = [
  { name: "Bills", image: require(`../../res/icons/048-bill.png`) },
  {
    name: "Shopping",
    image: require(`../../res/icons/033-shopping-bags.png`),
  },
  { name: "Investing", image: require(`../../res/icons/049-trend.png`) },
  {
    name: "Rainy Day Savings",
    image: require(`../../res/icons/051-insurance.png`),
  },
  { name: "Savings", image: require(`../../res/icons/060-wallet.png`) },
  {
    name: "Commuting",
    image: require(`../../res/icons/058-autonomous-car.png`),
  },
  {
    name: "Services",
    image: require(`../../res/icons/061-idea.png`),
  },
  {
    name: "Other",
    image: require(`../../res/icons/052-money-1.png`),
  },
];

function FinanceTracker({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [total, setTotal] = useState(80.04);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    if (route.params) {
      const bill = route.params.regular;
      if (
        bills.findIndex(
          (b) =>
            b.name === bill.name &&
            b.category === bill.category &&
            b.price === bill.price
        ) >= 0
      )
        return;
      console.log(bill);
      const newBillArr = [...bills, bill];
      setBills(newBillArr);
      setTotal(newBillArr.reduce((a, c) => a + parseFloat(c.price), 0));
    }
  }, [route]);

  const CL = 700;
  const R = CL / (2 * Math.PI);
  const STROKE_WIDTH = 10;

  const renderBill = ({ item }) => {
    const paid = new Date().getDate() > parseInt(item.dueDate.substr(0, 2));
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
        <HStack
          justifyContent="space-between"
          alignItems="center"
          bg={theme.colors[background].mainl}
          borderTopRadius={15}
        >
          <Image
            source={CATEGORIES.find((c) => c.name === item.category).image}
            alt={item.category}
            size={wp(8)}
          />
          <Box
            borderRadius={15}
            w={paid ? wp(10) : wp(15)}
            h={6}
            bg={
              paid
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
                paid
                  ? colorMode === "dark"
                    ? "emerald.900"
                    : "success.500"
                  : colorMode === "dark"
                  ? "gray.700"
                  : "gray.500"
              }
            >
              {paid ? "Paid" : "Upcoming"}
            </Text>
          </Box>
        </HStack>
        <Box pt={5} pb={3}>
          <Text fontSize="lg">{item.name}</Text>
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
    );
  };

  return (
    <Box variant="background" safeAreaTop flex={1} alignItems="center">
      <Text fontSize="2xl" fontWeight="bold" py={3}>
        FinanceTracker
      </Text>
      <Box flexDirection="row" alignItems="center">
        <Box ml={wp(-20)} alignItems="center">
          <Text
            insetY={R + STROKE_WIDTH / 2 + 21}
            fontSize={26}
            fontWeight="bold"
          >
            £{total}
          </Text>
          <Text insetY={R + STROKE_WIDTH / 2 + 21} fontSize={16}>
            Total this month
          </Text>
          <Svg
            style={{
              transform: [{ rotate: "-90deg" }],
            }}
            height={2 * R + STROKE_WIDTH + 5}
            width={2 * R + STROKE_WIDTH + 5}
          >
            <Circle
              cx={R + STROKE_WIDTH / 2}
              cy={R + STROKE_WIDTH / 2}
              r={R}
              stroke={
                theme.colors[background][
                  colorMode === "dark" ? "lighter" : "darker"
                ]
              }
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              cx={R + STROKE_WIDTH / 2}
              cy={R + STROKE_WIDTH / 2}
              r={R}
              stroke={theme.colors.primary[500]}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CL}
              strokeDashoffset={CL * 0.3}
              strokeLinecap={"round"}
            />
          </Svg>
        </Box>
        <Box mr={-10} pl={10}>
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
            ></Box>
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                £30.94
              </Text>
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
            ></Box>
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                £49.10
              </Text>
              <Text fontSize="sm" color="gray.400">
                Paid
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider my={5} w={wp(90)} />

      {bills.length > 0 ? (
        <>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(90)}
          >
            <Text fontSize="lg" fontWeight="bold">
              Bills & Subscriptions
            </Text>
            <Text color="primary.500" fontWeight="bold" fontSize="lg">
              See all
            </Text>
          </Box>
          <FlatList
            data={bills}
            horizontal
            ml={4}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderBill}
          />
        </>
      ) : (
        <AwesomeButton
          onPress={() => {
            navigation.navigate("AddRegular");
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
      )}
    </Box>
  );
}

function AddRegular({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclose();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [category, setCategory] = useState("Bills");
  const [frequency, setFrequency] = useState("Monthly");
  const [dueDate, setDueDate] = useState(
    `${new Date().getUTCDate()} ${MONTHS[new Date().getUTCMonth()]}`
  );
  const [price, setPrice] = useState("");

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (route.params) setCategory(route.params.selectedCategory);
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
        name,
        category,
        frequency,
        dueDate,
        price,
      },
    });
  }

  return (
    <>
      <AppBar />
      {show && (
        <DateTimePicker
          value={date}
          display="calendar"
          minimumDate={new Date()}
          onChange={onSelectDate}
        />
      )}
      <Box variant="background" mt={10} flex={1} alignItems="center">
        <Box w={wp(90)} h={hp(10)}>
          <TextInput
            onFocus={() => setNameError(false)}
            error={nameError}
            label="Name"
            style={{
              height: 50,
              backgroundColor: theme.colors[background].main,
            }}
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
            <Icon as={<Ionicons />} name="md-list" color="primary.500" />
            <Box ml={5}>
              <Text fontSize="sm" _dark={{ color: "gray.400" }}>
                Which category?
              </Text>
              <Text fontWeight="bold" _light={{ color: "background.darker" }}>
                {category}
              </Text>
            </Box>
          </Box>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SelectCategory", { category });
            }}
          >
            <Box>
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
            <Icon as={<MaterialIcons />} name="timelapse" color="primary.500" />
            <Box ml={5}>
              <Text fontSize="sm" _dark={{ color: "gray.400" }}>
                How often?
              </Text>
              <Text fontWeight="bold" _light={{ color: "background.darker" }}>
                {frequency}
              </Text>
            </Box>
          </Box>
          <TouchableOpacity onPress={onOpen}>
            <Box>
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
              <Text fontWeight="bold" _light={{ color: "background.darker" }}>
                {dueDate}
              </Text>
            </Box>
          </Box>
          <TouchableOpacity
            onPress={() => {
              setShow(true);
            }}
          >
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="primary.500">
                Edit
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
        <Divider my={1} w={wp(90)} />
        <Box w={wp(90)} my={5}>
          <Text fontWeight="bold" fontSize="22px">
            How much do you pay?
          </Text>
          <Box w={wp(90)}>
            <TextInput
              keyboardType="number-pad"
              label="£"
              placeholder="0"
              error={!/^[£-]*\d+([.]\d\d?)?$/.test(price) && !!price}
              style={{
                height: 50,
                backgroundColor: theme.colors[background].main,
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
              setFrequency("Weekly");
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
              setFrequency("Monthly");
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
              setFrequency("Quarterly");
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
              setFrequency("Annualy");
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
          onPress={() => navigation.navigate("AddRegular", { category: null })}
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
          data={CATEGORIES}
          keyExtractor={(item, index) => `${item}-${index}`}
          ItemSeparatorComponent={() => <Divider my={3} />}
          renderItem={({ item }) => {
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
                      theme.colors[background][
                        colorMode === "dark" ? "mainl" : "maind"
                      ]
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
          }}
        />
        <Box pos="absolute" mb={5} bottom={0}>
          <AwesomeButton
            onPress={() => {
              navigation.navigate("AddRegular", {
                selectedCategory: selectedItem,
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

export default function FinanceTrackerNav() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="FinanceTracker"
      screenOptions={navigatorOptions}
    >
      <Stack.Screen name="FinanceTracker" component={FinanceTracker} />
      <Stack.Screen name="AddRegular" component={AddRegular} />
      <Stack.Screen name="SelectCategory" component={SelectCategory} />
    </Stack.Navigator>
  );
}
