import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleScanPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/scanner" as any);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8">
          {/* Hero Section */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">Product Photo</Text>
            <Text className="text-base text-muted text-center">
              Escanea, fotografía y procesa productos fácilmente
            </Text>
          </View>

          {/* Main Action Button */}
          <View className="items-center gap-6">
            <TouchableOpacity
              onPress={handleScanPress}
              style={[styles.scanButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📷</Text>
              <Text className="text-white font-bold text-xl">Escanear Código de Barras</Text>
              <Text className="text-white/80 text-sm mt-2">Toca para comenzar</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Card */}
          <View className="w-full max-w-sm self-center bg-surface rounded-2xl p-6 shadow-sm border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Estadísticas de Hoy</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary">0</Text>
                <Text className="text-sm text-muted mt-1">Productos</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary">0</Text>
                <Text className="text-sm text-muted mt-1">Fotos</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-2">Cómo usar:</Text>
            <Text className="text-muted text-sm leading-relaxed">
              1. Escanea el código de barras del producto{"\n"}
              2. Toma múltiples fotos del producto{"\n"}
              3. Las fotos se procesarán automáticamente con fondo blanco{"\n"}
              4. Se subirán al servidor con nomenclatura automática
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
});
