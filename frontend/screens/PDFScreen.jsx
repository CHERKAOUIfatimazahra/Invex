import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PDFScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const generatePDF = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = response.data;

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
                  <td style="border: 1px solid black; padding: 8px;">${
                    product.stocks[0]?.quantity || "no stock exist"
                  }</td>
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
      console.error("Error PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Rapports PDF</Text>
            <Text style={styles.subtitle}>Générez vos rapports détaillés</Text>
          </View>

          <ScrollView style={styles.scrollContent}>
            <TouchableOpacity
              style={styles.reportCard}
              onPress={generatePDF}
              disabled={loading}
            >
              <View style={styles.reportIcon}>
                <Ionicons name="document-text" size={24} color="#8DE8CF" />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>Liste des Produits</Text>
                <Text style={styles.reportDescription}>
                  Rapport simple avec les informations essentielles de tous les
                  produits
                </Text>
              </View>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#8DE8CF"
                  style={styles.loader}
                />
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* navbar */}
          <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Scan")}
            >
              <Ionicons name="barcode-outline" size={24} color="#4A5568" />
              <Text style={[styles.navText, { color: "#4A5568" }]}>
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
                color="#8DE8CF"
              />
              <Text style={[styles.navText, { color: "#8DE8CF" }]}>
                Rapports
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
  },
  scrollContent: {
    flex: 1,
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: "#4A5568",
  },
  loader: {
    marginLeft: 8,
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

export default PDFScreen;
