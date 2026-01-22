import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { removeBackground } from '@imgly/background-removal';
import './App.css';

function App() {
  // --- ESTADOS DE LA APP ---
  // Paso 1: 'ESCANEAR_CODIGO'
  // Paso 2: 'CONFIRMAR_CODIGO' (Vemos el numero y decidimos si pasar a la foto)
  // Paso 3: 'TOMAR_FOTO_PRODUCTO' (Aquí sacamos la foto real)
  // Paso 4: 'PROCESANDO' (IA trabajando)
  // Paso 5: 'TERMINADO'
  const [paso, setPaso] = useState('ESCANEAR_CODIGO');
  
  const [barcode, setBarcode] = useState(null);
  const [imagenFinal, setImagenFinal] = useState(null);
  
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // --- CONFIGURACIÓN DE CÁMARA (Maxima calidad posible) ---
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment"
  };

  // ---------------------------------------------------------
  // PASO 1: LEER EL CÓDIGO DE BARRAS (No borra fondo aqui)
  // ---------------------------------------------------------
  const capturarYLeerCodigo = async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        // Intentamos leer el código de la imagen estática
        const result = await codeReader.current.decodeFromImage(undefined, imageSrc);
        
        // ¡ÉXITO! Guardamos el numero y cambiamos de paso
        setBarcode(result.text);
        setPaso('CONFIRMAR_CODIGO'); 
        
      } catch (err) {
        console.log("No se detectó código en esta foto.");
        alert("⚠️ No encontré ningún código de barras en la foto.\n\nIntenta:\n- Acercarte un poco más.\n- Que haya buena luz.\n- Que el código esté derecho.");
      }
    }
  };

  // ---------------------------------------------------------
  // PASO 2: CONFIRMACIÓN
  // ---------------------------------------------------------
  const confirmarYPasarAFoto = () => {
    setPaso('TOMAR_FOTO_PRODUCTO');
  };

  const reintentarEscaneo = () => {
    setBarcode(null);
    setPaso('ESCANEAR_CODIGO');
  };

  // ---------------------------------------------------------
  // PASO 3: FOTO AL PRODUCTO (Aquí SI borramos fondo)
  // ---------------------------------------------------------
  const tomarFotoProductoYProcesar = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPaso('PROCESANDO');

    try {
      // 1. Usamos la IA para borrar fondo de ESTA imagen
      const blobSinFondo = await removeBackground(imageSrc);

      // 2. Crear Canvas para poner fondo blanco
      const imgBitmap = await createImageBitmap(blobSinFondo);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');

      // 3. Pintar blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 4. Poner el producto encima
      ctx.drawImage(imgBitmap, 0, 0);

      // 5. Guardar
      const finalUrl = canvas.toDataURL('image/png');
      setImagenFinal(finalUrl);
      
      // 6. Descargar con el nombre del código
      descargarImagen(finalUrl, barcode);
      
      setPaso('TERMINADO');

    } catch (error) {
      console.error(error);
      alert("Error en la IA. Revisa la consola.");
      setPaso('TOMAR_FOTO_PRODUCTO'); // Volver a intentar
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

  const reiniciarTodo = () => {
    setBarcode(null);
    setImagenFinal(null);
    setPaso('ESCANEAR_CODIGO');
  };

  return (
    <div className="container">
      {/* HEADER SEGÚN EL PASO */}
      <header className="app-header">
        {paso === 'ESCANEAR_CODIGO' && <h1>Paso 1: Escanear Código</h1>}
        {paso === 'CONFIRMAR_CODIGO' && <h1>Confirmar Código</h1>}
        {paso === 'TOMAR_FOTO_PRODUCTO' && <h1>Paso 2: Foto del Producto</h1>}
        {paso === 'PROCESANDO' && <h1>Procesando...</h1>}
        {paso === 'TERMINADO' && <h1>¡Listo!</h1>}
      </header>

      {/* VISOR DE CÁMARA (Solo visible en pasos de captura) */}
      {(paso === 'ESCANEAR_CODIGO' || paso === 'TOMAR_FOTO_PRODUCTO') && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            className="webcam-view"
          />
          {/* Guias visuales distintas para cada paso */}
          {paso === 'ESCANEAR_CODIGO' ? (
             <div className="overlay-barcode">
               <p>Apunta al Código de Barras</p>
               <div className="linea-roja"></div>
             </div>
          ) : (
             <div className="overlay-product">
               <p>Encuadra el Producto completo</p>
             </div>
          )}
        </div>
      )}

      {/* CONTROLES E INSTRUCCIONES */}
      <div className="controls-area">
        
        {/* -- CONTROLES PASO 1 -- */}
        {paso === 'ESCANEAR_CODIGO' && (
          <button className="btn-action" onClick={capturarYLeerCodigo}>
            📸 Capturar Código
          </button>
        )}

        {/* -- CONTROLES PASO 2 (Intermedio) -- */}
        {paso === 'CONFIRMAR_CODIGO' && (
          <div className="confirm-box">
            <p>Código detectado:</p>
            <h2 className="code-text">{barcode}</h2>
            <div className="btn-group">
              <button className="btn-secondary" onClick={reintentarEscaneo}>❌ No, reintentar</button>
              <button className="btn-primary" onClick={confirmarYPasarAFoto}>✅ Sí, ir a foto producto</button>
            </div>
          </div>
        )}

        {/* -- CONTROLES PASO 3 -- */}
        {paso === 'TOMAR_FOTO_PRODUCTO' && (
          <div className="photo-controls">
            <p className="info-text">El archivo se guardará como: <strong>{barcode}.png</strong></p>
            <button className="btn-action btn-green" onClick={tomarFotoProductoYProcesar}>
              📸 SACAR FOTO Y BORRAR FONDO
            </button>
          </div>
        )}

        {/* -- PANTALLA DE CARGA -- */}
        {paso === 'PROCESANDO' && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Eliminando fondo con IA...</p>
            <p><small>Esto puede tardar unos segundos.</small></p>
          </div>
        )}

        {/* -- RESULTADO FINAL -- */}
        {paso === 'TERMINADO' && imagenFinal && (
          <div className="result-box">
            <img src={imagenFinal} alt="Resultado" className="final-img" />
            <p>Guardado: <strong>{barcode}.png</strong></p>
            <button className="btn-primary" onClick={reiniciarTodo}>🔄 Siguiente Producto</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;