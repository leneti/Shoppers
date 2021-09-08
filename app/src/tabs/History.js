import React, { useEffect, useState } from "react";
import { Box, FlatList, Text } from "native-base";
import { theme } from "../config/theme";
import firebase from "firebase";

export default function History() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const db = firebase.firestore();
    db.collection("bills")
      .get()
      .then((querySnapshot) => {
        let arr = [];
        querySnapshot.forEach((doc) =>
          arr.push({ id: doc.id, data: doc.data() })
        );
        setBills(arr);
      });
  }, []);

  return (
    <Box safeAreaTop pt={10} flex={1} bg="background.main" alignItems="center">
      <Text size="lg">History</Text>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Box
            px={6}
            py={3}
            borderColor="primary.500"
            borderWidth={2}
            borderRadius={10}
            my={2}
            bg="background.main"
          >
            <Text color={theme.colors.primary[500]}>{item.id}</Text>
          </Box>
        )}
      />
    </Box>
  );
}
