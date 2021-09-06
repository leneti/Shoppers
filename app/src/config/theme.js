import { extendTheme, themeTools } from "native-base";
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
      darker: "#282626",
      lighter: "#595959",
    },
  },
  components: {
    Text: {
      baseStyle: (props) => {
        return {
          color: themeTools.mode("primary.600", "white")(props),
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
    initialColorMode: "dark",
  },
});
