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
    if (quantity <= 0) return "#E53E3E";
    if (quantity <= 10) return "#FFB036";
    return "#4CD964";
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
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Produits</Text>
          <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
            <Ionicons name="document-text" size={24} color="#2D3748" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.searchSection}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="search-outline"
                size={24}
                color="#4A5568"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Rechercher un produit..."
                placeholderTextColor="#4A5568"
                value={searchText}
                onChangeText={filterProducts}
              />
            </View>

            <View style={styles.sortButtons}>
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
              color="#8DE8CF"
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
                        source={{ uri: item.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons
                          name="image-outline"
                          size={40}
                          color="#4A5568"
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
                              Quantité: {stock.quantity}
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
        </View>

        {/* navbar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Scan")}
          >
            <Ionicons name="barcode-outline" size={24} color="#2D3748" />
            <Text style={styles.navText}>Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Products")}
          >
            <Ionicons name="cube-outline" size={24} color="#8DE8CF" />
            <Text style={[styles.navText, { color: "#8DE8CF" }]}>Produits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Statistics")}
          >
            <Ionicons name="stats-chart-outline" size={24} color="#2D3748" />
            <Text style={styles.navText}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("PDF")}
          >
            <Ionicons name="document-text-outline" size={24} color="#2D3748" />
            <Text style={styles.navText}>Rapports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  searchSection: {
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    backgroundColor: "#8DE8CF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  sortButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
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
    color: "#2D3748",
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8DE8CF",
    marginBottom: 4,
  },
  supplier: {
    fontSize: 14,
    color: "#4A5568",
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
    color: "#2D3748",
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
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

export default ProductsScreen;