import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { Button } from "../components/ui";

describe("Button", () => {
  it("invokes the onPress handler", () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button title="Continue" onPress={onPress} />);

    fireEvent.press(getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports the outline variant styles", () => {
    const { getByRole } = render(<Button title="Outline" onPress={() => {}} variant="outline" />);

    expect(getByRole("button")).toHaveStyle({ backgroundColor: "transparent", borderWidth: 1 });
  });

  it("renders optional right accessories", () => {
    const { getByText } = render(
      <Button title="Details" onPress={() => {}} right={<Text>→</Text>} compact />
    );

    expect(getByText("→")).toBeTruthy();
    expect(getByText("Details")).toBeTruthy();
  });
});
