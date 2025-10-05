import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import TransportScreen from "../app/city/[cityId]/transport";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ cityId: "london" }),
}));

jest.spyOn(Linking, "openURL").mockResolvedValueOnce(true as any);

describe("TransportScreen", () => {
  it("shows heading with city name", () => {
    const { getByText } = render(<TransportScreen />);
    expect(getByText("🚍 Transportation in\nLondon")).toBeTruthy();
  });

  it("lists transport modes for the city", () => {
    const { getByText } = render(<TransportScreen />);
    expect(getByText("Underground (Tube)")).toBeTruthy();
    expect(getByText("Buses")).toBeTruthy();
    expect(getByText("Overground")).toBeTruthy();
    expect(getByText("Trams")).toBeTruthy();
  });

  it("opens the official info link when tapped", () => {
    const { getByText } = render(<TransportScreen />);
    fireEvent.press(getByText("🌐 More info on\nLondon\n transport"));
    expect(Linking.openURL).toHaveBeenCalled();
  });
});
