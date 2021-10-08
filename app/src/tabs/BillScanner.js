import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { navigatorOptions, theme, MONTHS, TEST } from "../config/constants";
import { takePicture, pickImage } from "../api/ImagePicker";
import { uploadImage } from "../api/ImageUpload";
import { LogBox, ScrollView, TouchableOpacity } from "react-native";
import { GOOGLE_CLOUD_VISION_API_KEY } from "../config/secret";
import { parseResponse } from "../api/VisionParser";
import firebase from "firebase";
import {
  Text,
  Box,
  Image,
  HStack,
  Icon,
  FlatList,
  Popover,
  Pressable,
  Divider,
  useColorModeValue,
  useColorMode,
  Modal,
} from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";

LogBox.ignoreLogs(["Setting a timer", "VirtualizedLists"]);

function BillScanner({ navigation }) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();
  const [googleResponse, setGoogleResponse] = useState(null);
  const [analyse, setAnalyse] = useState(false);
  const [image, setImage] = useState(null);
  const [progressText, setProgressText] = useState("");

  function handlePickedImage(pickerResult) {
    if (!pickerResult.cancelled) {
      setImage(pickerResult);
      setAnalyse(false);
      setGoogleResponse(null);
    }
  }

  useEffect(() => {
    if (!googleResponse) return;
    const { date, time, market } = googleResponse;
    if (!date || !time || !market) {
      console.warn(
        `Could not fully analyse receipt! Only found: [date: ${date}, time: ${time}, market: ${market}]`
      );
    }
    const newPath = `${market ?? "LIDL"}--${
      !date
        ? MONTHS[new Date().getUTCMonth()]
        : MONTHS[parseInt(date.substr(3, 2)) - 1]
    }-${!date ? new Date().getUTCDate() : date.substr(0, 2)}--${
      !time ? new Date().getTime() : time.substr(0, 5)
    }`;
    let firestorePath = newPath;
    firebase
      .storage()
      .ref(newPath)
      .getDownloadURL()
      .then(() =>
        console.log(
          "\u001b[33m" + `File already exists: ${newPath}` + "\u001b[0m"
        )
      )
      .catch(() => {
        uploadImage(image.uri, newPath)
          .then(({ path }) => console.log(`${path} uploaded`))
          .catch(console.warn);
      });

    (async function uploadToFirestore(firestorePath) {
      try {
        await firebase
          .firestore()
          .collection("bills")
          .doc(firestorePath)
          .set(googleResponse);
        console.log(`${firestorePath} saved to Firestore`);
        setImage(null);
        setAnalyse(false);
        navigation.navigate("BillSplitter", {
          googleResponse,
          firestorePath,
        });
        setTimeout(() => setGoogleResponse(null), 1000);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    })(firestorePath);
  }, [googleResponse]);

  async function submitToGoogle() {
    try {
      if (TEST.TestBill) {
        const testResponse = {
          date: "04/09/21",
          items: [
            {
              discount: "-0.63",
              name: "Loose Kiwi 6× £0.22",
              price: "1.32",
            },
            {
              name: "Vanilla Yoghurt",
              price: "1.99",
            },
            {
              name: "Froz PizzaDBIPepp2Pk",
              price: "0.99",
            },
            {
              name: "Froz Pizza Hawaii",
              price: "0.99",
            },
            {
              name: "Breaded Katsu Kiev",
              price: "1.49",
            },
            {
              name: "Scot SemSkimMilk 2PT",
              price: "0.80",
            },
            {
              name: "Chicken Legs 1kg",
              price: "1.69",
            },
            {
              name: "Tom&Basil PastaSauce",
              price: "0.49",
            },
            {
              name: "Cornichons Classic",
              price: "0.72",
            },
            {
              name: "Granulated Sugar",
              price: "0.65",
            },
            {
              name: "ChorizoSartaûriginal",
              price: "1.49",
            },
            {
              name: "Sunflower Of1",
              price: "1.09",
            },
            {
              name: "Yellow Split Peas",
              price: "0.49",
            },
            {
              name: "New Potatoes",
              price: "0.99",
            },
            {
              name: "Loose Carrots\n0.512kg @ 0.40/kg",
              price: "0.20",
            },
            {
              name: "Classic Ice Almond",
              price: "1.79",
            },
            {
              name: "Fat Free Vanilla Yog",
              price: "0.75",
            },
            {
              name: "Toiletrimlemon",
              price: "0.99",
            },
            {
              name: "Mild Grated Cheddar",
              price: "2.49",
            },
            {
              name: "Italian Moz2arella",
              price: "0.45",
            },
            {
              name: "Scotch Beef Mince10%",
              price: "2.29",
            },
            {
              name: "Milk Chocolate 2 x £0.45",
              price: "0.90",
            },
            {
              name: "Sweet&Salty Popcorn",
              price: "1.09",
            },
            {
              name: "Cocoa Orange Bars",
              price: "0.39",
            },
            {
              name: "Toffee Popcorn",
              price: "1.09",
            },
            {
              name: "Cucumber",
              price: "0.43",
            },
            {
              name: "Mango",
              price: "0.59",
            },
            {
              name: "Bananas Loose\n1.374kg @ 0.73/kg",
              price: "1.00",
            },
            {
              name: "Red Gala Apples",
              price: "0.89",
            },
            {
              name: "Medium Avocado",
              price: "0.49",
            },
            {
              name: "Pineapple",
              price: "0.69",
            },
          ],
          market: "LIDL",
          time: "15:04:33",
          total: 31.709999999999994,
        };
        setGoogleResponse(testResponse);
        return;
      }
      const { url, path } = await uploadImage(image.uri);
      console.log(`${path} uploaded`);
      setProgressText("Parsing the image...");
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: "TEXT_DETECTION", maxResults: 5 },
              // { type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
            ],
            image: {
              source: {
                imageUri: url,
              },
            },
          },
        ],
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          GOOGLE_CLOUD_VISION_API_KEY,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body,
        }
      );
      let responseJson = await response.json();
      if (!responseJson) throw new Error(`Bad responseJson: ${responseJson}`);
      if (responseJson.responses[0].error)
        throw new Error(responseJson.responses[0].error);
      let data = responseJson.responses[0].textAnnotations;
      const parsedResponse = parseResponse(data);
      console.log(parsedResponse);
      setGoogleResponse(parsedResponse);
      deleteFromStorage(path)
        .then(() => console.log(`${path} deleted`))
        .catch(console.warn);
    } catch (error) {
      console.warn(error);
    } finally {
      setProgressText("");
    }
  }

  async function deleteFromStorage(path) {
    try {
      return firebase.storage().ref().child(path).delete();
    } catch (message) {
      console.warn(message);
      return null;
    }
  }

  const SelectedImage = () => {
    return !image ? null : (
      <Image
        source={{ uri: image.uri }}
        alt="Image to analyse text from"
        w={wp(75)}
        h={(image.height * wp(75)) / image.width}
        mt={10}
        borderRadius={20}
        borderWidth={2}
        _light={{
          borderColor: "backgroundLight.dark",
        }}
        _dark={{ borderColor: "primary.600" }}
        onLoad={() => setAnalyse(true)}
      />
    );
  };

  const AnalyseButton = () => {
    return analyse ? (
      <Box w={wp(60)} alignItems="center">
        <Box w={wp(60)} flexDirection="row" justifyContent="space-between">
          <AwesomeButton
            onPress={() => {
              setImage(null);
              setAnalyse(false);
            }}
            width={wp(25)}
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
            style={{ marginTop: 20 }}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text _dark={{ color: "primary.400" }} ml={2}>
              New
            </Text>
          </AwesomeButton>
          <AwesomeButton
            progress
            progressLoadingTime={6000}
            onPress={async (next) => {
              setProgressText("Uploading image to Firebase...");
              await submitToGoogle();
              next();
            }}
            width={googleResponse ? wp(30) : wp(25)}
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
            style={{ marginTop: 20 }}
          >
            <Ionicons
              name="analytics"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text _dark={{ color: "primary.400" }} ml={2}>
              Analyse
            </Text>
          </AwesomeButton>
        </Box>
        <Text mt={3}>{progressText}</Text>
      </Box>
    ) : null;
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
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.main" }}
          _dark={{ color: "background.main" }}
        />
        <Box alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Scanner
          </Text>
        </Box>
        <TouchableOpacity onPress={() => navigation.navigate("History")}>
          <Box p={1}>
            <Icon
              size="md"
              color="primary.500"
              as={<MaterialIcons name="history" />}
            />
          </Box>
        </TouchableOpacity>
      </HStack>
    );
  }

  return (
    <>
      <AppBar />
      <Box
        flex={1}
        pt={10}
        alignItems="center"
        justifyContent="space-between"
        variant="background"
      >
        {!image && (
          <Box
            alignItems="center"
            w={wp(75)}
            p={7}
            borderRadius={20}
            borderWidth={2}
            _light={{
              bg: "backgroundLight.main",
              borderColor: "backgroundLight.dark",
            }}
            _dark={{ bg: "background.main", borderColor: "primary.600" }}
            zIndex={100}
          >
            <Text numberOfLines={2} textAlign="center" fontSize="lg" mb={5}>
              Select how you would like to analyse the bill:
            </Text>
            <Box
              justifyContent="space-between"
              flexDirection="row"
              width="100%"
            >
              <AwesomeButton
                progress
                onPress={async (next) => {
                  handlePickedImage(await takePicture());
                  next();
                }}
                width={wp(25)}
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
                  _light={{ name: "camera" }}
                  _dark={{ name: "camera-outline" }}
                  as={<Ionicons />}
                  size="sm"
                  color="primary.500"
                />

                <Text _dark={{ color: "primary.400" }} ml={2}>
                  Scan
                </Text>
              </AwesomeButton>
              <AwesomeButton
                progress
                onPress={async (next) => {
                  handlePickedImage(await pickImage());
                  next();
                }}
                width={wp(25)}
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
                  as={
                    <Ionicons
                      name={useColorModeValue("images", "images-outline")}
                    />
                  }
                  size="sm"
                  color="primary.500"
                />
                <Text _dark={{ color: "primary.400" }} ml={2}>
                  Pick
                </Text>
              </AwesomeButton>
            </Box>
          </Box>
        )}
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: hp(7.5),
          }}
          showsVerticalScrollIndicator={false}
        >
          <SelectedImage />
          <AnalyseButton />
        </ScrollView>
      </Box>
    </>
  );
}

