import React from "react";
import { Alert, Keyboard } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("react-native-get-random-values", () => ({}));
jest.mock("react-native-url-polyfill/auto", () => ({}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
const mockPush = jest.fn();
const useRouterMock = require("expo-router").useRouter as jest.Mock;

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: any) => callback(),
}));

const mockAuth = {
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  getUser: jest.fn(),
};

const fromChain: any = {};
fromChain.select = jest.fn(() => fromChain);
fromChain.eq = jest.fn(() => fromChain);
fromChain.order = jest.fn();

const mockSupabase = {
  auth: mockAuth,
  from: jest.fn(() => fromChain),
};

jest.mock("@supabase/supabase-js");
const createClientMock = require("@supabase/supabase-js").createClient as jest.Mock;
createClientMock.mockReturnValue(mockSupabase);

jest.mock("../components/Hero", () => () => null);

jest.mock("../lib/db", () => ({
  db: {
    getAllAsync: jest.fn(),
  },
}));

const HomeModule = require("../app/(tabs)/index");
const Home = HomeModule.default as React.ComponentType;
const toSlug = HomeModule.toSlug as (s: string) => string;

const { db } = require("../lib/db");
const getAllAsyncMock = db.getAllAsync as jest.Mock;

const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
const dismissSpy = jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});

describe("Home screen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    useRouterMock.mockReturnValue({ push: mockPush });
    createClientMock.mockReturnValue(mockSupabase);
    alertSpy.mockClear();
    dismissSpy.mockClear();
    mockAuth.getSession.mockReset();
    mockAuth.signInWithPassword.mockReset();
    mockAuth.signUp.mockReset();
    mockAuth.getUser.mockReset();
    mockAuth.getUser.mockResolvedValue({ data: { user: null } });
    fromChain.select.mockClear();
    fromChain.eq.mockClear();
    fromChain.order.mockReset();
    mockSupabase.from.mockClear();
    getAllAsyncMock.mockReset();
  });

  it("renders inline auth when no session is present", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    const { getByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText("Sign in to CityHop")).toBeTruthy();
    });
  });

  it("allows toggling to sign up mode", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    const { getByText } = render(<Home />);

    const toggle = await waitFor(() => getByText("New here? Create an account"));
    fireEvent.press(toggle);

    await waitFor(() => {
      expect(getByText("Create your CityHop account")).toBeTruthy();
    });
  });

  it("submits sign in credentials", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    mockAuth.signInWithPassword.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<Home />);

    const emailInput = await waitFor(() => getByPlaceholderText("Email"));
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "traveler@example.com");
    fireEvent.changeText(passwordInput, "secret");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "traveler@example.com",
        password: "secret",
      });
    });
  });

  it("navigates to a city when searching", async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "1", user_metadata: { full_name: "Sky Wanderer" } },
        },
      },
    });
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: "1" } } });
    fromChain.order.mockResolvedValue({ data: [], error: null });
    getAllAsyncMock.mockResolvedValue([{ count: 2 }]);

    const { getByPlaceholderText, getByText } = render(<Home />);

    const input = await waitFor(() => getByPlaceholderText("Search for a city or hidden gem"));
    fireEvent.changeText(input, "Tokyo");
    fireEvent.press(getByText("Search destinations"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/city/Tokyo");
    });
  });

  it("converts names to url-friendly slugs", () => {
    expect(toSlug("New York City")).toBe("new-york-city");
    expect(toSlug("  Zürich  ")).toBe("zürich");
  });
});
