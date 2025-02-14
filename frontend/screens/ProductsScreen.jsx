import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const ProductsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    price: "asc",
    quantity: "asc",
    name: "asc",
  });

  const getStockStatusColor = (quantity) => {
    if (quantity <= 0) return THEME.colors.error;
    if (quantity <= 10) return THEME.colors.warning;
    return THEME.colors.success;
  };

  // fitch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await axios.get("http://172.16.9.161:3000/products");
        setProducts(response.data);
        setAllProducts(response.data);
      } catch (error) {
        setError("Erreur lors du chargement des produits");
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // seach products
  const filterProducts = (text) => {
    setSearchText(text);
    if (text === "") {
      setProducts(allProducts);
    } else {
      const filteredProducts = allProducts.filter((product) => {
        const searchLower = text.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.type?.toLowerCase().includes(searchLower) ||
          product.supplier?.toLowerCase().includes(searchLower) ||
          product.price?.toString().includes(text)
        );
      });
      setProducts(filteredProducts);
    }
  };
  // tri des produits
  const getTotalQuantity = (product) => {
    return (
      product.stocks?.reduce((total, stock) => total + stock.quantity, 0) || 0
    );
  };

  const sortProducts = (key) => {
    const order = sortOrder[key] === "asc" ? "desc" : "asc";

    const sortedProducts = [...products].sort((a, b) => {
      if (key === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (key === "quantity") {
        return order === "asc"
          ? getTotalQuantity(a) - getTotalQuantity(b)
          : getTotalQuantity(b) - getTotalQuantity(a);
      } else {
        return order === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });

    setProducts(sortedProducts);
    setSortOrder({ ...sortOrder, [key]: order });
  };
  // Générer un PDF
  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body>
            <h1>Liste des Produits</h1>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="border: 1px solid black; padding: 8px;">Nom</th>
                <th style="border: 1px solid black; padding: 8px;">Type</th>
                <th style="border: 1px solid black; padding: 8px;">Prix</th>
                <th style="border: 1px solid black; padding: 8px;">Quantité</th>
                <th style="border: 1px solid black; padding: 8px;">Fournisseur</th>
              </tr>
              ${products
                .map(
                  (product) => `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${
                    product.name
                  }</td>
                  <td style="border: 1px solid black; padding: 8px;">${
                    product.type
                  }</td>
                  <td style="border: 1px solid black; padding: 8px;">${
                    product.price
                  } DH</td>
                  <td style="border: 1px solid black; padding: 8px;">${getTotalQuantity(
                    product
                  )}</td>
                  <td style="border: 1px solid black; padding: 8px;">${
                    product.supplier
                  }</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={THEME.gradients.header} style={styles.header}>
        <Text style={styles.headerTitle}>Produits</Text>
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Ionicons
            name="document-text"
            size={24}
            color={THEME.colors.textLight}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search and Sort */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={THEME.colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={THEME.colors.gray}
            value={searchText}
            onChangeText={filterProducts}
          />
        </View>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => sortProducts("price")}
          >
            <Text style={styles.sortButtonText}>
              Prix {sortOrder.price === "asc" ? "↑" : "↓"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => sortProducts("quantity")}
          >
            <Text style={styles.sortButtonText}>
              Quantité {sortOrder.quantity === "asc" ? "↑" : "↓"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => sortProducts("name")}
          >
            <Text style={styles.sortButtonText}>
              Nom {sortOrder.name === "asc" ? "A-Z" : "Z-A"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={THEME.colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
            >
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image
                    source={
                      { uri: item.image } ||
                      require("../assets/Invex__1_-removebg-preview.png")
                    }
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={THEME.colors.gray}
                    />
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productType}>{item.type}</Text>
                <Text style={styles.price}>{item.price} DH</Text>
                <Text style={styles.supplier}>{item.supplier}</Text>

                {Array.isArray(item.stocks) && item.stocks.length > 0 && (
                  <View style={styles.stocksContainer}>
                    {item.stocks.map((stock) => (
                      <View key={stock.id} style={styles.stockItem}>
                        <Text style={styles.stockName}>{stock.name}</Text>
                        <Text
                          style={[
                            styles.stockQuantity,
                            { color: getStockStatusColor(stock.quantity) },
                          ]}
                        >
                          quantity: {stock.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: THEME.colors.textLight,
  },
  pdfButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: THEME.colors.text,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  sortButtonText: {
    color: THEME.colors.textLight,
    fontSize: 12,
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: THEME.colors.background,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: THEME.colors.gray,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  supplier: {
    fontSize: 14,
    color: THEME.colors.gray,
  },
  stocksContainer: {
    marginTop: 8,
  },
  stockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  stockName: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: "500",
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

export default ProductsScreen;
