import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WarehouseContext } from "../Context/WarehouseContext";

export const login = async (secretKey) => {
  try {
    const response = await axios.get(
      `http://172.16.9.161:3000/warehousemans?secretKey=${secretKey}`
    );
    const data = response.data;
    const user = data[0];

    if (user) {
      await AsyncStorage.setItem("userToken", JSON.stringify(user));
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const LoginScreen = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setWarehouseId, setWarehousemanId } = useContext(WarehouseContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

// function pour
  const handleLogin = async () => {
    if (code.length < 4) {
      setErrorMessage("Le code secret doit contenir au moins 4 caractères.");
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(code);

      if (user) {
        setWarehouseId(user.warehouseId);
        setWarehousemanId(user.id);
        setIsLoggedIn(true);
        setIsAuthenticated(true);
      } else {
        setErrorMessage("Le code secret est incorrect.");
      }
    } catch (error) {
      setErrorMessage("Le code secret est incorrect.");
    } finally {
      setIsLoading(false);
    }
  };
// redirection vers screen 
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("MainDashboard");
    }
  }, [isAuthenticated]);

  return (
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => navigation.replace("Start")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
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
                color="#4A5568"
                style={styles.inputIcon}
              />
              {/* Champ de saisie du code secret */}
              <TextInput
                style={styles.input}
                placeholder="Entrez votre code"
                placeholderTextColor="#4A5568"
                value={code}
                onChangeText={(text) =>
                  setCode(text.replace(/[^A-Za-z0-9]/gi, ""))
                }
                keyboardType="default"
                secureTextEntry
                maxLength={10}
              />
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Bouton de connexion */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Text>
              {!isLoading && (
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
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
    backgroundColor: "#FFFFFF",
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
    color: "#2D3748",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#4A5568" },
  form: { gap: 32 },
  label: {
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputIcon: { padding: 12 },
  input: { flex: 1, color: "#2D3748", fontSize: 18, padding: 12 },
  loginButton: {
    backgroundColor: "#8DE8CF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
  },
});

export default LoginScreen;
