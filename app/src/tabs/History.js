import React from "react";
import { Box, Text } from "native-base";
import { theme } from "../config/theme";

export default function History() {
  return (
    <Box
      flex={1}
      bg={theme.colors.background.main}
      justifyContent="center"
      alignItems="center"
    >
      <Text size="lg">History</Text>
    </Box>
  );
}
