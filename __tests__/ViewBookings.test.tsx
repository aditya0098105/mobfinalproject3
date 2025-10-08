import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import BookingsScreen from "../app/city/[cityId]/bookings";

// ✅ Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ cityId: "Jaipur" }),
}));

// ✅ Mock DB
jest.mock("../lib/db", () => ({
  db: {
    getAllAsync: jest.fn().mockResolvedValue([]),
    runAsync: jest.fn(),
  },
}));

describe("ViewBookings Screen", () => {
  it("renders heading with cityId (Unit)", async () => {
    const { getByText } = render(<BookingsScreen />);
    await waitFor(() => {
      expect(getByText("Bookings")).toBeTruthy();
      expect(getByText("Manage stays and guest details in Jaipur")).toBeTruthy();
    });
  });

  it("shows message when no bookings exist (Unit)", async () => {
    const { getByText } = render(<BookingsScreen />);
    await waitFor(() => {
      expect(getByText("No bookings yet")).toBeTruthy();
    });
  });
});
