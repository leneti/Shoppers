import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { navigatorOptions, theme } from "../config/theme";
import { takePicture, pickImage } from "../components/ImagePicker";
import { uploadImage } from "../components/ImageUpload";
import { LogBox, ScrollView, TouchableOpacity } from "react-native";
import { GOOGLE_CLOUD_VISION_API_KEY } from "../config/secret";
import { parseResponse } from "../components/VisionParser";
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
} from "native-base";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const TESTMODE = true;

LogBox.ignoreLogs(["Setting a timer"]);

function BillScanner({ navigation }) {
  const [googleResponse, setGoogleResponse] = useState(null);
  const [analyse, setAnalyse] = useState(false);
  const [image, setImage] = useState(null);
  const [progressText, setProgressText] = useState("");
  const [pathToSave, setPathToSave] = useState(null);
  const [savedUrlAndPath, setSavedUrlAndPath] = useState(null);

  function handlePickedImage(pickerResult) {
    if (!pickerResult.cancelled) {
      setImage(pickerResult);
      setAnalyse(false);
      setGoogleResponse(null);
      setPathToSave(null);
      setSavedUrlAndPath(null);
    }
  }

  useEffect(() => {
    if (!pathToSave) return;
    if (TESTMODE) {
      navigation.navigate("BillSplitter", { googleResponse });
      setTimeout(() => {
        setImage(null);
        setAnalyse(false);
        setPathToSave(null);
        setSavedUrlAndPath(null);
        setGoogleResponse(null);
      }, 1000);
      return;
    }

    (async function uploadToFirestore() {
      try {
        await firebase
          .firestore()
          .collection("bills")
          .doc(pathToSave)
          .set({
            ...googleResponse,
            total: googleResponse.items.reduce(
              (a, c) => a + parseFloat(c.price),
              0
            ),
          });
        console.log(`${pathToSave} saved to Firestore`);
        navigation.navigate("BillSplitter", { googleResponse });
        // setPathToSave(null);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    })();
  }, [pathToSave]);

  useEffect(() => {
    if (!googleResponse) return;
    if (!googleResponse.date || !googleResponse.time || !googleResponse.market)
      return;
    const newPath = `${googleResponse.market}--${
      MONTHS[parseInt(googleResponse.date.substr(3, 2)) - 1]
    }-${googleResponse.date.substr(0, 2)}--${googleResponse.time.substr(0, 5)}`;
    setPathToSave(newPath);
  }, [googleResponse]);

  async function submitToGoogle() {
    try {
      const testResponse = {
        date: "18/08/21",
        items: [
          {
            name: "Froz Pizza Hawaii",
            price: "0.99",
          },
          {
            name: "Froz Margherit Pizza",
            price: "0.99",
          },
          {
            name: "Milk Chocolate 2 x £0.45",
            price: "0.90",
          },
          {
            name: "Vanilla Yoghurt",
            price: "1.99",
          },
          {
            name: "Cornichons Classic",
            price: "0.72",
          },
          {
            name: "Mild Grated Cheddar",
            price: "2.49",
          },
          {
            name: "Diced ChickBrea 400g",
            price: "2.35",
          },
          {
            name: "Peaches",
            price: "0.95",
          },
          {
            name: "Italian Mozzarella 2 x £0.45",
            price: "0.90",
          },
          {
            name: "Sweet Popcorn",
            price: "1.09",
          },
          {
            name: "Scotch Beef Mince10%",
            price: "2.29",
          },
          {
            name: "Bananas 5 Pack",
            price: "0.69",
          },
          {
            name: "Lasagne Sheets",
            price: "0.39",
          },
          {
            name: "Italian Passata",
            price: "0.32",
          },
          {
            name: "Simply Penne",
            price: "0.29",
          },
          {
            name: "Tomatoes",
            price: "0.71",
          },
          {
            name: "Cucumber",
            price: "0.43",
          },
          {
            name: "Tomato Puree",
            price: "0.27",
          },
          {
            name: "10 Large Eggs",
            price: "1.09",
          },
        ],
        market: "LIDL",
        time: "19:10:39",
      };
      setGoogleResponse(testResponse);
      return;

      const { url, path } = googleResponse
        ? savedUrlAndPath
        : await uploadImage(image.uri);
      if (!googleResponse) setSavedUrlAndPath({ url, path });
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
    } catch (error) {
      console.warn(error);
    } finally {
      setProgressText("");
    }
  }

  return (
    <Box
      _light={{ bg: "white" }}
      _dark={{ bg: "background.main" }}
      flex={1}
      safeAreaTop
      pt={10}
      alignItems="center"
    >
      <Box
        alignItems="center"
        w={wp(75)}
        p={7}
        borderRadius={20}
        borderWidth={2}
        borderColor="primary.600"
        bg="background.main"
        zIndex={100}
      >
        <Text numberOfLines={2} textAlign="center" size="lg" mb={5}>
          Select how you would like to analyse the bill:
        </Text>
        <Box justifyContent="space-between" flexDirection="row" width="100%">
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
            borderColor={theme.colors.primary[500]}
            backgroundColor={theme.colors.background.main}
            backgroundDarker={theme.colors.background.darker}
            raiseLevel={3}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text color={theme.colors.primary[400]} ml={2}>
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
            borderColor={theme.colors.primary[500]}
            backgroundColor={theme.colors.background.main}
            backgroundDarker={theme.colors.background.darker}
            raiseLevel={3}
          >
            <Ionicons
              name="images-outline"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text color={theme.colors.primary[400]} ml={2}>
              Pick
            </Text>
          </AwesomeButton>
        </Box>
      </Box>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: hp(7.5) }}
        showsVerticalScrollIndicator={false}
      >
        {image && (
          <Image
            source={{ uri: image.uri }}
            alt="Image to analyse text from"
            w={wp(75)}
            h={(image.height * wp(75)) / image.width}
            mt={10}
            borderRadius={20}
            borderWidth={2}
            borderColor="primary.600"
            onLoad={() => setAnalyse(true)}
          />
        )}
        {analyse && !googleResponse && (
          <>
            <AwesomeButton
              progress
              progressLoadingTime={5000}
              onPress={async (next) => {
                setProgressText("Uploading image to Firebase...");
                await submitToGoogle();
                next();
              }}
              width={googleResponse ? wp(30) : wp(25)}
              height={50}
              borderRadius={25}
              borderWidth={1}
              borderColor={theme.colors.primary[500]}
              backgroundColor={theme.colors.background.main}
              backgroundDarker={theme.colors.background.main}
              raiseLevel={3}
              style={{ marginTop: 20 }}
            >
              <Ionicons
                name="analytics"
                size={24}
                color={theme.colors.primary[500]}
              />
              <Text color="primary.400" ml={2}>
                Analyse
              </Text>
            </AwesomeButton>
            <Text>{progressText}</Text>
          </>
        )}
      </ScrollView>
    </Box>
  );
}

function BillSplitter({
  route: {
    params: { googleResponse },
  },
  navigation,
}) {
  const [commonSet, setCommonSet] = useState(googleResponse.items);
  const [emilija, setEmilija] = useState([]);
  const [dom, setDom] = useState([]);

  function AppBar() {
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        safeAreaTop
        _light={{ bg: "white" }}
        _dark={{ bg: "background.main" }}
        px={3}
        pt={3}
      >
        <TouchableOpacity onPress={() => navigation.navigate("BillScanner")}>
          <Icon
            size="lg"
            as={<Ionicons name="chevron-back" />}
            _light={{ color: "primary.600" }}
            _dark={{ color: "white" }}
          />
        </TouchableOpacity>
        <Text fontSize="2xl" fontWeight="bold">
          Split the bill
        </Text>
        <Icon
          size="lg"
          as={<Ionicons name="chevron-back" />}
          _light={{ color: "white" }}
          _dark={{ color: "background.main" }}
        />
      </HStack>
    );
  }

  const OldList = () => (
    <Box
      borderRadius={15}
      borderColor="primary.500"
      borderWidth={2}
      mt={3}
      alignItems="center"
      py={15}
    >
      <Box mb={5}>
        <Text>Date: {googleResponse.date}</Text>
        <Text>Time: {googleResponse.time}</Text>
        <Text>Market: {googleResponse.market}</Text>
      </Box>
      {googleResponse.items.map((item, key) => (
        <Box
          key={key}
          w={wp(75)}
          px={15}
          justifyContent="space-between"
          flexDirection="row"
        >
          <Text>{item.name}</Text>
          <Text>£{item.price}</Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <AppBar />
      <Box
        _light={{ bg: "white" }}
        _dark={{ bg: "background.main" }}
        flex={1}
        pt={10}
        alignItems="center"
      >
        {/* <OldList/> */}
        <ScrollView horizontal>
          <Box
            h={hp(50)}
            mx={15}
            borderColor="primary.500"
            borderWidth={2}
            borderRadius={15}
            p={5}
          >
            <FlatList
              data={commonSet}
              keyExtractor={(item) => item.name + item.price}
              renderItem={({ item }) => (
                <Popover
                  placement="top right"
                  crossOffset={50}
                  trigger={(triggerProps) => (
                    <Pressable
                      {...triggerProps}
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      px={5}
                      py={2}
                      h={hp(6)}
                      w={wp(60)}
                      rounded="lg"
                      my={2}
                      bg="background.lighter"
                    >
                      <Text color="primary.400">{item.name}</Text>
                      <Text color="primary.500">£{item.price}</Text>
                    </Pressable>
                  )}
                >
                  <Popover.Content>
                    <Popover.Arrow />
                    <Popover.CloseButton />
                    <Popover.Header>
                      <Text fontSize="sm">Options</Text>
                    </Popover.Header>
                    <Popover.Body>
                      <HStack
                        h={hp(3)}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text>Move to Dom's list</Text>
                        <TouchableOpacity onPress={() => {}}>
                          <Icon
                            ml={5}
                            size="sm"
                            as={<Ionicons name="chevron-forward" />}
                            color="primary.500"
                          />
                        </TouchableOpacity>
                      </HStack>
                      <Divider />
                      <HStack
                        h={hp(3)}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text>Move to Emilija's list</Text>
                        <TouchableOpacity onPress={() => {}}>
                          <Icon
                            ml={5}
                            size="sm"
                            as={<Ionicons name="chevron-forward" />}
                            color="primary.500"
                          />
                        </TouchableOpacity>
                      </HStack>
                    </Popover.Body>
                  </Popover.Content>
                </Popover>
              )}
            />
          </Box>
        </ScrollView>
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
    </Stack.Navigator>
  );
}