function BillSplitter({
  route: {
    params: { googleResponse, firestorePath },
  },
  navigation,
}) {
  const background = useColorModeValue("backgroundLight", "background");
  const { colorMode } = useColorMode();
  const [common, setCommon] = useState(googleResponse.items);
  const [emilija, setEmilija] = useState([]);
  const [dom, setDom] = useState([]);
  const [cExtraData, setCExtraData] = useState(false);
  const [eExtraData, setEExtraData] = useState(false);
  const [dExtraData, setDExtraData] = useState(false);

  const LISTS = { EMILIJA: "emilija", DOM: "dom", COMMON: "common" };

  const maxListHeightPercent = hp(70);
  const headerAndFooterHeight = 65;

  useEffect(() => {
    if (common.length) setCExtraData((p) => !p);
  }, [common]);

  useEffect(() => {
    if (emilija.length) setEExtraData((p) => !p);
  }, [emilija]);

  useEffect(() => {
    if (dom.length) setDExtraData((p) => !p);
  }, [dom]);

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
        <Box alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Split the bill
          </Text>
          <Text fontSize="sm" color="gray.400">
            {firestorePath}
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

  function splitItems(item, index, list) {
    const splitItem = item.name.split(" ");
    const numberOfItems = parseInt(splitItem[splitItem.indexOf("x") - 1]);
    const eachPrice = splitItem[splitItem.indexOf("x") + 1].substr(1);
    const eachName = item.name.substr(
      0,
      item.name.indexOf(splitItem[splitItem.indexOf("x") - 1]) - 1
    );
    let itemsToAdd = [];
    for (let i = 0; i < numberOfItems; i++)
      itemsToAdd.push({ name: eachName, price: eachPrice });

    switch (list) {
      case LISTS.EMILIJA: {
        let newEmilija = [...emilija];
        newEmilija.splice(index, 1, ...itemsToAdd);
        setEmilija(newEmilija);
        break;
      }
      case LISTS.DOM: {
        let newDom = [...dom];
        newDom.splice(index, 1, ...itemsToAdd);
        setDom(newDom);
        break;
      }
      default: {
        let newCommonSet = [...common];
        newCommonSet.splice(index, 1, ...itemsToAdd);
        setCommon(newCommonSet);
        break;
      }
    }
  }

  function moveLists(index, from, to) {
    switch (from) {
      case LISTS.EMILIJA: {
        switch (to) {
          case LISTS.DOM: {
            //emilija -> dom
            let newEmilija = [...emilija];
            let newDom = [...dom];
            newDom.push(...newEmilija.splice(index, 1));
            setEmilija(newEmilija);
            setDom(newDom);
            break;
          }
          default: {
            //emilija -> common
            let newEmilija = [...emilija];
            let newCommon = [...common];
            newCommon.push(...newEmilija.splice(index, 1));
            setEmilija(newEmilija);
            setCommon(newCommon);
            break;
          }
        }
        break;
      }
      case LISTS.DOM: {
        switch (to) {
          case LISTS.EMILIJA: {
            //dom -> emilija
            let newDom = [...dom];
            let newEmilija = [...emilija];
            newEmilija.push(...newDom.splice(index, 1));
            setEmilija(newEmilija);
            setDom(newDom);
            break;
          }
          default: {
            //dom -> common
            let newDom = [...dom];
            let newCommon = [...common];
            newCommon.push(...newDom.splice(index, 1));
            setCommon(newCommon);
            setDom(newDom);
            break;
          }
        }
        break;
      }
      default: {
        switch (to) {
          case LISTS.EMILIJA: {
            //common -> emilija
            let newCommon = [...common];
            let newEmilija = [...emilija];
            newEmilija.push(...newCommon.splice(index, 1));
            setCommon(newCommon);
            setEmilija(newEmilija);
            break;
          }
          default: {
            //common -> dom
            let newCommon = [...common];
            let newDom = [...dom];
            newDom.push(...newCommon.splice(index, 1));
            setCommon(newCommon);
            setDom(newDom);
            break;
          }
        }
        break;
      }
    }
  }

  const renderItem = ({ item, index, list }) => (
    <Popover
      placement="top right"
      crossOffset={50}
      trigger={(triggerProps) => (
        <Pressable
          {...triggerProps}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          pl={5}
          pr={3}
          py={2}
          h={hp(6)}
          w={wp(65)}
          rounded="lg"
          my={1}
          _dark={{ bg: "background.lighter" }}
          _light={{ bg: "backgroundLight.darker" }}
        >
          <Text _dark={{ color: "primary.400" }}>{item.name}</Text>
          <Box flexDirection="row" alignItems="center">
            {!item.discount ? (
              <Text
                _dark={{ color: "primary.500" }}
                _light={{ color: "primary.600" }}
              >
                £{item.price}
              </Text>
            ) : (
              <Box alignItems="center" mb={4}>
                <Text
                  fontSize={14}
                  textDecorationLine="line-through"
                  _dark={{ color: "primary.700" }}
                  _light={{ color: "primary.800" }}
                >
                  £{item.price}
                </Text>
                <Text
                  _dark={{ color: "primary.500" }}
                  _light={{ color: "primary.600" }}
                >
                  £
                  {(parseFloat(item.price) + parseFloat(item.discount)).toFixed(
                    2
                  )}
                </Text>
              </Box>
            )}

            <Icon
              ml={2}
              size="sm"
              as={<Ionicons name="chevron-forward" />}
              color="primary.500"
            />
          </Box>
        </Pressable>
      )}
    >
      <Popover.Content>
        <Popover.Arrow ml={wp(10)} />
        <Popover.CloseButton />
        <Popover.Header>
          <Text fontSize="sm">{item.name}</Text>
        </Popover.Header>
        <Popover.Body>
          <TouchableOpacity
            onPress={() =>
              moveLists(
                index,
                list,
                list === LISTS.EMILIJA ? LISTS.DOM : LISTS.EMILIJA
              )
            }
          >
            <HStack
              h={hp(4)}
              alignItems="center"
              justifyContent="space-between"
            >
              <Text>{`Move to ${
                list === LISTS.EMILIJA ? "Dom's" : "Emilija's"
              } list`}</Text>

              <Icon
                ml={5}
                size="sm"
                as={<Ionicons name="chevron-forward" />}
                color="primary.500"
              />
            </HStack>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() =>
              moveLists(
                index,
                list,
                list === LISTS.COMMON ? LISTS.DOM : LISTS.COMMON
              )
            }
          >
            <HStack
              h={hp(4)}
              alignItems="center"
              justifyContent="space-between"
            >
              <Text>{`Move to ${
                list === LISTS.COMMON ? "Dom's" : "Common"
              } list`}</Text>
              <Icon
                ml={5}
                size="sm"
                as={<Ionicons name="chevron-forward" />}
                color="primary.500"
              />
            </HStack>
          </TouchableOpacity>
          {item.name.includes(" x ") && (
            <>
              <Divider />
              <TouchableOpacity onPress={() => splitItems(item, index, list)}>
                <HStack
                  h={hp(4)}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text>Split item up</Text>
                  <Icon
                    ml={5}
                    size="sm"
                    as={<Ionicons name="chevron-forward" />}
                    color="primary.500"
                  />
                </HStack>
              </TouchableOpacity>
            </>
          )}
        </Popover.Body>
      </Popover.Content>
    </Popover>
  );

  const ItemList = ({ list }) => {
    if (list === LISTS.EMILIJA && !emilija.length) return null;
    if (list === LISTS.DOM && !dom.length) return null;
    if (list === LISTS.COMMON && !common.length) return null;
    const total = (arr) =>
      arr
        .reduce(
          (a, c) => a + parseFloat(c.price) + parseFloat(c.discount ?? 0),
          0
        )
        .toFixed(2);
    return (
      <Box
        h={maxListHeightPercent}
        mx={15}
        borderWidth={2}
        borderRadius={15}
        alignItems="center"
        justifyContent="center"
        _light={{
          bg: "backgroundLight.maind",
          borderColor: "backgroundLight.dark",
        }}
        _dark={{ bg: "background.mainl", borderColor: "primary.500" }}
      >
        <Box h={headerAndFooterHeight} justifyContent="center">
          <Text fontSize="xl">
            {list === LISTS.COMMON
              ? "All items"
              : list === LISTS.EMILIJA
              ? "Emilija's items"
              : "Dom's items"}
          </Text>
        </Box>
        <Box h={maxListHeightPercent - 2 * headerAndFooterHeight}>
          <FlatList
            contentContainerStyle={{
              borderRadius: 15,
            }}
            showsVerticalScrollIndicator={false}
            data={
              list === LISTS.EMILIJA
                ? emilija
                : list === LISTS.DOM
                ? dom
                : common
            }
            extraData={
              list === LISTS.EMILIJA
                ? eExtraData
                : list === LISTS.DOM
                ? dExtraData
                : cExtraData
            }
            keyExtractor={(item, index) => item.name + item.price + index}
            renderItem={({ item, index }) => renderItem({ item, index, list })}
          />
        </Box>
        <Divider />
        <Box
          h={headerAndFooterHeight}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          w={wp(50)}
        >
          <Text fontSize="lg">
            {list === LISTS.COMMON
              ? "Total price:"
              : list === LISTS.DOM
              ? "Dom's total:"
              : "Emilija's total"}
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            _dark={{ color: "primary.400" }}
            _light={{ color: "primary.500" }}
          >
            £
            {list === LISTS.COMMON
              ? total(common)
              : list === LISTS.EMILIJA
              ? total(emilija)
              : total(dom)}
          </Text>
        </Box>
      </Box>
    );
  };

  async function calculateTotals() {
    const splitRatio = await AsyncStorage.getItem("splitRatio");
    const domShare = !splitRatio ? 0.6 : parseFloat(splitRatio) / 100;
    const emShare = 1 - domShare;
    let totals = { both: 0, em: 0, dom: 0, full: googleResponse.total };

    totals.both += common.reduce((a, c) => a + parseFloat(c.price), 0);
    totals.dom +=
      dom.reduce((a, c) => a + parseFloat(c.price), 0) + totals.both * domShare;
    totals.em +=
      emilija.reduce((a, c) => a + parseFloat(c.price), 0) +
      totals.both * emShare;

    return totals;
  }

  function updateFirestoreDoc(totals) {
    firebase
      .firestore()
      .collection("bills")
      .doc(firestorePath)
      .set(
        {
          emilija,
          dom,
          common,
          totals,
        },
        { merge: true }
      )
      .then(() => console.log(`${firestorePath} updated with the lists`))
      .catch(console.error);
  }

  async function handleSplitting(next) {
    const totals = await calculateTotals();
    updateFirestoreDoc(totals);
    setTimeout(() => {
      next();
      navigation.navigate("BillCalculator", { totals });
    }, 1000);
  }

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} pt={10} alignItems="center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ItemList list={LISTS.COMMON} />
          <ItemList list={LISTS.EMILIJA} />
          <ItemList list={LISTS.DOM} />
        </ScrollView>
        <Box mb={10}>
          <AwesomeButton
            progress
            progressLoadingTime={1000}
            onPress={async (next) => await handleSplitting(next)}
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
            <Ionicons
              name="calculator"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text _dark={{ color: "primary.400" }} ml={2}>
              Split it!
            </Text>
          </AwesomeButton>
        </Box>
      </Box>
    </>
  );
}

