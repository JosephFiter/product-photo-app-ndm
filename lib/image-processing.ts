import * as FileSystem from "expo-file-system/legacy";

export interface ProcessedImage {
  originalUri: string;
  processedUri: string;
  filename: string;
}

/**
 * Remove background from image using remove.bg API or alternative
 * 
 * Note: This requires an API key from remove.bg or similar service.
 * For production use, you need to:
 * 1. Sign up at https://www.remove.bg/users/sign_up
 * 2. Get your API key from https://www.remove.bg/api
 * 3. Add the API key to your environment variables
 * 
 * Alternative free options:
 * - Photoroom API: https://www.photoroom.com/api (200 free credits)
 * - Claid.ai: https://claid.ai/api-products/background-removal/
 * - Runware: https://runware.ai/docs/tools/remove-background
 */
export async function removeBackground(imageUri: string): Promise<string> {
  try {
    // Read the image file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // TODO: Replace with actual API key from environment variables
    const apiKey = process.env.REMOVE_BG_API_KEY || "YOUR_API_KEY_HERE";

    if (apiKey === "YOUR_API_KEY_HERE") {
      console.warn("No API key configured for background removal. Returning original image.");
      // For demo purposes, return the original image
      return imageUri;
    }

    // Call remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: "auto",
        format: "png", // PNG supports transparency
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Get the processed image as blob
    const blob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/png;base64, prefix
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(blob);
    
    const processedBase64 = await base64Promise;

    // Save the processed image to a temporary file
    const filename = `processed_${Date.now()}.png`;
    const processedUri = `${FileSystem.cacheDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(processedUri, processedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return processedUri;
  } catch (error) {
    console.error("Error removing background:", error);
    // Return original image if processing fails
    return imageUri;
  }
}

/**
 * Process multiple images with background removal
 */
export async function processImages(
  imageUris: string[],
  productCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const originalUri = imageUris[i];
    const photoNumber = i + 1;
    const filename = `${productCode}_${photoNumber}.png`;

    // Report progress
    if (onProgress) {
      onProgress(i + 1, imageUris.length);
    }

    try {
      // Remove background
      const processedUri = await removeBackground(originalUri);

      results.push({
        originalUri,
        processedUri,
        filename,
      });
    } catch (error) {
      console.error(`Error processing image ${photoNumber}:`, error);
      // Still add to results with original image
      results.push({
        originalUri,
        processedUri: originalUri,
        filename,
      });
    }
  }

  return results;
}

/**
 * Upload processed image to server
 */
export async function uploadImage(
  imageUri: string,
  filename: string,
  serverUrl: string
): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    
    // Read file and create blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    formData.append("file", blob, filename);
    formData.append("filename", filename);

    // Upload to server
    const uploadResponse = await fetch(`${serverUrl}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    return result.url || result.path;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
