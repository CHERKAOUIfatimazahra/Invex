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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { WarehouseContext } from "../Context/WarehouseContext";

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { product } = route.params;
  const [currentProduct, setCurrentProduct] = useState(product);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { warehousemanId } = useContext(WarehouseContext);

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return "#E53E3E";
    if (quantity < 10) return "#FFB036";
    return "#4CD964";
  };

  const updateStockQuantity = async (stockId, isAddition) => {

    const amount = Number(quantities[stockId]);
    if (amount <= 0 || isNaN(amount)) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide supérieur à 0");
      return;
    }

    setLoading(true);

    try {
      const newStocks = currentProduct.stocks.map((stock) => {
        if (stock.id === stockId) {
          let newQuantity = stock.quantity;

          if (isAddition) {
            newQuantity = stock.quantity + amount;
          } else {
            newQuantity = stock.quantity - amount;
            if (newQuantity < 0) {
              newQuantity = 0;
            }
          }
          return { ...stock, quantity: newQuantity };
        }
        return stock;
      });

      await axios.patch(
        `http://172.16.9.161:3000/products/${currentProduct.id}`,
        {
          stocks: newStocks,
          warehousemanId: warehousemanId,
        }
      );

      setCurrentProduct({ ...currentProduct, stocks: newStocks });
      setQuantities({ ...quantities, [stockId]: "" });
    } catch (error) {
      console.error("erreur",error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#2D3748" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Détails du produit</Text>
          </View>

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

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="cube-outline"
                      size={24}
                      color="#4A5568"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Quantité à modifier"
                      placeholderTextColor="#4A5568"
                      value={quantities[stock.id] || ""}
                      onChangeText={(text) =>
                        setQuantities((prev) => ({ ...prev, [stock.id]: text }))
                      }
                    />
                  </View>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.addButton]}
                      onPress={() => updateStockQuantity(stock.id, true)}
                      disabled={loading}
                    >
                      <Ionicons name="add-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Ajouter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => updateStockQuantity(stock.id, false)}
                      disabled={loading}
                    >
                      <Ionicons
                        name="remove-outline"
                        size={20}
                        color="#FFFFFF"
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
                color="#8DE8CF"
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
              <Ionicons name="barcode-outline" size={24} color="#8DE8CF" />
              <Text style={[styles.navText, { color: "#8DE8CF" }]}>
                Scanner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Products")}
            >
              <Ionicons name="cube-outline" size={24} color="#4A5568" />
              <Text style={[styles.navText, { color: "#4A5568" }]}>
                Produits
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Statistics")}
            >
              <Ionicons name="stats-chart-outline" size={24} color="#4A5568" />
              <Text style={[styles.navText, { color: "#4A5568" }]}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("PDF")}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#4A5568"
              />
              <Text style={[styles.navText, { color: "#4A5568" }]}>
                Rapports
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={24} color="#8DE8CF" />
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
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2D3748",
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#2D3748",
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
    color: "#4A5568",
  },
  detailValue: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3748",
    margin: 16,
  },
  stockCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#2D3748",
    marginBottom: 8,
  },
  stockLocation: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 12,
  },
  stockQuantity: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    color: "#2D3748",
    fontSize: 16,
    padding: 12,
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
    backgroundColor: "#8DE8CF",
  },
  removeButton: {
    backgroundColor: "#E53E3E",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noStock: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",
    margin: 16,
  },
  loader: {
    marginVertical: 20,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
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
