import { useState, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface CapturedPhoto {
  uri: string;
  number: number;
}

export default function CameraScreen() {
  const { productCode } = useLocalSearchParams<{ productCode: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const colors = useColors();

  if (!productCode) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-foreground text-center">Error: Código de producto no encontrado</Text>
      </ScreenContainer>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        const photoNumber = photos.length + 1;
        setPhotos([...photos, { uri: photo.uri, number: photoNumber }]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    if (photos.length === 0) {
      Alert.alert("Sin fotos", "Debes tomar al menos una foto antes de continuar");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to processing screen
    router.push({
      pathname: "/processing",
      params: {
        productCode,
        photoCount: photos.length.toString(),
        photoUris: JSON.stringify(photos.map(p => p.uri)),
      },
    });
  };

  const handleRetake = (index: number) => {
    Alert.alert(
      "Eliminar foto",
      "¿Estás seguro de que quieres eliminar esta foto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            // Renumber photos
            const renumberedPhotos = newPhotos.map((photo, i) => ({
              ...photo,
              number: i + 1,
            }));
            setPhotos(renumberedPhotos);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
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
        {/* Product Code Header */}
        <View className="bg-primary px-6 py-4">
          <Text className="text-white text-lg font-bold text-center">
            Producto: {productCode}
          </Text>
          <Text className="text-white/80 text-sm text-center mt-1">
            {photos.length} {photos.length === 1 ? "foto tomada" : "fotos tomadas"}
          </Text>
        </View>

        {/* Camera View */}
        <View className="flex-1 relative">
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
          />

          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={isProcessing}
              style={[
                styles.captureButton,
                { borderColor: colors.primary },
                isProcessing && styles.captureButtonDisabled,
              ]}
            >
              <View style={[styles.captureButtonInner, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Thumbnails */}
        {photos.length > 0 && (
          <View className="bg-surface" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRetake(index)}
                  style={[styles.thumbnail, { borderColor: colors.border }]}
                >
                  <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                  <View style={[styles.thumbnailBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.thumbnailBadgeText}>{photo.number}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Finish Button */}
        <View className="bg-background p-4" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
          <TouchableOpacity
            onPress={handleFinish}
            style={[styles.finishButton, { backgroundColor: colors.success }]}
          >
            <Text className="text-white font-bold text-lg">
              Finalizar y Procesar ({photos.length})
            </Text>
          </TouchableOpacity>
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
  captureContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    padding: 4,
    backgroundColor: "white",
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 36,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  thumbnailContainer: {
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  finishButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
