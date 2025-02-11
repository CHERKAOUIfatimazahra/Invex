import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = width * 0.42;

const THEME = {
  colors: {
    primary: "#8DE8CF",
    secondary: "#B7F5AA",
    accent: "#7B61FF",
    background: "#F8FAFF",
    text: "#FFFFFF",
    dark: "#2D3748",
    gray: "#A0AEC0",
  },
  gradients: {
    scanner: ["#FF6B6B", "#FFA06B"],
    products: ["#4facfe", "#00f2fe"],
    statistics: ["#7B61FF", "#9C8FFF"],
    reports: ["#43E97B", "#38F9D7"],
  },
};

const MainDashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Oui",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.navigate("Login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(
              "Erreur",
              "Une erreur est survenue lors de la déconnexion"
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bonjour, Magasinier 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E8E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Main Navigation Grid */}
      <Animated.View
        style={[
          styles.grid,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <NavigationButton
          title="Scanner"
          subtitle="Scanner produits"
          icon="barcode-outline"
          gradientColors={THEME.gradients.scanner}
          onPress={() => navigation.navigate("Scan")}
        />
        <NavigationButton
          title="Produits"
          subtitle="Gérer stock"
          icon="cube-outline"
          gradientColors={THEME.gradients.products}
          onPress={() => navigation.navigate("Products")}
        />
        <NavigationButton
          title="Stats"
          subtitle="Analyses"
          icon="stats-chart-outline"
          gradientColors={THEME.gradients.statistics}
          onPress={() => navigation.navigate("Statistics")}
        />
        <NavigationButton
          title="Rapports"
          subtitle="Générer PDF"
          icon="document-text-outline"
          gradientColors={THEME.gradients.reports}
          onPress={() => navigation.navigate("PDF")}
        />
      </Animated.View>

      {/* Footer Text */}
      <Text style={styles.footerText}>Invex v1.0</Text>
    </View>
  );
};

const NavigationButton = ({
  title,
  subtitle,
  icon,
  gradientColors,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={32} color={THEME.colors.text} />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>{title}</Text>
            <Text style={styles.buttonSubtitle}>{subtitle}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeText: {
    fontSize: 20,
    color: THEME.colors.gray,
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutGradient: {
    padding: 12,
    borderRadius: 12,
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  button: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTextContainer: {
    marginTop: 12,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerText: {
    textAlign: "center",
    color: THEME.colors.gray,
    paddingBottom: 20,
    fontSize: 12,
  },
});

export default MainDashboardScreen;
