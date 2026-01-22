import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  // --- ESTADOS ---
  const [paso, setPaso] = useState('ESCANEAR_CODIGO');
  const [barcode, setBarcode] = useState(null);
  const [manualCode, setManualCode] = useState(""); // <--- NUEVO: Para input manual
  
  // Contador de fotos
  const [contadorFotos, setContadorFotos] = useState(0);
  const [ultinaFotoURL, setUltimaFotoURL] = useState(null);
  
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment"
  };

  // ---------------------------------------------------------
  // LÓGICA DE ESCANEO
  // ---------------------------------------------------------
  const capturarYLeerCodigo = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        const result = await codeReader.current.decodeFromImage(undefined, imageSrc);
        setBarcode(result.text);
        setPaso('CONFIRMAR_CODIGO'); 
      } catch (err) {
        alert("⚠️ No se detectó código. Intenta escribirlo manualmente abajo si no funciona.");
      }
    }
  };

  // ---------------------------------------------------------
  // NUEVO: LÓGICA MANUAL (Inspirada en tu código)
  // ---------------------------------------------------------
  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      alert("Por favor ingresa un código.");
      return;
    }
    setBarcode(manualCode.trim());
    setPaso('CONFIRMAR_CODIGO');
    setManualCode(""); // Limpiar input
  };

  const confirmarYPasarAFoto = () => {
    setContadorFotos(0);
    setUltimaFotoURL(null);
    setPaso('TOMAR_FOTO_PRODUCTO');
  };

  const reintentarEscaneo = () => {
    setBarcode(null);
    setPaso('ESCANEAR_CODIGO');
  };

  // ---------------------------------------------------------
  // LÓGICA FOTO PRODUCTO
  // ---------------------------------------------------------
  const tomarFotoProductoYProcesar = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPaso('PROCESANDO'); 

    try {
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
      
      let nombreArchivo = contadorFotos === 0 ? barcode : `${barcode}(${contadorFotos})`;
      descargarImagen(finalUrl, nombreArchivo);
      
      setContadorFotos(prev => prev + 1);
      setUltimaFotoURL(finalUrl);
      setPaso('TOMAR_FOTO_PRODUCTO');

    } catch (error) {
      console.error(error);
      alert("Error IA.");
      setPaso('TOMAR_FOTO_PRODUCTO');
    }
  };

  const descargarImagen = (url, nombre) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombre}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const terminarProducto = () => {
    setBarcode(null);
    setContadorFotos(0);
    setUltimaFotoURL(null);
    setPaso('ESCANEAR_CODIGO');
  };

  return (
    <div className="container">
      <header className="app-header">
        {paso === 'ESCANEAR_CODIGO' && <h1>Escanear o Ingresar</h1>}
        {(paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && <h1>Fotos de: {barcode}</h1>}
      </header>

      {/* CÁMARA */}
      {(paso === 'ESCANEAR_CODIGO' || paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            className="webcam-view"
          />
          {paso === 'ESCANEAR_CODIGO' && (
             <div className="overlay-barcode"><div className="linea-roja"></div></div>
          )}
          {paso === 'PROCESANDO' && (
            <div className="overlay-loading">
              <div className="spinner"></div>
              <p>Guardando foto...</p>
            </div>
          )}
        </div>
      )}

      {/* ZONA DE CONTROLES */}
      <div className="controls-area">
        
        {/* PASO 1: Escanear O Manual */}
        {paso === 'ESCANEAR_CODIGO' && (
          <div className="scan-section">
            <button className="btn-action" onClick={capturarYLeerCodigo}>
              📸 Escanear con Cámara
            </button>
            
            <div className="divider"><span>O ingresa manual</span></div>
            
            <div className="manual-input-box">
              <input 
                type="text" 
                placeholder="Ej: 779123456" 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="input-manual"
              />
              <button className="btn-secondary" onClick={handleManualSubmit}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Confirmar */}
        {paso === 'CONFIRMAR_CODIGO' && (
          <div className="confirm-box">
            <p>Producto:</p>
            <h2>{barcode}</h2>
            <div className="btn-group">
              <button className="btn-secondary" onClick={reintentarEscaneo}>❌ Corregir</button>
              <button className="btn-primary" onClick={confirmarYPasarAFoto}>✅ Aceptar</button>
            </div>
          </div>
        )}

        {/* PASO 3: Fotos */}
        {(paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && (
          <div className="photo-controls">
            <button 
              className="btn-action btn-green" 
              onClick={tomarFotoProductoYProcesar}
              disabled={paso === 'PROCESANDO'}
            >
              {paso === 'PROCESANDO' ? "Procesando..." : "📸 SACAR FOTO"}
            </button>

            <div className="stats-box">
              <p>Fotos: <strong>{contadorFotos}</strong></p>
              {ultinaFotoURL && <img src={ultinaFotoURL} alt="Mini" className="mini-thumb"/>}
            </div>

            <button className="btn-secondary full-width" onClick={terminarProducto}>
              🏁 Finalizar Producto
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;