function BillCalculator({
  navigation,
  route: {
    params: { totals },
  },
}) {
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "white" }}
          />
        </TouchableOpacity>
        <Box alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Total: £{totals.full.toFixed(2)}
          </Text>
          <Text fontSize="sm" color="gray.400">
            Split 60/40
          </Text>
        </Box>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.maiin" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const Total = ({ name }) => (
    <Box
      borderRadius={hp(5)}
      borderWidth={2}
      borderColor="primary.500"
      _light={{ borderColor: "backgroundLight.dark" }}
      _dark={{ borderColor: "primary.500" }}
      justifyContent="center"
      alignItems="center"
      h={hp(10)}
      w={wp(70)}
      my={5}
    >
      <Box
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        w={wp(60)}
      >
        <Text fontSize="2xl">
          {name === "dom"
            ? "Dom's total: "
            : name === "em"
            ? "Emilija's total: "
            : "Total"}
        </Text>
        <Text
          fontSize="3xl"
          fontWeight="bold"
          _dark={{ color: "primary.400" }}
          _light={{ color: "primary.500" }}
        >
          £{totals[name].toFixed(2)}
        </Text>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar />
      <Box variant="background" flex={1} pt={10} alignItems="center">
        <Total name="dom" />
        <Total name="em" />
      </Box>
      <Box pos="absolute" mb={5} bottom={0}>
        <AwesomeButton
          onPress={() => navigation.navigate("BillScanner")}
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
    </>
  );
}

