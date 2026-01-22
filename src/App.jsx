import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
// CAMBIO IMPORTANTE AQUÍ: Usamos { removeBackground } entre llaves
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  const [barcode, setBarcode] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const captureFrameForScan = useCallback(() => {
    if (webcamRef.current && !barcode) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        codeReader.current
          .decodeFromImage(undefined, imageSrc)
          .then((result) => {
            console.log(result);
            setBarcode(result.text);
          })
          .catch((err) => {
            if (!(err instanceof NotFoundException)) {
              console.error(err);
            }
          });
      }
    }
  }, [barcode]);

  useEffect(() => {
    const interval = setInterval(captureFrameForScan, 500);
    return () => clearInterval(interval);
  }, [captureFrameForScan]);

  const takePhotoAndProcess = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
    setLoading(true);

    try {
      // CAMBIO IMPORTANTE AQUÍ: Llamamos a removeBackground directamente
      const blobSinFondo = await removeBackground(imageSrc);

      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgBitmap, 0, 0);

      const finalUrl = canvas.toDataURL('image/png');
      setProcessedImage(finalUrl);
      
      downloadImage(finalUrl, barcode);

    } catch (error) {
      console.error("Error procesando imagen:", error);
      alert("Hubo un error al eliminar el fondo. Revisa la consola.");
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

  return (
    <div className="container">
      <h1>Escáner de Productos IA</h1>

      {!photo && (
        <div className="camera-wrapper">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="webcam"
            onUserMediaError={() => setCameraError("No se pudo acceder a la cámara")}
          />
          {!barcode && <div className="overlay-scan">Escanea el código de barras aquí</div>}
        </div>
      )}

      {cameraError && <p className="error">{cameraError}</p>}

      <div className="controls">
        {!barcode ? (
          <p>Apunta la cámara al código de barras...</p>
        ) : (
          <div className="step-success">
            <h2>Código: {barcode}</h2>
            {!photo && (
              <button className="btn-primary" onClick={takePhotoAndProcess} disabled={loading}>
                {loading ? "Procesando IA..." : "📸 Tomar Foto y Procesar"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading && <div className="loading">⏳ Eliminando fondo (esto puede tardar unos segundos)...</div>}

      {processedImage && (
        <div className="result">
          <h3>¡Listo!</h3>
          <img src={processedImage} alt="Resultado" className="preview-img" />
          <p>Guardado como: <strong>{barcode}.png</strong></p>
          <button onClick={reset} className="btn-secondary">Nuevo Producto</button>
        </div>
      )}
    </div>
  );
}

export default App;