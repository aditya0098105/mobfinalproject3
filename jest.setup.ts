import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: ({ children, style }) => React.createElement(View, { style }, children),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Feather: ({ name = "", color, size = 16, style, ...rest }) =>
      React.createElement(
        Text,
        {
          ...rest,
          style: [
            { color: color ?? "#fff", fontSize: size },
            style,
          ],
        },
        `Feather:${name}`
      ),
  };
});
