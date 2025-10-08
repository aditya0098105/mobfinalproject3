import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: any) => callback(),
}));

jest.mock("../lib/db", () => ({
  db: {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
  },
}));

import ItineraryPlanner, { formatDateRange, tripDuration } from "../app/itinerary";

const { db } = require("../lib/db");
const runAsyncMock = db.runAsync as jest.Mock;
const getAllAsyncMock = db.getAllAsync as jest.Mock;

const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("Itinerary planner", () => {
  beforeEach(() => {
    runAsyncMock.mockReset();
    getAllAsyncMock.mockReset();
    alertSpy.mockClear();
    getAllAsyncMock.mockResolvedValue([]);
    runAsyncMock.mockResolvedValue(undefined);
  });

  it("loads saved itineraries on mount", async () => {
    render(<ItineraryPlanner />);

    await waitFor(() => {
      expect(getAllAsyncMock).toHaveBeenCalledWith(
        "SELECT id, title, destination, start_date, end_date, experiences, created_at FROM itineraries ORDER BY datetime(created_at) DESC"
      );
    });
  });

  it("shows an alert when the title is missing", async () => {
    const { getByText } = render(<ItineraryPlanner />);

    const saveButton = await waitFor(() => getByText("Save itinerary"));
    fireEvent.press(saveButton);

    expect(alertSpy).toHaveBeenCalledWith("Missing title", "Give your itinerary a memorable name.");
  });

  it("requires a destination before saving", async () => {
    const { getByPlaceholderText, getByText } = render(<ItineraryPlanner />);

    const titleInput = await waitFor(() => getByPlaceholderText("Trip title (e.g. Amalfi Coast escape)"));
    fireEvent.changeText(titleInput, "Dream Trip");

    fireEvent.press(getByText("Save itinerary"));

    expect(alertSpy).toHaveBeenCalledWith("Destination needed", "Where are you heading?");
  });

  it("persists a plan and resets the form", async () => {
    const { getByPlaceholderText, getByText } = render(<ItineraryPlanner />);

    const titleInput = await waitFor(() => getByPlaceholderText("Trip title (e.g. Amalfi Coast escape)"));
    const destinationInput = getByPlaceholderText("Primary destination");
    const startInput = getByPlaceholderText("Start date (YYYY-MM-DD)");
    const endInput = getByPlaceholderText("End date (YYYY-MM-DD)");
    const experiencesInput = getByPlaceholderText(
      "Signature experiences, dining reservations, hidden gems..."
    );

    fireEvent.changeText(titleInput, "  Alpine Retreat  ");
    fireEvent.changeText(destinationInput, "Zurich");
    fireEvent.changeText(startInput, "2025-03-01");
    fireEvent.changeText(endInput, "2025-03-05");
    fireEvent.changeText(experiencesInput, "Visit the old town");

    const saveButton = getByText("Save itinerary");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(runAsyncMock).toHaveBeenCalledWith(
        "INSERT INTO itineraries (title, destination, start_date, end_date, experiences) VALUES (?, ?, ?, ?, ?)",
        ["Alpine Retreat", "Zurich", "2025-03-01", "2025-03-05", "Visit the old town"]
      );
      expect(alertSpy).toHaveBeenCalledWith("Saved", "Your itinerary has been added.");
    });
  });
});

describe("Itinerary helpers", () => {
  it("formats date ranges", () => {
    expect(formatDateRange(null, null)).toBe("Flexible dates");
    expect(formatDateRange("2025-02-01", null)).toBe("Starting 2025-02-01");
    expect(formatDateRange(null, "2025-02-14")).toBe("Wrapping up by 2025-02-14");
    expect(formatDateRange("2025-02-01", "2025-02-14")).toBe("2025-02-01 → 2025-02-14");
  });

  it("computes trip durations", () => {
    expect(tripDuration("2025-02-01", "2025-02-05")).toBe("5 days");
    expect(tripDuration("2025-02-01", "2025-02-01")).toBe("1 day");
    expect(tripDuration("invalid", "2025-02-05")).toBeNull();
    expect(tripDuration("2025-02-01", null)).toBeNull();
  });
});
