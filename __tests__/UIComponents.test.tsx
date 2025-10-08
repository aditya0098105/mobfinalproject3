import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { Card, Divider, H1, H2, P, Pill, SectionTitle } from "../components/ui";

describe("UI primitives", () => {
  it("renders typography components", () => {
    const { getByText } = render(
      <>
        <H1>Discover</H1>
        <H2>Highlights</H2>
        <P>Hidden gems</P>
      </>
    );

    expect(getByText("Discover")).toBeTruthy();
    expect(getByText("Highlights")).toBeTruthy();
    expect(getByText("Hidden gems")).toBeTruthy();
  });

  it("wraps content inside a card", () => {
    const { getByText } = render(
      <Card>
        <Text>Inside card</Text>
      </Card>
    );

    expect(getByText("Inside card")).toBeTruthy();
  });

  it("handles pill presses", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Pill label="Museums" onPress={onPress} />);

    fireEvent.press(getByText("Museums"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows section titles and dividers", () => {
    const { getByText, toJSON } = render(
      <>
        <SectionTitle>Saved places</SectionTitle>
        <Divider />
      </>
    );

    expect(getByText("Saved places")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });
});
