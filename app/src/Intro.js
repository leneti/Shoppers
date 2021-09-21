import React from "react";
import { StyleSheet } from "react-native";
import { Box, Text } from "native-base";
import AppIntro from "rn-falcon-app-intro";
import { theme } from "./config/constants";

export default function Intro(props) {
  return (
    <AppIntro>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[400] }]}
      >
        <Box level={10} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
        <Box level={15} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
        <Box level={8} bg="transparent">
          <Text style={styles.text}>Page 1</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[200] }]}
      >
        <Box level={-10} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
        <Box level={5} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
        <Box level={20} bg="transparent">
          <Text style={styles.text}>Page 2</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[700] }]}
      >
        <Box level={8} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
        <Box level={0} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
        <Box level={-10} bg="transparent">
          <Text style={styles.text}>Page 3</Text>
        </Box>
      </Box>
      <Box
        style={[styles.slide, { backgroundColor: theme.colors.primary[500] }]}
      >
        <Box level={5} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
        <Box level={10} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
        <Box level={15} bg="transparent">
          <Text style={styles.text}>Page 4</Text>
        </Box>
      </Box>
    </AppIntro>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
    padding: 15,
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});
