import React, { useState, useContext } from "react";
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
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { WarehouseContext } from "../Context/WarehouseContext";

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
    error: "#FF6B6B",
    warning: "#FFB036",
    success: "#4CD964",
  },
  gradients: {
    header: ["#7B61FF", "#9C8FFF"],
    content: ["rgba(123, 97, 255, 0.1)", "rgba(156, 143, 255, 0.1)"],
  },
};

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={THEME.gradients.header} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={THEME.colors.textLight}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du produit</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.productCard}>
          {currentProduct.imageUrl ? (
            <Image
              source={{ uri: currentProduct.imageUrl }}
              style={styles.productImage}
            />
          ) : (
            <Image
              source={require("../assets/Invex__1_-removebg-preview.png")}
              style={styles.productImage}
            />
          )}

          <Text style={styles.productName}>{currentProduct.name}</Text>

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
        </View>

        <Text style={styles.sectionTitle}>Stocks disponibles</Text>

        {Array.isArray(currentProduct.stocks) &&
        currentProduct.stocks.length > 0 ? (
          currentProduct.stocks.map((stock) => (
            <View key={stock.id} style={styles.stockCard}>
              <Text style={styles.stockName}>{stock.name}</Text>
              <Text style={styles.stockLocation}>
                {stock.localisation.city}
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
                placeholder="Quantité à modifier"
                placeholderTextColor={THEME.colors.gray}
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
                    color={THEME.colors.textLight}
                  />
                  <Text style={styles.buttonText}>Ajouter</Text>
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
                    color={THEME.colors.textLight}
                  />
                  <Text style={styles.buttonText}>Retirer</Text>
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

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={24} color={THEME.colors.primary} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.colors.textLight,
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    margin: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.colors.gray,
  },
  detailValue: {
    fontSize: 16,
    color: THEME.colors.text,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.colors.text,
    margin: 16,
  },
  stockCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stockName: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  stockLocation: {
    fontSize: 16,
    color: THEME.colors.gray,
    marginBottom: 12,
  },
  stockQuantity: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
    color: THEME.colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  noStock: {
    fontSize: 16,
    color: THEME.colors.gray,
    textAlign: "center",
    margin: 16,
  },
  loader: {
    marginVertical: 20,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
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

export default ProductDetailScreen;
