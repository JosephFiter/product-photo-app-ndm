import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { processImages, uploadImage } from "@/lib/image-processing";

interface PhotoStatus {
  uri: string;
  number: number;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

export default function ProcessingScreen() {
  const { productCode, photoCount, photoUris } = useLocalSearchParams<{
    productCode: string;
    photoCount: string;
    photoUris: string;
  }>();
  const [photoStatuses, setPhotoStatuses] = useState<PhotoStatus[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!photoUris) return;

    try {
      const uris = JSON.parse(photoUris);
      const initialStatuses: PhotoStatus[] = uris.map((uri: string, index: number) => ({
        uri,
        number: index + 1,
        status: "pending",
      }));
      setPhotoStatuses(initialStatuses);
      
      // Start processing
      processPhotos(initialStatuses);
    } catch (error) {
      console.error("Error parsing photo URIs:", error);
    }
  }, [photoUris]);

  const processPhotos = async (statuses: PhotoStatus[]) => {
    for (let i = 0; i < statuses.length; i++) {
      // Update status to processing
      setPhotoStatuses(prev => 
        prev.map((photo, index) => 
          index === i ? { ...photo, status: "processing" } : photo
        )
      );

      try {
        // Simulate processing (remove background and upload)
        await processPhoto(statuses[i], productCode!);

        // Update status to completed
        setPhotoStatuses(prev => 
          prev.map((photo, index) => 
            index === i ? { ...photo, status: "completed" } : photo
          )
        );
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error(`Error processing photo ${i + 1}:`, error);
        
        // Update status to error
        setPhotoStatuses(prev => 
          prev.map((photo, index) => 
            index === i 
              ? { ...photo, status: "error", error: "Error al procesar" } 
              : photo
          )
        );
      }
    }

    // All photos processed
    setIsComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const processPhoto = async (photo: PhotoStatus, productCode: string): Promise<void> => {
    try {
      // Process image (remove background)
      const processed = await processImages(
        [photo.uri],
        productCode,
        undefined
      );

      if (processed.length === 0) {
        throw new Error("Failed to process image");
      }

      const processedImage = processed[0];

      // Upload to server (only on native, skip on web)
      if (Platform.OS !== "web") {
        const serverUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
        await uploadImage(
          processedImage.processedUri,
          processedImage.filename,
          serverUrl
        );
      }
    } catch (error) {
      console.error("Error processing photo:", error);
      throw error;
    }
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/");
  };

  const getStatusIcon = (status: PhotoStatus["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "processing":
        return "⚙️";
      case "completed":
        return "✅";
      case "error":
        return "❌";
    }
  };

  const getStatusText = (status: PhotoStatus["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "Procesando...";
      case "completed":
        return "Completado";
      case "error":
        return "Error";
    }
  };

  const completedCount = photoStatuses.filter(p => p.status === "completed").length;
  const totalCount = photoStatuses.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold text-foreground">
              {isComplete ? "¡Proceso Completado!" : "Procesando Fotos"}
            </Text>
            <Text className="text-muted text-center">
              Producto: {productCode}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-foreground font-semibold">
                Progreso
              </Text>
              <Text className="text-muted">
                {completedCount} / {totalCount}
              </Text>
            </View>
            <View 
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: colors.success,
                }}
              />
            </View>
          </View>

          {/* Photo List */}
          <View className="gap-3">
            {photoStatuses.map((photo, index) => (
              <View
                key={index}
                className="bg-surface rounded-xl p-4 flex-row items-center gap-3"
                style={{ borderColor: colors.border, borderWidth: 1 }}
              >
                <Text style={{ fontSize: 24 }}>
                  {getStatusIcon(photo.status)}
                </Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">
                    {productCode}_{photo.number}.jpg
                  </Text>
                  <Text className="text-muted text-sm">
                    {getStatusText(photo.status)}
                    {photo.error && ` - ${photo.error}`}
                  </Text>
                </View>
                {photo.status === "processing" && (
                  <ActivityIndicator color={colors.primary} />
                )}
              </View>
            ))}
          </View>

          {/* Completion Message */}
          {isComplete && (
            <View className="bg-success/10 rounded-xl p-4 items-center gap-2" style={{ borderColor: colors.success, borderWidth: 1 }}>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text className="text-foreground font-bold text-lg text-center">
                Todas las fotos han sido procesadas
              </Text>
              <Text className="text-muted text-center">
                Las imágenes con fondo blanco han sido subidas al servidor
              </Text>
            </View>
          )}

          {/* Finish Button */}
          {isComplete && (
            <TouchableOpacity
              onPress={handleFinish}
              style={[styles.finishButton, { backgroundColor: colors.primary }]}
            >
              <Text className="text-white font-bold text-lg">
                Volver al Inicio
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  finishButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
});
