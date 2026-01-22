import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  // Estados
  const [barcode, setBarcode] = useState(null); // El numero del codigo
  const [productPhoto, setProductPhoto] = useState(null); // La foto final del producto
  const [processedImage, setProcessedImage] = useState(null); // La imagen final sin fondo
  
  const [loadingBarcode, setLoadingBarcode] = useState(false); // Cargando lectura de barras
  const [loadingIA, setLoadingIA] = useState(false); // Cargando proceso de IA
  
  const [cameraError, setCameraError] = useState(null);

  const webcamRef = useRef(null);
  // Instanciamos el lector una sola vez
  const codeReader = useRef(new BrowserMultiFormatReader());


  // --- LÓGICA NUEVA: SACAR FOTO AL CÓDIGO DE BARRAS ---
  const captureAndReadBarcode = async () => {
    if (!webcamRef.current) return;
    
    setLoadingBarcode(true);
    // 1. Capturamos la imagen fija en alta calidad (PNG)
    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      try {
        console.log("Analizando foto del código...");
        // 2. Intentamos leer el código de esa imagen estática
        const result = await codeReader.current.decodeFromImage(undefined, imageSrc);
        console.log("¡Código encontrado!", result.text);
        setBarcode(result.text);
        // ¡Éxito! El estado 'barcode' cambiará la interfaz al siguiente paso.

      } catch (err) {
        console.error("No se pudo leer el código en la foto:", err);
        alert("❌ No se detectó ningún código en la foto.\n\nAsegúrate de:\n1. Que haya buena luz.\n2. Que la imagen no esté borrosa (aléjate un poco si es necesario).\n3. Que el código esté centrado.");
      } finally {
        setLoadingBarcode(false);
      }
    }
  };


  // --- LÓGICA FOTO PRODUCTO E IA (Igual que antes) ---
  const takeProductPhotoAndProcess = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setProductPhoto(imageSrc); // Guardamos la foto cruda y ocultamos cámara
    setLoadingIA(true);

    try {
      console.log("Iniciando IA...");
      // 1. IA Borrar fondo
      const blobSinFondo = await removeBackground(imageSrc);
      console.log("Fondo eliminado.");

      // 2. Procesar en Canvas para fondo blanco
      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF'; // Fondo blanco
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgBitmap, 0, 0); // Dibujar producto encima

      const finalUrl = canvas.toDataURL('image/png');
      setProcessedImage(finalUrl);
      
      // 3. Descargar
      downloadImage(finalUrl, barcode);

    } catch (error) {
      console.error("Error IA:", error);
      alert("Error al procesar la imagen con IA. Revisa la consola (F12).");
      // Si falla, permitimos reintentar volviendo a mostrar la cámara
      setProductPhoto(null);
    } finally {
      setLoadingIA(false);
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
    setProductPhoto(null);
    setProcessedImage(null);
    setLoadingBarcode(false);
    setLoadingIA(false);
  };

  // Configuración de cámara para intentar máxima calidad
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment"
  };

  return (
    <div className="container">
      <h1>Escáner v4 (Foto a Foto)</h1>

      {/* MOSTRAR CÁMARA SI: 
        1. No hay error de cámara Y
        2. (Aún no tenemos código de barras O Ya tenemos código pero aún no sacamos la foto del producto)
      */}
      {!cameraError && (!barcode || (barcode && !productPhoto)) && (
        <div className="camera-wrapper">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png" // PNG es clave para la nitidez
            videoConstraints={videoConstraints}
            className="webcam"
            onUserMediaError={(err) => setCameraError("No se pudo acceder a la cámara: " + err)}
          />
          {/* Guía visual */}
          <div className="overlay-guide"></div>
        </div>
      )}

      {cameraError && <p className="error">{cameraError}</p>}

      <div className="controls">
        
        {/* --- PASO 1: Capturar Código de Barras --- */}
        {!barcode && !loadingBarcode && (
          <div>
            <p>Paso 1: Apunta al código y sácale una foto.</p>
            <button className="btn-primary btn-large" onClick={captureAndReadBarcode}>
              📸 Sacar foto al Código de Barras
            </button>
          </div>
        )}
        {loadingBarcode && <div className="loading">🧐 Analizando foto en busca de códigos...</div>}


        {/* --- PASO 2: Capturar Producto --- */}
        {barcode && !productPhoto && (
          <div className="step-success">
            <h2>Código detectado: <span style={{color: '#28a745'}}>{barcode}</span></h2>
            <p>Paso 2: Ahora encuadra el producto completo.</p>
            <button className="btn-primary btn-large" onClick={takeProductPhotoAndProcess} disabled={loadingIA}>
              {loadingIA ? "Procesando IA..." : "📸 Sacar Foto Final del Producto"}
            </button>
          </div>
        )}
      </div>

      {loadingIA && <div className="loading">⏳ Eliminando fondo e insertando fondo blanco...</div>}

      {/* --- PASO 3: Resultado Final --- */}
      {processedImage && (
        <div className="result">
          <h3>¡Proceso Terminado!</h3>
          <img src={processedImage} alt="Resultado" className="preview-img" />
          <p>Archivo guardado: <strong>{barcode}.png</strong></p>
          <button onClick={reset} className="btn-secondary">Empezar Nuevo Producto</button>
        </div>
      )}
    </div>
  );
}

export default App;