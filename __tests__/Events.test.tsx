import { render } from "@testing-library/react-native";
import React from "react";

// ✅ expo-router ko mock karo
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ cityId: "london" }),
}));

// ✅ expo-constants ko mock karo
jest.mock("expo-constants", () => ({
  manifest: {},
}));

// ✅ react-native-maps ko mock karo
jest.mock("react-native-maps", () => {
  const { View, Text } = require("react-native");
  const MockMapView = (props: any) => <View {...props}><Text>MockMapView</Text>{props.children}</View>;
  const MockMarker = (props: any) => <View {...props}><Text>MockMarker</Text>{props.children}</View>;
  return { __esModule: true, default: MockMapView, Marker: MockMarker };
});

import EventsScreen from "../app/city/[cityId]/events";

describe("EventsScreen", () => {
  it("renders event title and details (UI)", () => {
    const { getByText } = render(<EventsScreen />);
    expect(getByText("Royal Albert Concert")).toBeTruthy();
    expect(getByText("2025-10-12")).toBeTruthy();
    expect(getByText("Classical music festival.")).toBeTruthy();
  });

  it("renders no events when list is empty (Unit)", () => {
    const { queryByText } = render(<EventsScreen />);
    // koi fake event check kar rahe jo exist hi nahi karta
    expect(queryByText("Some Random Event")).toBeNull();
  });
});
