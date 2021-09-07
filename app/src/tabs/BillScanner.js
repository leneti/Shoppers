import React, { useEffect, useState } from "react";
import { Text, Box, Image } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { theme } from "../config/theme";
import { takePicture, pickImage } from "../components/ImagePicker";
import { uploadImage } from "../components/ImageUpload";
import { LogBox, ScrollView } from "react-native";
import { GOOGLE_CLOUD_VISION_API_KEY } from "../config/secret";
import { parseResponse } from "../components/VisionParser";
import firebase from "firebase";

LogBox.ignoreLogs(["Setting a timer"]);

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

export default function BillScanner() {
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
    (async function uploadToFirestore() {
      try {
        await firebase
          .firestore()
          .collection("bills")
          .doc(pathToSave)
          .set(googleResponse);
        console.log(`${pathToSave} saved to Firestore`);
        setPathToSave(null);
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
      _dark={{ bg: theme.colors.background.main }}
      flex={1}
      safeAreaTop
      pt={10}
      alignItems="center"
    >
      <Box
        alignItems="center"
        w={googleResponse ? wp(85) : wp(75)}
        p={googleResponse ? 2 : 7}
        borderRadius={20}
        borderWidth={googleResponse ? 0 : 2}
        borderColor={theme.colors.primary[600]}
        position={googleResponse ? "absolute" : "relative"}
        bottom={googleResponse ? 0 : undefined}
        bg={theme.colors.background.main}
        zIndex={100}
      >
        {!googleResponse && (
          <Text numberOfLines={2} textAlign="center" size="lg" mb={5}>
            Select how you would like to analyse the bill:
          </Text>
        )}
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
      >
        {image && (
          <Image
            source={{ uri: image?.uri }}
            alt="Image to analyse text from"
            w={wp(75)}
            h={(image?.height * wp(75)) / image?.width}
            mt={10}
            borderRadius={20}
            borderWidth={2}
            borderColor={theme.colors.primary[600]}
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
              <Text color={theme.colors.primary[400]} ml={2}>
                Analyse
              </Text>
            </AwesomeButton>
            <Text>{progressText}</Text>
          </>
        )}
        {googleResponse && (
          <Box
            borderRadius={15}
            borderColor={theme.colors.primary[500]}
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
        )}
      </ScrollView>
    </Box>
  );
}
