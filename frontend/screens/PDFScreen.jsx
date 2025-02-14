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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
  colors: {
    primary: "#7B61FF",
    secondary: "#9C8FFF",
    background: "#F8FAFF",
    surface: "#FFFFFF",
    text: "#2D3748",
    textLight: "#FFFFFF",
    gray: "#A0AEC0",
    border: "#E2E8F0",
    success: "#4CD964",
  },
};

const PDFScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const generateInventoryPDF = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = response.data;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Inventaire Détaillé des Produits</title>
            <style>
              body {
                font-family: 'Helvetica', sans-serif;
                margin: 40px;
                color:rgb(5, 7, 5);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solidrgb(1, 1, 2);
              }
              .title {
                color:rgb(0, 0, 0);
                font-size: 24px;
                margin-bottom: 10px;
              }
              .date {
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
              }
              .product-card {
                background-color: #F8FAFF;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                border: 1px solid #E2E8F0;
              }
              .product-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                border-bottom: 1px solid #E2E8F0;
                padding-bottom: 10px;
              }
              .product-name {
                font-size: 18px;
                font-weight: bold;
                color:rgb(0, 0, 0);
              }
              .product-info {
                margin-bottom: 15px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .stocks-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              .stocks-table th {
                background-color:rgb(18, 236, 167);
                color: white;
                text-align: left;
                padding: 8px;
              }
              .stocks-table td {
                padding: 8px;
                border-bottom: 1px solid #E2E8F0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #7B61FF;
                color: #666;
                font-size: 12px;
              }
              .summary {
                background-color: #7B61FF;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 30px;
              }
              .summary-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Inventaire Détaillé des Produits</h1>
              <div class="date">Généré le ${new Date().toLocaleDateString(
                "fr-FR"
              )} à ${new Date().toLocaleTimeString("fr-FR")}</div>
            </div>

            <div class="summary">
              <div class="summary-title">Résumé de l'inventaire</div>
              <div>Nombre total de produits: ${products.length}</div>
              <div>Valeur totale du stock: ${products
                .reduce(
                  (total, product) =>
                    total +
                    product.price *
                      product.stocks.reduce(
                        (sum, stock) => sum + stock.quantity,
                        0
                      ),
                  0
                )
                .toLocaleString("fr-FR")} DH</div>
            </div>

            ${products
              .map(
                (product) => `
              <div class="product-card">
                <div class="product-header">
                  <div class="product-name">${product.name}</div>
                  <div>ID: ${product.id}</div>
                </div>
                
                <div class="product-info">
                  <div class="info-row">
                    <span>Type:</span>
                    <span>${product.type}</span>
                  </div>
                  <div class="info-row">
                    <span>Code-barres:</span>
                    <span>${product.barcode}</span>
                  </div>
                  <div class="info-row">
                    <span>Prix:</span>
                    <span>${product.price.toLocaleString("fr-FR")} DH</span>
                  </div>
                  <div class="info-row">
                    <span>Fournisseur:</span>
                    <span>${product.supplier}</span>
                  </div>
                </div>

                ${
                  product.stocks.length > 0
                    ? `
                  <table class="stocks-table">
                    <thead>
                      <tr>
                        <th>Entrepôt</th>
                        <th>Ville</th>
                        <th>Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${product.stocks
                        .map(
                          (stock) => `
                        <tr>
                          <td>${stock.name}</td>
                          <td>${stock.localisation.city}</td>
                          <td>${stock.quantity}</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                    : '<p style="color: #FF6B6B;">Aucun stock disponible</p>'
                }
              </div>
            `
              )
              .join("")}
            
            <div class="footer">
              © ${new Date().getFullYear()} invex. Tous droits réservés.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  };

  const generateStockByLocationPDF = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = await response.data;

      // Organiser les produits par localisation
      const stocksByLocation = {};
      products.forEach((product) => {
        product.stocks.forEach((stock) => {
          if (!stocksByLocation[stock.name]) {
            stocksByLocation[stock.name] = {
              city: stock.localisation.city,
              products: [],
            };
          }
          stocksByLocation[stock.name].products.push({
            name: product.name,
            quantity: stock.quantity,
            price: product.price,
          });
        });
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Rapport des Stocks par Emplacement</title>
            <style>
              /* Réutiliser les styles précédents et ajouter : */
              .location-card {
                background-color: #F8FAFF;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                border: 1px solid #E2E8F0;
              }
              .location-header {
                background-color: #7B61FF;
                color: white;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
              }
              .location-stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                background-color: #F1F5F9;
                padding: 10px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Rapport des Stocks par Emplacement</h1>
              <div class="date">Généré le ${new Date().toLocaleDateString(
                "fr-FR"
              )}</div>
            </div>

            ${Object.entries(stocksByLocation)
              .map(([location, data]) => {
                const totalValue = data.products.reduce(
                  (sum, prod) => sum + prod.price * prod.quantity,
                  0
                );
                const totalItems = data.products.reduce(
                  (sum, prod) => sum + prod.quantity,
                  0
                );

                return `
                <div class="location-card">
                  <div class="location-header">
                    <h2>${location} - ${data.city}</h2>
                  </div>
                  
                  <div class="location-stats">
                    <div>Nombre total d'articles: ${totalItems}</div>
                    <div>Valeur totale: ${totalValue.toLocaleString(
                      "fr-FR"
                    )} DH</div>
                  </div>

                  <table class="stocks-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.products
                        .map(
                          (prod) => `
                        <tr>
                          <td>${prod.name}</td>
                          <td>${prod.quantity}</td>
                          <td>${(prod.price * prod.quantity).toLocaleString(
                            "fr-FR"
                          )} DH</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `;
              })
              .join("")}
            
            <div class="footer">
              © ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Rapports PDF</Text>
        <Text style={styles.subtitle}>Générez vos rapports détaillés</Text>
      </View>

      <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.reportCard}
          onPress={generateInventoryPDF}
          disabled={loading}
        >
          <View style={styles.reportIcon}>
            <Ionicons
              name="document-text"
              size={24}
              color={THEME.colors.primary}
            />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Inventaire Détaillé</Text>
            <Text style={styles.reportDescription}>
              Liste complète des produits avec détails des stocks par
              emplacement
            </Text>
          </View>
          {loading && (
            <ActivityIndicator
              size="small"
              color={THEME.colors.primary}
              style={styles.loader}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportCard}
          onPress={generateStockByLocationPDF}
          disabled={loading}
        >
          <View style={styles.reportIcon}>
            <Ionicons name="location" size={24} color={THEME.colors.primary} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Stocks par Emplacement</Text>
            <Text style={styles.reportDescription}>
              Vue d'ensemble des stocks organisée par entrepôt et ville
            </Text>
          </View>
          {loading && (
            <ActivityIndicator
              size="small"
              color={THEME.colors.primary}
              style={styles.loader}
            />
          )}
        </TouchableOpacity>

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.gray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${THEME.colors.primary}15`,
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
    color: THEME.colors.text,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: THEME.colors.gray,
  },
  loader: {
    marginLeft: 8,
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

export default PDFScreen;
