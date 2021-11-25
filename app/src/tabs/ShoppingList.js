import React, { useEffect, useRef, useState, createRef } from "react";
import { theme, navigatorOptions } from "../config/constants";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Box,
  Text,
  HStack,
  Icon,
  FlatList,
  useColorModeValue,
  useColorMode,
  Input,
} from "native-base";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import firebase from "firebase";
import LottieView from "lottie-react-native";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

let nav = null;

function ShoppingList({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();
  const listRef = useRef();
  const [meals, setMeals] = useState([]);

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
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
        <Box alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Shopping
          </Text>
        </Box>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  useEffect(() => {
    //TO-DO: Fetch meal list from async storage
  }, []);

  useEffect(() => {
    if (!route.params?.newMeal) return;
    let idx = meals.findIndex((m) => m.title === route.params.newMeal.title);
    if (idx >= 0) return; //TO-DO: Edit an existing meal
    setMeals((prev) => [...prev, route.params.newMeal]);
    console.log(route.params.newMeal);
    //TO-DO: Add new meal to async storage
  }, [route]);

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} alignItems="center">
        <TouchableWithoutFeedback
          onPress={() => {
            listRef.current.reset();
            listRef.current.play();
          }}
        >
          <Box w={wp(100)} h={wp(75)}>
            <LottieView
              ref={listRef}
              autoPlay
              loop
              source={require("../components/Lottie/list.json")}
            />
          </Box>
        </TouchableWithoutFeedback>

        {meals.length > 0 ? (
          <FlatList
            data={meals}
            keyExtractor={(_, index) => `meal${index}`}
            renderItem={({ item }) => (
              <Box>
                <Text>{item.title}</Text>
              </Box>
            )}
            ListFooterComponent={
              <AwesomeButton
                key="addmealbtnft"
                onPress={() => navigation.navigate("AddMeal")}
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
                <Text _dark={{ color: "primary.400" }}>Add a meal</Text>
              </AwesomeButton>
            }
          />
        ) : (
          <AwesomeButton
            key="addmealbtn"
            onPress={() => navigation.navigate("AddMeal")}
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
            <Text _dark={{ color: "primary.400" }}>Add a meal</Text>
          </AwesomeButton>
        )}
      </Box>
    </>
  );
}

function AddMeal({ navigation, route }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();

  const [title, setTitle] = useState(route.params?.toEdit?.title ?? "");
  const [ingredients, setIngredients] = useState(
    route.params?.toEdit?.ingredients ?? [""]
  );
  const [value, setValue] = useState("");
  const focusedRef = useRef(-1);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "backgroundLight.main" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Add a meal
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          color={
            colorMode === "dark" ? "background.main" : "backgroundLight.main"
          }
        />
      </HStack>
    );
  }

  const titleRef = useRef();
  const ingredientRefs = useRef([]);
  if (ingredientRefs.current.length !== ingredients.length) {
    ingredientRefs.current = Array(ingredients.length)
      .fill()
      .map((_, i) => ingredientRefs.current[i] || createRef());
  }

  function SaveAndGoBack() {
    if (focusedRef.current < 0) {
      navigation.navigate("ShoppingList");
      return;
    }
    let arr = [...ingredients];
    arr[focusedRef.current] = value;
    navigation.navigate("ShoppingList", {
      newMeal: { title, ingredients: arr },
    });
  }

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} alignItems="center">
        <Input
          ref={titleRef}
          onLayout={() => titleRef.current.focus()}
          w={wp(98)}
          mt={5}
          size="2xl"
          selectionColor="#ddd"
          variant="unstyled"
          placeholder="Title"
          value={title}
          onChange={({ nativeEvent: { text } }) => setTitle(text)}
          onSubmitEditing={() => ingredientRefs.current[0].focus()}
        />
        {ingredients.map((ingredient, i) => (
          <Input
            key={`${ingredient}-${i}`}
            ref={(el) => (ingredientRefs.current[i] = el)}
            my={-2}
            mr={wp(5)}
            ml={wp(5)}
            blurOnSubmit={false}
            selectionColor="#ddd"
            variant="unstyled"
            value={focusedRef.current === i ? value : ingredient}
            onLayout={() => {
              if (focusedRef.current === -2 && i === ingredients.length - 1)
                ingredientRefs.current[i].focus();
            }}
            onFocus={() => {
              focusedRef.current = i;
              setValue(ingredient);
            }}
            onSubmitEditing={({ nativeEvent: { text } }) => {
              focusedRef.current = -2;
              setIngredients((prev) => {
                let edited = [...prev];
                edited[i] = text;
                return edited[edited.length - 1] === ""
                  ? edited
                  : [...edited, ""];
              });
            }}
            onEndEditing={({ nativeEvent: { text } }) => {
              setIngredients((prev) => {
                let edited = [...prev];
                edited[i] = text;
                return edited;
              });
            }}
            onChange={({ nativeEvent: { text } }) => setValue(text)}
            InputLeftElement={
              // <Box flexDirection="row" alignItems="center">
              //   <Icon
              //     size="sm"
              //     as={<MaterialIcons name="drag-indicator" />}
              //     _light={{ color: "primary.600" }}
              //     _dark={{ color: "backgroundLight.main" }}
              //   />
              //   <Box
              //     w={wp(4)}
              //     h={wp(4)}
              //     ml={2}
              //     borderColor="#fff"
              //     borderWidth={2}
              //   />
              // </Box>
              <Box w={wp(3)} h={wp(3)} bg="#fff" borderRadius={wp(1.5)} />
            }
            InputRightElement={
              <Box>
                {focusedRef.current === i && (
                  <TouchableOpacity
                    onPress={() => {
                      focusedRef.current = -1;
                      setIngredients((prev) =>
                        prev.filter((_, index) => index != i)
                      );
                    }}
                  >
                    <Icon
                      size="sm"
                      as={<Ionicons name="close" />}
                      _light={{ color: "primary.600" }}
                      _dark={{ color: "backgroundLight.main" }}
                    />
                  </TouchableOpacity>
                )}
              </Box>
            }
          />
        ))}
        <Box w={wp(82)}>
          <TouchableOpacity
            onPress={() => setIngredients((prev) => [...prev, ""])}
          >
            <Box flexDirection="row" alignItems="center">
              <Icon
                size="md"
                as={<Ionicons name="add" />}
                _light={{ color: "primary.600" }}
                _dark={{ color: "backgroundLight.main" }}
              />
              <Text ml={2}>List item</Text>
            </Box>
          </TouchableOpacity>
        </Box>
        <Box pos="absolute" mb={5} bottom={0}>
          <AwesomeButton
            onPress={() => SaveAndGoBack()}
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

export default function ShoppingListNav({ navigation }) {
  useEffect(() => {
    nav = navigation;
  }, []);
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="ShoppingList"
      screenOptions={navigatorOptions}
    >
      <Stack.Screen name="ShoppingList" component={ShoppingList} />
      <Stack.Screen name="AddMeal" component={AddMeal} />
    </Stack.Navigator>
  );
}
