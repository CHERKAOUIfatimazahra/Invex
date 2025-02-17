import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { login } from "../screens/LoginScreen";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

jest.mock("axios");

describe("login function", () => {
  beforeEach(() => {
    axios.get.mockClear();
    AsyncStorage.setItem.mockClear();
  });

  test("should return user when valid secretKey is provided", async () => {
    const mockUser = {
      id: "123",
      name: "Test User",
      secretKey: "valid-key",
    };

    axios.get.mockResolvedValueOnce({ data: [mockUser] });

    const result = await login("valid-key");

    expect(axios.get).toHaveBeenCalledWith(
      "http://172.16.9.161:3000/warehousemans?secretKey=valid-key"
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userToken",
      JSON.stringify(mockUser)
    );
    expect(result).toEqual(mockUser);
  });

  test("should return null when invalid secretKey is provided", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    const result = await login("invalid-key");

    expect(axios.get).toHaveBeenCalledWith(
      "http://172.16.9.161:3000/warehousemans?secretKey=invalid-key"
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test("should return null when request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await login("any-key");

    expect(axios.get).toHaveBeenCalledWith(
      "http://172.16.9.161:3000/warehousemans?secretKey=any-key"
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