function History({ navigation }) {
  const [bills, setBills] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const LISTS = { EMILIJA: "emilija", DOM: "dom", COMMON: "common" };

  useEffect(() => {
    firebase
      .firestore()
      .collection("bills")
      .get()
      .then((querySnapshot) => {
        let arr = [];
        querySnapshot.forEach((doc) =>
          arr.push({ id: doc.id, data: doc.data() })
        );
        setBills(arr);
      });
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    setModalVisible(true);
  }, [selectedItem]);

  const renderItem = ({ item }) => (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      px={3}
      py={1}
      w={wp(60)}
      rounded="lg"
      my={1}
      _dark={{ bg: "background.lighter" }}
      _light={{ bg: "backgroundLight.darker" }}
    >
      <Text _dark={{ color: "primary.400" }}>{item.name}</Text>
      <Text _dark={{ color: "primary.500" }} _light={{ color: "primary.600" }}>
        £
        {(parseFloat(item.price) + parseFloat(item.discount ?? "0")).toFixed(2)}
      </Text>
    </Box>
  );

  const ItemList = ({ list }) => {
    if (!selectedItem || !selectedItem[list].length) return null;
    const total = (arr) =>
      arr
        .reduce(
          (a, c) => a + parseFloat(c.price) + parseFloat(c.discount ?? 0),
          0
        )
        .toFixed(2);

    const listCount =
      selectedItem.emilija?.length === 0 && selectedItem.dom?.length === 0
        ? 1
        : selectedItem.emilija?.length === 0 || selectedItem.dom?.length === 0
        ? 2
        : 3;

    const maxListHeightPercent =
      selectedItem[list].length < 2
        ? hp(14)
        : selectedItem[list].length < 3
        ? hp(17)
        : listCount === 3
        ? hp(20)
        : listCount === 2
        ? hp(30)
        : hp(60);

    const headerAndFooterHeight = 35;
    return (
      <Box
        h={maxListHeightPercent}
        my={3}
        borderWidth={2}
        borderRadius={15}
        alignItems="center"
        justifyContent="center"
        _light={{
          bg: "backgroundLight.maind",
          borderColor: "backgroundLight.dark",
        }}
        _dark={{ bg: "background.mainl", borderColor: "primary.500" }}
      >
        <Box h={headerAndFooterHeight} justifyContent="center">
          <Text fontSize="xl">
            {list === LISTS.COMMON
              ? "Common items"
              : list === LISTS.EMILIJA
              ? "Emilija's items"
              : list === LISTS.DOM
              ? "Dom's items"
              : "All items"}
          </Text>
        </Box>
        <Box h={maxListHeightPercent - 2 * headerAndFooterHeight}>
          <FlatList
            contentContainerStyle={{
              borderRadius: 15,
            }}
            showsVerticalScrollIndicator={false}
            data={
              list === LISTS.EMILIJA
                ? selectedItem.emilija
                : list === LISTS.DOM
                ? selectedItem.dom
                : list === LISTS.COMMON
                ? selectedItem.common
                : selectedItem.items
            }
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={renderItem}
          />
        </Box>
        <Divider />
        <Box
          h={headerAndFooterHeight}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          w={wp(50)}
        >
          <Text fontSize="lg">
            {list === LISTS.DOM
              ? "Dom's total:"
              : list === LISTS.EMILIJA
              ? "Emilija's total"
              : "Total price:"}
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            _dark={{ color: "primary.400" }}
            _light={{ color: "primary.500" }}
          >
            £
            {list === LISTS.COMMON
              ? total(selectedItem.common)
              : list === LISTS.EMILIJA
              ? total(selectedItem.emilija)
              : list === LISTS.DOM
              ? total(selectedItem.dom)
              : total(selectedItem.items)}
          </Text>
        </Box>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "white" }}
          />
        </TouchableOpacity>
        <Box alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            History
          </Text>
        </Box>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "backgroundLight.maiin" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  return (
    <>
      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
      >
        <Modal.Content maxWidth="400px" w={wp(80)}>
          <Modal.CloseButton />
          <Modal.Header flexDirection="row" justifyContent="center">
            {selectedItem?.market}
            {"  "}
            {selectedItem?.date}
            {"  "}
            {selectedItem?.time}
          </Modal.Header>
          <Modal.Body alignItems="center">
            {!selectedItem?.common ? (
              <ItemList list="items" />
            ) : (
              <>
                <ItemList list={LISTS.COMMON} />
                <ItemList list={LISTS.DOM} />
                <ItemList list={LISTS.EMILIJA} />
              </>
            )}
          </Modal.Body>
          <Modal.Footer />
        </Modal.Content>
      </Modal>
      <AppBar />
      <Box variant="background" safeAreaTop flex={1} alignItems="center">
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedItem(item.data)}>
              <Box
                px={9}
                py={3}
                _dark={{ bg: "background.main", borderColor: "primary.500" }}
                _light={{
                  bg: "backgroundLight.main",
                  borderColor: "backgroundLight.dark",
                }}
                borderWidth={2}
                borderRadius={25}
                my={2}
              >
                <Text _dark={{ color: "primary.500" }}>
                  {item.data.market}
                  {" – "}
                  {MONTHS[parseInt(item.data.date.substr(3, 2)) - 1]}{" "}
                  {item.data.date.substr(0, 2)}
                </Text>
              </Box>
            </Pressable>
          )}
        />
      </Box>
    </>
  );
}

export default function BillScannerNav() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="BillScanner"
      screenOptions={navigatorOptions}
    >
      <Stack.Screen name="BillScanner" component={BillScanner} />
      <Stack.Screen name="BillSplitter" component={BillSplitter} />
      <Stack.Screen name="BillCalculator" component={BillCalculator} />
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  );
}
