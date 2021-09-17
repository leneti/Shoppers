import React from "react";
import { Box, Text, Icon } from "native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

export const AppIcon = (props) => {
  return (
    <Box
      h={wp(40)}
      w={wp(40)}
      borderRadius={wp(20)}
      borderWidth={7}
      _dark={{ borderColor: "primary.100" }}
      _light={{ borderColor: "background.main" }}
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      <Box
        h={wp(37)}
        w={wp(37)}
        borderRadius={wp(18.5)}
        borderWidth={7}
        borderColor="primary.500"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Box mb={-1} ml={-3} justifyContent="center" alignItems="center">
          <Box ml={5} mb={-9} flexDirection="row">
            <Box
              h={wp(8)}
              w={wp(8)}
              borderRadius={wp(4)}
              borderWidth={5}
              borderColor="primary.500"
              bg="primary.300"
              justifyContent="center"
              alignItems="center"
              mr={-5}
              mt={4}
              zIndex={1}
            >
              <Text fontSize="3xl" fontWeight="bold" color="primary.500">
                £
              </Text>
            </Box>
            <Box>
              <Box
                h={hp(1)}
                w={wp(10)}
                borderRadius={hp(0.5)}
                bg="primary.500"
              />
              <Box
                h={hp(1)}
                w={wp(10)}
                borderRadius={hp(0.5)}
                bg="primary.300"
              />
              <Box
                h={hp(1)}
                w={wp(10)}
                borderRadius={hp(0.5)}
                bg="primary.500"
              />
              <Box
                h={hp(1)}
                w={wp(10)}
                borderRadius={hp(0.5)}
                bg="primary.300"
              />
              <Box
                h={hp(1)}
                w={wp(10)}
                borderRadius={hp(0.5)}
                bg="primary.500"
              />
            </Box>
          </Box>
          <Icon
            as={<Ionicons name="cart" />}
            size="5xl"
            _dark={{ color: "primary.100" }}
            _light={{ color: "background.main" }}
            zIndex={2}
          />
        </Box>
      </Box>
    </Box>
  );
};
