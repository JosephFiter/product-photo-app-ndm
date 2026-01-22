import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  BrowserMultiFormatReader, 
  NotFoundException, 
  BarcodeFormat, 
  DecodeHintType 
} from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  const [barcode, setBarcode] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const webcamRef = useRef(null);
  
  // CONFIGURACIÓN DEL LECTOR (Mejorada para códigos de barras)
  const codeReader = useRef(new BrowserMultiFormatReader());
  
  // Inicializamos el lector con "pistas" para que busque códigos de barras lineales
  useEffect(() => {
    const hints = new Map();
    // Agregamos formatos comunes de productos (EAN, UPC) y logística (Code 128)
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.CODE_128,
      BarcodeFormat.UPC_E
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReader.current = new BrowserMultiFormatReader(hints);
  }, []);

  const captureFrameForScan = useCallback(() => {
    if (webcamRef.current && !barcode) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        codeReader.current
          .decodeFromImage(undefined, imageSrc)
          .then((result) => {
            console.log("Detectado:", result.text);
            // Reproducir un sonido 'beep' opcional si quieres confirmar
            setBarcode(result.text);
          })
          .catch((err) => {
            // Ignoramos errores de "no encontrado" para no ensuciar la consola
            if (!(err instanceof NotFoundException)) {
              // console.warn(err); // Descomenta si quieres ver otros errores
            }
          });
      }
    }
  }, [barcode]);

  // Escanear cada 300ms
  useEffect(() => {
    const interval = setInterval(captureFrameForScan, 300);
    return () => clearInterval(interval);
  }, [captureFrameForScan]);

  const takePhotoAndProcess = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
    setLoading(true);

    try {
      // 1. Quitar fondo
      const blobSinFondo = await removeBackground(imageSrc);

      // 2. Procesar imagen en Canvas
      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');

      // 3. Fondo blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 4. Dibujar producto
      ctx.drawImage(imgBitmap, 0, 0);

      const finalUrl = canvas.toDataURL('image/png');
      setProcessedImage(finalUrl);
      
      downloadImage(finalUrl, barcode);

    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setBarcode(null);
    setPhoto(null);
    setProcessedImage(null);
  };

  // CONFIGURACIÓN DE VIDEO HD (CRÍTICO PARA CÓDIGOS DE BARRAS)
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Usa la cámara trasera en móviles
  };

  return (
    <div className="container">
      <h1>Escáner de Productos IA</h1>

      {!photo && (
        <div className="camera-wrapper">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam"
            onUserMediaError={() => setCameraError("No se pudo acceder a la cámara")}
          />
          {!barcode && (
            <div className="overlay-scan">
              <div className="red-line"></div>
              <p>Alinea el código aquí</p>
            </div>
          )}
        </div>
      )}

      {cameraError && <p className="error">{cameraError}</p>}

      <div className="controls">
        {!barcode ? (
          <p>Acerca o aleja la cámara lentamente...</p>
        ) : (
          <div className="step-success">
            <h2>¡Código detectado!</h2>
            <div className="barcode-display">{barcode}</div>
            <p>Ahora encuadra bien el producto para la foto:</p>
            {!photo && (
              <button className="btn-primary" onClick={takePhotoAndProcess} disabled={loading}>
                {loading ? "Procesando IA..." : "📸 Tomar Foto Final"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading && <div className="loading">⏳ Eliminando fondo... espera un momento.</div>}

      {processedImage && (
        <div className="result">
          <h3>¡Listo!</h3>
          <img src={processedImage} alt="Resultado" className="preview-img" />
          <p>Archivo: <strong>{barcode}.png</strong></p>
          <button onClick={reset} className="btn-secondary">Escanear otro</button>
        </div>
      )}
    </div>
  );
}

export default App;