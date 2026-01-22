import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to camera screen with product code
    router.push({
      pathname: "/camera",
      params: { productCode: data },
    });
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Por favor ingresa un código de producto");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/camera",
      params: { productCode: manualCode.trim() },
    });
  };

  if (!permission) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-foreground text-center">Cargando cámara...</Text>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <View className="items-center gap-4">
          <Text className="text-foreground text-xl font-bold text-center">
            Permiso de Cámara Requerido
          </Text>
          <Text className="text-muted text-center">
            Necesitamos acceso a tu cámara para escanear códigos de barras
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text className="text-white font-semibold text-base">Permitir Acceso</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Camera View */}
        <View className="flex-1 relative">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "code128",
                "code39",
                "code93",
                "codabar",
                "itf14",
              ],
            }}
          />
          
          {/* Scan Overlay */}
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={[styles.focusedContainer, { borderColor: scanned ? colors.success : colors.primary }]}>
                <View style={[styles.corner, styles.topLeft, { borderColor: scanned ? colors.success : colors.primary }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: scanned ? colors.success : colors.primary }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: scanned ? colors.success : colors.primary }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: scanned ? colors.success : colors.primary }]} />
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsText, { color: colors.foreground }]}>
              {scanned ? "¡Código detectado!" : "Alinea el código de barras dentro del marco"}
            </Text>
          </View>
        </View>

        {/* Manual Input Section */}
        <View className="bg-surface p-6 gap-4" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
          <Text className="text-foreground font-semibold text-base">
            ¿No puedes escanear? Ingresa el código manualmente:
          </Text>
          <View className="flex-row gap-3">
            <TextInput
              className="flex-1 bg-background px-4 py-3 rounded-lg text-foreground"
              style={{ borderColor: colors.border, borderWidth: 1 }}
              placeholder="Código del producto"
              placeholderTextColor={colors.muted}
              value={manualCode}
              onChangeText={setManualCode}
              keyboardType="default"
              returnKeyType="done"
              onSubmitEditing={handleManualSubmit}
            />
            <TouchableOpacity
              onPress={handleManualSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <Text className="text-white font-semibold">Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleContainer: {
    flexDirection: "row",
    height: 200,
  },
  focusedContainer: {
    width: 280,
    borderWidth: 2,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructionsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
});
