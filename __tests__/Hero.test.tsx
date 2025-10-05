import React from "react";
import { render } from "@testing-library/react-native";
import Hero from "../components/Hero";

describe("Hero", () => {
  it("renders the banner image and copy", () => {
    const { getByTestId, getByText } = render(<Hero />);

    expect(getByTestId("hero-banner")).toBeTruthy();
    expect(getByText("Let’s")).toBeTruthy();
    expect(getByText("Destinations today!")).toBeTruthy();
  });
});
