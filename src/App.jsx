import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  const [barcode, setBarcode] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const webcamRef = useRef(null);
  // Instanciamos el lector UNA sola vez, sin filtros complicados
  const codeReader = useRef(new BrowserMultiFormatReader());

  const captureFrameForScan = useCallback(() => {
    // Si la cámara está activa y aún no tenemos código
    if (webcamRef.current && !barcode) {
      // Usamos getScreenshot pero esperamos que sea PNG para mejor calidad de líneas
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        codeReader.current
          .decodeFromImage(undefined, imageSrc)
          .then((result) => {
            console.log("¡CÓDIGO ENCONTRADO!", result.text);
            setBarcode(result.text); 
          })
          .catch((err) => {
            // NotFoundException es normal (significa que en este frame no vio nada)
            // Cualquier otro error lo mostramos en consola
            if (!(err instanceof NotFoundException)) {
              console.error("Error del lector:", err);
            }
          });
      }
    }
  }, [barcode]);

  // Intentar escanear cada 400ms
  useEffect(() => {
    if (!barcode) {
      const interval = setInterval(captureFrameForScan, 400);
      return () => clearInterval(interval);
    }
  }, [captureFrameForScan, barcode]);

  const takePhotoAndProcess = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
    setLoading(true);

    try {
      console.log("Iniciando eliminación de fondo...");
      const blobSinFondo = await removeBackground(imageSrc);
      console.log("Fondo eliminado.");

      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');

      // Fondo Blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar imagen
      ctx.drawImage(imgBitmap, 0, 0);

      const finalUrl = canvas.toDataURL('image/png');
      setProcessedImage(finalUrl);
      
      downloadImage(finalUrl, barcode);

    } catch (error) {
      console.error("Error procesando imagen:", error);
      alert("Error al procesar la imagen (Revisa la consola con F12).");
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

  // Forzamos alta resolución. Si tu cámara no soporta HD, bajará automáticamente.
  const videoConstraints = {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    facingMode: "environment"
  };

  return (
    <div className="container">
      <h1>Escáner v3 (Sin Filtros)</h1>

      {!photo && (
        <div className="camera-wrapper">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png" // PNG es mejor para leer códigos de barras
            videoConstraints={videoConstraints}
            className="webcam"
            onUserMediaError={(err) => setCameraError("Error de cámara: " + err)}
          />
          {!barcode && (
            <div className="overlay-scan">
              <div className="red-line"></div>
              <p>Escaneando...</p>
            </div>
          )}
        </div>
      )}

      {cameraError && <p className="error">{cameraError}</p>}

      <div className="controls">
        {!barcode ? (
          <p>Acerca el código hasta que se vea nítido.</p>
        ) : (
          <div className="step-success">
            <h2>CÓDIGO: <span style={{color: 'green'}}>{barcode}</span></h2>
            <p>Ahora toma la foto del producto:</p>
            {!photo && (
              <button className="btn-primary" onClick={takePhotoAndProcess} disabled={loading}>
                {loading ? "Procesando IA..." : "📸 Tomar Foto Final"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading && <div className="loading">⏳ Eliminando fondo...</div>}

      {processedImage && (
        <div className="result">
          <h3>¡Listo!</h3>
          <img src={processedImage} alt="Resultado" className="preview-img" />
          <p>Archivo: <strong>{barcode}.png</strong></p>
          <button onClick={reset} className="btn-secondary">Siguiente</button>
        </div>
      )}
    </div>
  );
}

export default App;