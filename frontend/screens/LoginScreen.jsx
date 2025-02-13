import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WarehouseContext } from "../Context/WarehouseContext";

const THEME = {
  colors: {
    primary: "#8DE8CF",
    secondary: "#B7F5AA",
    text: "#2D3748",
    textLight: "#4A5568",
    white: "#FFFFFF",
    inputBg: "#F7FAFC",
    border: "#E2E8F0",
    error: "#E53E3E",
  },
};

const LoginScreen = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setWarehouseId } = useContext(WarehouseContext);
  const { setWarehousemanId } = useContext(WarehouseContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async () => {
    if (code.length < 4) {
      setErrorMessage("Le code secret doit contenir au moins 4 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://172.16.9.161:3000/warehousemans?secretKey=${code}`
      );
      const data = response.data;
      const user = data[0];

      await AsyncStorage.setItem("userToken", JSON.stringify(user));

      setWarehouseId(user.warehouseId);
      setWarehousemanId(user.id);

      setIsLoggedIn(true);
      setIsAuthenticated(true);
    } catch (error) {
      // console.error("Login error:", error);
      setErrorMessage("Le code secret est incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("MainDashboard");
    }
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={[THEME.colors.primary, THEME.colors.secondary]}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => navigation.replace("Start")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Entrez votre code secret</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Code Secret</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="key-outline"
                size={24}
                color={THEME.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Entrez votre code"
                placeholderTextColor={THEME.colors.textLight}
                value={code}
                onChangeText={(text) =>
                  setCode(text.replace(/[^A-Z0-9]/gi, ""))
                }
                keyboardType="default"
                autoCapitalize="characters"
                secureTextEntry
                maxLength={10}
                autoFocus
              />
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Text>
              {!isLoading && (
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color={THEME.colors.white}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, marginTop: 60 },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  header: { marginTop: 20, marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: THEME.colors.textLight },
  form: { gap: 32 },
  label: {
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  inputIcon: { padding: 12 },
  input: { flex: 1, color: THEME.colors.text, fontSize: 18, padding: 12 },
  loginButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: THEME.colors.white, fontSize: 18, fontWeight: "600" },
  errorText: {
    color: THEME.colors.error,
    fontSize: 14,
  },
});

export default LoginScreen;
