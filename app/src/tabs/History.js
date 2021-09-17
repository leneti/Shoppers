import React, { useEffect, useState } from "react";
import { Box, FlatList, Text, Pressable, Modal, Divider } from "native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { theme } from "../config/theme";
import firebase from "firebase";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["VirtualizedLists"]);

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

export default function History() {
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
    if (!selectedItem || (!!selectedItem && !selectedItem[list].length))
      return null;
    const total = (arr) =>
      arr
        .reduce(
          (a, c) => a + parseFloat(c.price) + parseFloat(c.discount ?? 0),
          0
        )
        .toFixed(2);

    const maxListHeightPercent =
      selectedItem[list].length < 2
        ? hp(14)
        : selectedItem[list].length < 3
        ? hp(17)
        : hp(20);
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
            <Box>
              {!selectedItem?.common ? (
                <ItemList list="items" />
              ) : (
                <>
                  <ItemList list={LISTS.COMMON} />
                  <ItemList list={LISTS.DOM} />
                  <ItemList list={LISTS.EMILIJA} />
                </>
              )}
            </Box>
          </Modal.Body>
          <Modal.Footer />
        </Modal.Content>
      </Modal>
      <Box
        safeAreaTop
        flex={1}
        _light={{ bg: "backgroundLight.main" }}
        _dark={{ bg: "background.main" }}
        alignItems="center"
      >
        <Text fontSize="2xl" fontWeight="bold" py={3}>
          History
        </Text>
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
