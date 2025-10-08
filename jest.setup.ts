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

  const ICON_LABELS: Record<string, string> = {
    calendar: "📅",
    "calendar-clear": "🗓",
    "calendar-outline": "🗓",
    "trash-outline": "🗑",
    "create-outline": "✏️",
    "bed-outline": "🛏",
    "map": "🗺",
    "sun": "☀️",
  };

  const createIcon = (setName: string) =>
    ({ name = "", color, size = 16, style, ...rest }: any) =>
      React.createElement(
        Text,
        {
          ...rest,
          style: [
            { color: color ?? "#fff", fontSize: size },
            style,
          ],
        },
        ICON_LABELS[name] ?? `${setName}:${name}`
      );

  return {
    Feather: createIcon("Feather"),
    Ionicons: createIcon("Ionicons"),
  };
});
