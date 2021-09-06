import React, { useState } from "react";
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

LogBox.ignoreLogs(["Setting a timer"]);

export default function BillScanner() {
  const [googleResponse, setGoogleResponse] = useState(null);
  const [analyse, setAnalyse] = useState(false);
  const [image, setImage] = useState(null);

  function handlePickedImage(pickerResult) {
    if (!pickerResult.cancelled) {
      setImage(pickerResult);
      setAnalyse(false);
    }
  }

  async function submitToGoogle() {
    try {
      const { url, path } = await uploadImage(image.uri);
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
      let data = responseJson?.responses[0]?.textAnnotations;
      /* #region  experiment */
      // let data = [
      //   "LIDL",
      //   "DUN -City Centre",
      //   "VAT NO. GB350396892",
      //   "6 x £0.22",
      //   "1.32 A",
      //   "-0.63",
      //   "0.99 A",
      //   "1.99 A",
      //   "1.99 A",
      //   "0.75 A",
      //   "0.92 A",
      //   "0.49 A",
      //   "1.18 A",
      //   "1.39 A",
      //   "0.90 A",
      //   "0.89 A",
      //   "4.38 A",
      //   "3.49 A",
      //   "0.45 A",
      //   "2.69 A",
      //   "1.50 A",
      //   "1.05 A",
      //   "2.49 A",
      //   "1.29 B",
      //   "1.79 B",
      //   "0.90 B",
      //   "0.59 A",
      //   "0.36 A",
      //   "0.43 A",
      //   "1.09 A",
      //   "0.95 A",
      //   "0.69 A",
      //   "0.95 A",
      //   "0.82 A",
      //   "0.71 A",
      //   "0.69 A",
      //   "2.18 B",
      //   "Loose Kiwi",
      //   "Kiwi MB",
      //   "Froz Pizza Hawaif",
      //   "Peach&PassionfrYog",
      //   "Vanilla Yoghurt",
      //   "Fat Free Vanilla Yog",
      //   "Peri Sauce LemonHerb",
      //   "Pasta Sauce Bolog",
      //   "15 Eggs Min. Weight",
      //   "Crunchy Granola",
      //   "Salted Tortilla Chip2 x £0.45",
      //   "Sweet Potatoes 1kg",
      //   "Sco Beef Mince 15% 2 x £2.19",
      //   "Lemon&Parsley Salmon",
      //   "Soy Sauce Dark",
      //   "Pork Steaks Chinese",
      //   "Seafood Sticks",
      //   "Frankfurters",
      //   "Mild Grated Cheddar",
      //   "ChewingGum White Ice",
      //   "Classic Ice Almond",
      //   "Milk Chocolate 2 x £0.45",
      //   "La Doria Sweetcorn",
      //   "Medium Loaf White",
      //   "Cucumber",
      //   "Medium Oranges",
      //   "Croissants 8er",
      //   "Bananas 5 Pack",
      //   "Peaches",
      //   "Peppers Mixed",
      //   "Tomatoes",
      //   "Pineapple",
      //   "Sweet&Salty Popcorn 2 x £1.09",
      //   "2 x £0.75",
      //   "TOTAL",
      //   "CARD",
      //   "41.67",
      //   "41.67",
      //   "*CUSTOMER COPY* - PLEASE RETAIN RECEIPT",
      //   "Date: 29/08/21",
      //   "MTD: ***16877",
      //   "Time: 14:28:50",
      //   "3.",
      //   "",
      // ];

      // data = data.filter(
      //   (s) =>
      //     !(
      //       s === "" ||
      //       s.includes("LIDL") ||
      //       s.includes("DUN") ||
      //       s.includes("VAT") ||
      //       // s.includes(" x ") ||
      //       s.includes("CUSTOMER") ||
      //       s.includes("Time:") ||
      //       s.includes("Date:") ||
      //       s.includes("MTD")
      //     )
      // );
      /* #endregion */

      try {
        console.log("\n");
        console.log(parseResponse(data)); // Currently catching onto "0.95 A"
        console.log("\n");
      } catch (error) {
        console.warn(error);
      }
      setGoogleResponse(data[0].description);
    } catch (error) {
      console.warn(error);
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
        contentContainerStyle={{ alignItems: "center", paddingBottom: hp(7) }}
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
        {analyse && (
          <AwesomeButton
            progress
            progressLoadingTime={3500}
            onPress={async (next) => {
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
              {googleResponse ? "Analyse again" : "Analyse"}
            </Text>
          </AwesomeButton>
        )}
        {googleResponse && (
          <Text mt={3}>
            {Object.keys(googleResponse).length === 0
              ? "No text found"
              : googleResponse}
          </Text>
        )}
      </ScrollView>
    </Box>
  );
}
