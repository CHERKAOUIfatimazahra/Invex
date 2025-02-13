import React, { useState , useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ImageBackground,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { WarehouseContext } from "../Context/WarehouseContext";

const THEME = {
  colors: {
    primary: "#8DE8CF",
    secondary: "#B7F5AA",
    text: "#FFFFFF",
    textLight: "rgba(255, 255, 255, 0.8)",
    white: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.6)",
    error: "#FF6B6B",
    warning: "#FFB036",
    success: "#4CD964",
  },
};

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { product } = route.params;
  const [currentProduct, setCurrentProduct] = useState(product);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { warehousemanId } = useContext(WarehouseContext);

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return THEME.colors.error;
    if (quantity < 10) return THEME.colors.warning;
    return THEME.colors.success;
  };

  const updateStockQuantity = async (stockId, amount) => {
    if (amount === 0 || isNaN(amount)) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide.");
      return;
    }

    setLoading(true);
    try {
      const updatedStocks = currentProduct.stocks.map((stock) => {
        if (stock.id === stockId) {
          const newQuantity = stock.quantity + amount;
          return { ...stock, quantity: newQuantity >= 0 ? newQuantity : 0 };
        }
        return stock;
      });

      await axios.patch(
        `http://172.16.9.161:3000/products/${currentProduct.id}`,
        {
          stocks: updatedStocks,
          warehousemanId: warehousemanId,
        }
      );
      setCurrentProduct((prev) => ({ ...prev, stocks: updatedStocks }));
      setQuantities((prev) => ({ ...prev, [stockId]: "" }));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/Invex__1_-removebg-preview.png")}
      style={styles.container}
    >
      <View style={styles.darkOverlay} />
      <LinearGradient
        colors={["rgba(141, 232, 207, 0.3)", "rgba(183, 245, 170, 0.4)"]}
        style={styles.gradient}
      >
        <StatusBar style="light" />
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={THEME.colors.white} />
          </TouchableOpacity>

          <Image
            source={{ uri: currentProduct.image }}
            style={styles.productImage}
          />
          <Text style={styles.title}>{currentProduct.name}</Text>

          <View style={styles.detailsContainer}>
            <DetailItem
              icon="cube-outline"
              label="Type"
              value={currentProduct.type}
            />
            <DetailItem
              icon="pricetag-outline"
              label="Prix"
              value={`${currentProduct.price} DH`}
            />
            <DetailItem
              icon="business-outline"
              label="Fournisseur"
              value={currentProduct.supplier}
            />
          </View>
          <Text style={styles.subtitle}>Stocks disponibles</Text>
          {Array.isArray(currentProduct.stocks) &&
          currentProduct.stocks.length > 0 ? (
            currentProduct.stocks.map((stock) => (
              <View key={stock.id} style={styles.stockItem}>
                <Text style={styles.stockName}>stock : {stock.name}</Text>
                <Text style={styles.stockLocation}>
                  localisation : {`${stock.localisation.city}`}
                </Text>

                <Text
                  style={[
                    styles.stockQuantity,
                    { color: getStockStatusColor(stock.quantity) },
                  ]}
                >
                  Quantité: {stock.quantity}
                </Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Entrez une quantité"
                  placeholderTextColor={THEME.colors.textLight}
                  value={quantities[stock.id] || ""}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({ ...prev, [stock.id]: text }))
                  }
                />

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.addButton]}
                    onPress={() =>
                      updateStockQuantity(
                        stock.id,
                        Number(quantities[stock.id] || 0)
                      )
                    }
                    disabled={loading}
                  >
                    <Ionicons
                      name="add-outline"
                      size={20}
                      color={THEME.colors.text}
                    />
                    <Text style={styles.buttonText}>Réapprovisionner</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() =>
                      updateStockQuantity(
                        stock.id,
                        -Number(quantities[stock.id] || 0)
                      )
                    }
                    disabled={loading}
                  >
                    <Ionicons
                      name="remove-outline"
                      size={20}
                      color={THEME.colors.text}
                    />
                    <Text style={styles.buttonText}>Décharger</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noStock}>Aucun stock disponible.</Text>
          )}

          {loading && (
            <ActivityIndicator
              size="large"
              color={THEME.colors.primary}
              style={styles.loader}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons
      name={icon}
      size={24}
      color={THEME.colors.white}
      style={styles.detailIcon}
    />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.shadow,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
      paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 16,
    marginTop: 0,
    marginBottom: 20,
    resizeMode: "cover",
  },
    title: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.colors.white,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: THEME.colors.white,
    marginTop: 30,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 18,
    color: THEME.colors.white,
    fontWeight: "500",
  },
  stockItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stockName: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.colors.white,
    marginBottom: 8,
  },
  stockQuantity: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
  stockLocation: {
    fontSize: 16,
    color: THEME.colors.textLight,
    marginBottom: 16,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: THEME.colors.white,
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
  },
  removeButton: {
    backgroundColor: THEME.colors.error,
  },
  buttonText: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  noStock: {
    fontSize: 18,
    color: THEME.colors.textLight,
    textAlign: "center",
    marginTop: 20,
  },
  loader: {
    marginVertical: 20,
  },
});

export default ProductDetailScreen;
