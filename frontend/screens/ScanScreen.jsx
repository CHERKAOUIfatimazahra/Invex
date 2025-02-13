import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

const { width } = Dimensions.get("window");

const THEME = {
  colors: {
    primary: "#7B61FF",
    secondary: "#9C8FFF",
    scanner: "#FF6B6B",
    products: "#4facfe",
    statistics: "#7B61FF",
    reports: "#43E97B",
    background: "#F8FAFF",
    surface: "#FFFFFF",
    text: "#2D3748",
    textLight: "#FFFFFF",
    gray: "#A0AEC0",
    border: "#E2E8F0",
  },
  gradients: {
    scanner: ["#FF6B6B", "#FFA06B"],
    camera: ["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"],
  },
};

const ScanScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data);
      checkProduct(data);
    }
  };

  const checkProduct = async (barcode) => {
    try {
      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = response.data;
      const product = products.find((p) => p.barcode === barcode);

      if (product) {
        navigation.navigate("ProductDetail", { product });
      } else {
        navigation.navigate("AddProduct", { barcode });
      }
    } catch (error) {
      console.error("Erreur de requête API :", error);
      Alert.alert("Erreur", "Impossible de récupérer les données du produit.");
    }
  };

  const handleValidate = () => {
    if (barcode.trim() === "") {
      Alert.alert("Erreur", "Veuillez entrer un code-barres.");
    } else {
      checkProduct(barcode);
    }
  };

  const resetScan = () => {
    setBarcode("");
    setScanned(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanner</Text>
        <Text style={styles.headerSubtitle}>Scannez vos produits</Text>
      </View>

      {/* Camera Section */}
      <View style={styles.cameraSection}>
        <LinearGradient
          colors={THEME.gradients.scanner}
          style={styles.cameraContainer}
        >
          <View style={styles.cameraFrame}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            <LinearGradient
              colors={THEME.gradients.camera}
              style={styles.cameraOverlay}
            >
              <View style={styles.scanArea} />
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>

      {/* Manual Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Saisie manuelle</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le code-barres"
          placeholderTextColor={THEME.colors.gray}
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, scanned && styles.buttonScanned]}
          onPress={scanned ? resetScan : handleValidate}
        >
          <Text style={styles.buttonText}>
            {scanned ? "Scanner à nouveau" : "Valider"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Scan")}
        >
          <Ionicons
            name="barcode-outline"
            size={24}
            color={THEME.colors.scanner}
          />
          <Text style={[styles.navText, { color: THEME.colors.scanner }]}>
            Scanner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Products")}
        >
          <Ionicons
            name="cube-outline"
            size={24}
            color={THEME.colors.products}
          />
          <Text style={[styles.navText, { color: THEME.colors.products }]}>
            Produits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Statistics")}
        >
          <Ionicons
            name="stats-chart-outline"
            size={24}
            color={THEME.colors.statistics}
          />
          <Text style={[styles.navText, { color: THEME.colors.statistics }]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("PDF")}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color={THEME.colors.reports}
          />
          <Text style={[styles.navText, { color: THEME.colors.reports }]}>
            Rapports
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: THEME.colors.gray,
  },
  cameraSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cameraContainer: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cameraFrame: {
    height: width * 0.75,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.6,
    height: width * 0.3,
  },
  inputSection: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonScanned: {
    backgroundColor: THEME.colors.scanner,
  },
  buttonText: {
    color: THEME.colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginTop: "auto",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default ScanScreen;
