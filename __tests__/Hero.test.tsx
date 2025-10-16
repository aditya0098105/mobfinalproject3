import React from "react";
import { render } from "@testing-library/react-native";
import Hero from "../components/Hero";

describe("Hero", () => {
  it("renders the banner image without overlay copy", () => {
    const { getByTestId, queryByText } = render(<Hero />);

    expect(getByTestId("hero-banner")).toBeTruthy();
    expect(queryByText("Destinations today!")).toBeNull();
  });
});
