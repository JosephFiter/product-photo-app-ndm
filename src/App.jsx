import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  // --- ESTADOS ---
  const [paso, setPaso] = useState('ESCANEAR_CODIGO');
  const [barcode, setBarcode] = useState(null);
  
  // Nuevo: Contador de fotos para el producto actual
  const [contadorFotos, setContadorFotos] = useState(0);
  const [ultinaFotoURL, setUltimaFotoURL] = useState(null); // Para mostrar miniatura de la ultima
  
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Configuración de cámara HD
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment"
  };

  // ---------------------------------------------------------
  // PASO 1: LEER CÓDIGO
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
        alert("⚠️ No encontré ningún código. Intenta acercarte o mejorar la luz.");
      }
    }
  };

  const reintentarEscaneo = () => {
    setBarcode(null);
    setPaso('ESCANEAR_CODIGO');
  };

  const confirmarYPasarAFoto = () => {
    // Inicializamos el contador en 0 para este nuevo producto
    setContadorFotos(0);
    setUltimaFotoURL(null);
    setPaso('TOMAR_FOTO_PRODUCTO');
  };

  // ---------------------------------------------------------
  // PASO 2: LOGICA DE MÚLTIPLES FOTOS
  // ---------------------------------------------------------
  const tomarFotoProductoYProcesar = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Mostramos estado de carga pero NO cambiamos de pantalla completa,
    // usamos un estado temporal o bloqueo de botón
    setPaso('PROCESANDO'); 

    try {
      // 1. Procesar IA
      const blobSinFondo = await removeBackground(imageSrc);

      // 2. Canvas fondo blanco
      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgBitmap, 0, 0);

      const finalUrl = canvas.toDataURL('image/png');
      
      // 3. Lógica de Nombres
      let nombreArchivo = "";
      if (contadorFotos === 0) {
        // Primera foto: "7791234.png"
        nombreArchivo = barcode;
      } else {
        // Siguientes: "7791234(1).png", "7791234(2).png"
        nombreArchivo = `${barcode}(${contadorFotos})`;
      }

      // 4. Descargar
      descargarImagen(finalUrl, nombreArchivo);
      
      // 5. Actualizar estados para la siguiente
      setContadorFotos(prev => prev + 1);
      setUltimaFotoURL(finalUrl); // Guardamos para mostrar "Última guardada"
      
      // Volvemos a habilitar la cámara para la siguiente foto
      setPaso('TOMAR_FOTO_PRODUCTO');

    } catch (error) {
      console.error(error);
      alert("Error en la IA. Intenta de nuevo.");
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
    // Reiniciar todo para el siguiente producto
    setBarcode(null);
    setContadorFotos(0);
    setUltimaFotoURL(null);
    setPaso('ESCANEAR_CODIGO');
  };

  return (
    <div className="container">
      <header className="app-header">
        {paso === 'ESCANEAR_CODIGO' && <h1>Escanear Nuevo Producto</h1>}
        {paso === 'CONFIRMAR_CODIGO' && <h1>Verificar</h1>}
        {(paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && (
          <h1>Fotos de: {barcode}</h1>
        )}
      </header>

      {/* VISOR CÁMARA */}
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
          {(paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && (
             <div className="overlay-product"></div>
          )}
          
          {/* Overlay de "Procesando" sobre la cámara */}
          {paso === 'PROCESANDO' && (
            <div className="overlay-loading">
              <div className="spinner"></div>
              <p>Guardando foto {contadorFotos === 0 ? "" : `(${contadorFotos})`}...</p>
            </div>
          )}
        </div>
      )}

      {/* CONTROLES */}
      <div className="controls-area">
        
        {/* PASO 1 */}
        {paso === 'ESCANEAR_CODIGO' && (
          <button className="btn-action" onClick={capturarYLeerCodigo}>
            📸 Escanear Código
          </button>
        )}

        {/* PASO 2: Confirmación */}
        {paso === 'CONFIRMAR_CODIGO' && (
          <div className="confirm-box">
            <h2>{barcode}</h2>
            <div className="btn-group">
              <button className="btn-secondary" onClick={reintentarEscaneo}>❌ Reintentar</button>
              <button className="btn-primary" onClick={confirmarYPasarAFoto}>✅ Aceptar</button>
            </div>
          </div>
        )}

        {/* PASO 3: FOTOS MÚLTIPLES */}
        {(paso === 'TOMAR_FOTO_PRODUCTO' || paso === 'PROCESANDO') && (
          <div className="photo-controls">
            
            {/* Botón de disparo */}
            <button 
              className="btn-action btn-green" 
              onClick={tomarFotoProductoYProcesar}
              disabled={paso === 'PROCESANDO'}
            >
              {paso === 'PROCESANDO' ? "Procesando..." : "📸 SACAR FOTO"}
            </button>

            {/* Info de fotos tomadas */}
            <div className="stats-box">
              <p>Fotos guardadas: <strong>{contadorFotos}</strong></p>
              {ultinaFotoURL && (
                <div className="mini-preview">
                  <img src={ultinaFotoURL} alt="Ultima" />
                  <span>Última guardada</span>
                </div>
              )}
            </div>

            {/* Botón para salir */}
            <button className="btn-secondary full-width" onClick={terminarProducto}>
              🏁 Terminar este producto / Escanear otro
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;