import { extendTheme, themeTools } from "native-base";
import { Animated, Dimensions } from "react-native";
import "intl";
import "intl/locale-data/jsonp/en-GB";

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
      50: "#ffe4f6",
      100: "#fcb6dd",
      200: "#f787c5",
      300: "#f358ad",
      400: "#ef2c96",
      500: "#d6167c",
      600: "#a70f61",
      700: "#780845",
      800: "#490229",
      900: "#1d0010",
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
    },
  },
  components: {
    Text: {
      baseStyle: (props) => {
        return {
          color: themeTools.mode("backgroundLight.dark", "white")(props),
          fontFamily: "body",
        };
      },
      defaultProps: { fontSize: "md" },
      fontSizes: {
        "2xs": 8.5 / Dimensions.get("screen").fontScale,
        xs: 10.2 / Dimensions.get("screen").fontScale,
        sm: 11.9 / Dimensions.get("screen").fontScale,
        md: 13.6 / Dimensions.get("screen").fontScale,
        lg: 15.3 / Dimensions.get("screen").fontScale,
        xl: 17 / Dimensions.get("screen").fontScale,
        "2xl": 20.4 / Dimensions.get("screen").fontScale,
        "3xl": 25.5 / Dimensions.get("screen").fontScale,
        "4xl": 30.6 / Dimensions.get("screen").fontScale,
        "5xl": 40.8 / Dimensions.get("screen").fontScale,
        "6xl": 51 / Dimensions.get("screen").fontScale,
        "7xl": 61.2 / Dimensions.get("screen").fontScale,
        "8xl": 81.6 / Dimensions.get("screen").fontScale,
        "9xl": 108.8 / Dimensions.get("screen").fontScale,
      },
    },
    Box: {
      variants: {
        background: ({ colorMode }) => {
          return {
            bg:
              colorMode === "dark" ? "background.main" : "backgroundLight.main",
          };
        },
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
  fontConfig: {
    Roboto: {
      100: {
        normal: "Roboto_100Thin",
        italic: "Roboto_100Thin_Italic",
      },
      200: {
        normal: "Roboto_100Thin",
        italic: "Roboto_100Thin_Italic",
      },
      300: {
        normal: "Roboto_300Light",
        italic: "Roboto_300Light_Italic",
      },
      400: {
        normal: "Roboto_400Regular",
        italic: "Roboto_400Regular_Italic",
      },
      500: {
        normal: "Roboto_500Medium",
        italic: "Roboto_500Medium_Italic",
      },
      600: {
        normal: "Roboto_700Bold",
        italic: "Roboto_700Bold_Italic",
      },
      700: {
        normal: "Roboto_700Bold",
        italic: "Roboto_700Bold_Italic",
      },
      800: {
        normal: "Roboto_900Black",
        italic: "Roboto_900Black_Italic",
      },
      900: {
        normal: "Roboto_900Black",
        italic: "Roboto_900Black_Italic",
      },
    },
  },
  fonts: {
    heading: "Roboto",
    body: "Roboto",
    mono: "Roboto",
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
  presentation: "transparentModal",
};
export const currencyFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
});
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTH_TRUNC = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "June",
  July: "July",
  August: "Aug",
  September: "Sept",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};
export const CATEGORIES = [
  { name: "Bills", image: require(`../../res/icons/048-bill.png`) },
  {
    name: "Entertainment",
    image: require(`../../res/icons/062-laptop.png`),
  },
  {
    name: "Shopping",
    image: require(`../../res/icons/033-shopping-bags.png`),
  },
  { name: "Investing", image: require(`../../res/icons/049-trend.png`) },
  {
    name: "Rainy Day Savings",
    image: require(`../../res/icons/051-insurance.png`),
  },
  {
    name: "Gifts&Donations",
    image: require(`../../res/icons/018-present-1.png`),
  },
  { name: "Savings", image: require(`../../res/icons/060-wallet.png`) },
  {
    name: "Commuting",
    image: require(`../../res/icons/058-autonomous-car.png`),
  },
  {
    name: "Services",
    image: require(`../../res/icons/061-idea.png`),
  },
  {
    name: "Other",
    image: require(`../../res/icons/052-money-1.png`),
  },
];
export const FREQUENCIES = {
  Weekly: "Weekly",
  Monthly: "Monthly",
  Quarterly: "Quarterly",
  Annually: "Annually",
};
export const TEST = {
  TestTransactions: false,
  NordigenSandbox: false,
  DeleteAllButton: false,
  TestBill: false,
  AlwaysShowIntro: false,
};
