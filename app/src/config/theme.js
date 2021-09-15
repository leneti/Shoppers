import { extendTheme, themeTools } from "native-base";
import { Animated } from "react-native";
export const theme = extendTheme({
  colors: {
    primary: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    secondary: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
    },
    background: {
      main: "#404040",
      mainl: "#4a4a4a",
      maind: "#363636",
      darker: "#262626",
      lighter: "#595959",
    },
    backgroundLight: {
      main: "#F6F6F6",
      mainl: "#FFF",
      maind: "#ECECEC",
      darker: "#DCDCDC",
      lighter: "#FFF",
      dark: "#6F6F6F",
      orange: "#F96501",
    },
  },
  components: {
    Text: {
      baseStyle: (props) => {
        return {
          color: themeTools.mode("backgroundLight.dark", "white")(props),
        };
      },
      defaultProps: { size: "md" },
      sizes: {
        "3xl": { fontSize: "48px" },
        "2xl": { fontSize: "40px" },
        xl: { fontSize: "32px" },
        lg: { fontSize: "24px" },
        md: { fontSize: "16px" },
        sm: { fontSize: "12px" },
      },
    },
    Button: {
      baseStyle: () => {
        return {
          borderRadius: 25,
          _text: {
            color: "white",
          },
        };
      },
    },
  },
  config: {
    // initialColorMode: "light",
    // useSystemColorMode: true,
  },
});
export const navigatorOptions = {
  header: () => null,
  cardStyle: { backgroundColor: "transparent" },
  cardStyleInterpolator: ({ current, next, inverted, layouts: { screen } }) => {
    const progress = Animated.add(
      current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
      next
        ? next.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
          })
        : 0
    );

    return {
      cardStyle: {
        transform: [
          {
            translateX: Animated.multiply(
              progress.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [screen.width, 0, screen.width * -0.3],
                extrapolate: "clamp",
              }),
              inverted
            ),
          },
        ],
      },
    };
  },
};
