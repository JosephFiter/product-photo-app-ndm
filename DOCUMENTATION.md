# Product Photo Scanner - Documentación Completa

**Autor:** Manus AI  
**Fecha:** 21 de enero de 2026  
**Versión:** 1.0.0

---

## Resumen Ejecutivo

**Product Photo Scanner** es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios escanear códigos de barras de productos, capturar múltiples fotografías, procesar automáticamente las imágenes con fondo blanco y subirlas a un servidor con nomenclatura estandarizada. La aplicación está diseñada para optimizar el flujo de trabajo de fotografía de productos en entornos comerciales, eliminando la necesidad de procesamiento manual posterior.

La solución integra tecnologías de escaneo de códigos de barras, captura de imágenes de alta calidad, procesamiento de imágenes mediante APIs de inteligencia artificial y almacenamiento centralizado en servidor. El sistema genera automáticamente nombres de archivo siguiendo el patrón `{codigo_producto}_{numero}.png`, facilitando la organización y búsqueda de imágenes en catálogos de productos.

---

## Arquitectura del Sistema

La aplicación sigue una arquitectura cliente-servidor moderna con los siguientes componentes principales:

### Componentes del Cliente (Aplicación Móvil)

El cliente móvil está construido con **Expo SDK 54** y **React Native 0.81**, utilizando **TypeScript 5.9** para garantizar la seguridad de tipos. La interfaz de usuario implementa **NativeWind 4**, que proporciona soporte completo de Tailwind CSS en React Native, permitiendo un desarrollo rápido con estilos consistentes.

La navegación se gestiona mediante **Expo Router 6**, que ofrece navegación basada en el sistema de archivos similar a Next.js. Las pantallas principales incluyen:

- **Pantalla Principal (Home)**: Punto de entrada con botón prominente para iniciar el escaneo
- **Pantalla de Escáner**: Captura de códigos de barras con entrada manual como alternativa
- **Pantalla de Cámara**: Captura múltiple de fotos con vista previa en tiempo real
- **Pantalla de Procesamiento**: Visualización del progreso de procesamiento y subida

### Componentes del Servidor

El servidor backend está implementado con **Express.js** y proporciona los siguientes servicios:

**Endpoint de Subida de Imágenes** (`/api/upload`): Recibe imágenes procesadas desde la aplicación móvil utilizando **multer** para el manejo de archivos multipart. Las imágenes se almacenan en el directorio `uploads/products/` con el nombre de archivo especificado por el cliente.

**Servicio de Archivos Estáticos** (`/uploads`): Permite el acceso directo a las imágenes subidas mediante URLs HTTP, facilitando la integración con sistemas de gestión de contenido y plataformas de comercio electrónico.

**API REST**: Proporciona operaciones CRUD completas para gestionar imágenes, incluyendo listado, consulta de información y eliminación.

### Procesamiento de Imágenes

El procesamiento de fondo blanco se implementa mediante integración con servicios de inteligencia artificial especializados. La arquitectura soporta múltiples proveedores de API:

**Remove.bg**: Servicio líder en remoción de fondos con alta precisión. Requiere API key disponible en [remove.bg/api](https://www.remove.bg/api).

**Photoroom**: Alternativa con 200 créditos gratuitos y opción de marca de agua ilimitada. Documentación disponible en [photoroom.com/api](https://www.photoroom.com/api).

**Claid.ai**: Servicio optimizado para fotografía de productos con URLs de salida hospedadas. Más información en [claid.ai/api-products/background-removal](https://claid.ai/api-products/background-removal/).

La implementación actual incluye un sistema de fallback que retorna la imagen original si no se configura una API key, permitiendo el funcionamiento básico sin dependencias externas.

---

## Flujo de Trabajo del Usuario

El proceso completo de captura y procesamiento de imágenes sigue estos pasos secuenciales:

### 1. Inicio y Escaneo

El usuario abre la aplicación y es recibido por la pantalla principal que muestra estadísticas del día (productos fotografiados y número total de fotos). Al tocar el botón "Escanear Código de Barras", la aplicación solicita permisos de cámara si es la primera vez.

La pantalla de escáner activa la cámara trasera del dispositivo y muestra un overlay con guías visuales para alinear el código de barras. El sistema detecta automáticamente códigos en los siguientes formatos: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, Code 93, Codabar e ITF-14.

Cuando se detecta un código válido, la aplicación proporciona feedback háptico (vibración) y visual (cambio de color del marco a verde), y navega automáticamente a la pantalla de captura. Si el escaneo automático falla, el usuario puede ingresar el código manualmente mediante un campo de texto en la parte inferior de la pantalla.

### 2. Captura de Fotografías

La pantalla de captura muestra el código de producto en un encabezado azul junto con un contador de fotos tomadas. La vista previa de la cámara ocupa la mayor parte de la pantalla, con un botón de captura circular prominente en la parte inferior central.

Cada vez que el usuario toca el botón de captura, la aplicación:

1. Proporciona feedback háptico medio
2. Captura la foto con calidad 0.8 (balance entre calidad y tamaño de archivo)
3. Incrementa el contador automáticamente
4. Agrega una miniatura a un carrusel horizontal en la parte inferior

Las miniaturas muestran un badge con el número de foto, permitiendo al usuario verificar visualmente el orden de captura. Tocar una miniatura permite eliminar esa foto específica si se desea retomar.

El usuario puede capturar tantas fotos como necesite del mismo producto. Cuando finaliza, toca el botón "Finalizar y Procesar" que muestra el número total de fotos capturadas.

### 3. Procesamiento y Subida

La pantalla de procesamiento muestra una barra de progreso global y una lista detallada de cada foto con su estado actual:

- **Pendiente** (⏳): Foto en cola esperando procesamiento
- **Procesando** (⚙️): Remoción de fondo en progreso
- **Completado** (✅): Foto procesada y subida exitosamente
- **Error** (❌): Fallo en procesamiento o subida

El procesamiento ocurre secuencialmente para cada foto:

1. **Remoción de fondo**: La imagen se envía a la API de procesamiento seleccionada
2. **Conversión a PNG**: El resultado se guarda en formato PNG para preservar transparencia
3. **Nomenclatura**: Se asigna el nombre `{codigo}_{numero}.png`
4. **Subida al servidor**: La imagen procesada se envía al endpoint `/api/upload`

Cuando todas las fotos se procesan exitosamente, aparece un mensaje de confirmación con emoji de celebración y un botón para regresar a la pantalla principal.

---

## Configuración y Despliegue

### Requisitos Previos

Para ejecutar y desarrollar la aplicación se requieren las siguientes herramientas:

- **Node.js 22.13.0** o superior
- **pnpm 9.12.0** (gestor de paquetes)
- **Expo CLI** (instalado automáticamente)
- **Cuenta de Expo** (para pruebas en dispositivos físicos)

### Instalación Local

```bash
# Clonar el repositorio
cd product-photo-app

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

El comando `pnpm dev` inicia dos procesos concurrentes:

1. **Servidor backend** en puerto 3000 (o el primer puerto disponible)
2. **Metro bundler** en puerto 8081 para la aplicación móvil

### Configuración de API de Procesamiento

Para habilitar la remoción automática de fondo, se debe configurar una API key:

1. Registrarse en el servicio seleccionado (remove.bg, Photoroom, etc.)
2. Obtener la API key desde el panel de desarrollador
3. Crear archivo `.env` en la raíz del proyecto:

```env
REMOVE_BG_API_KEY=tu_api_key_aqui
```

4. Reiniciar el servidor de desarrollo

**Nota importante**: Sin configurar una API key, la aplicación funcionará normalmente pero las imágenes no tendrán el fondo removido. Esto permite probar el flujo completo sin dependencias externas.

### Pruebas en Dispositivos

#### iOS (iPhone/iPad)

1. Instalar **Expo Go** desde App Store
2. Escanear el código QR mostrado en la terminal con la cámara nativa
3. La aplicación se abrirá automáticamente en Expo Go

#### Android

1. Instalar **Expo Go** desde Google Play Store
2. Escanear el código QR desde la aplicación Expo Go
3. Esperar a que se cargue el bundle de JavaScript

#### Web (Desarrollo)

La aplicación también funciona en navegadores web para pruebas rápidas:

```bash
pnpm dev
# Abrir http://localhost:8081 en el navegador
```

**Limitación**: La funcionalidad de cámara y escaneo de códigos de barras tiene soporte limitado en navegadores web.

### Despliegue en Producción

Para desplegar la aplicación en producción:

1. **Crear checkpoint** desde la interfaz de usuario de Manus
2. **Hacer clic en "Publish"** en el panel de gestión
3. La aplicación se desplegará automáticamente

Para compilar binarios nativos (APK/IPA):

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

Se requiere una cuenta de **Expo Application Services (EAS)** para compilaciones nativas.

---

## Estructura del Proyecto

```
product-photo-app/
├── app/                          # Pantallas de la aplicación (Expo Router)
│   ├── (tabs)/                   # Navegación por pestañas
│   │   ├── _layout.tsx          # Configuración de pestañas
│   │   └── index.tsx            # Pantalla principal
│   ├── scanner.tsx              # Pantalla de escaneo de códigos
│   ├── camera.tsx               # Pantalla de captura de fotos
│   └── processing.tsx           # Pantalla de procesamiento
├── components/                   # Componentes reutilizables
│   ├── screen-container.tsx     # Contenedor con SafeArea
│   └── ui/                      # Componentes de interfaz
├── lib/                         # Lógica de negocio
│   ├── image-processing.ts      # Procesamiento y subida de imágenes
│   ├── utils.ts                 # Utilidades generales
│   └── trpc.ts                  # Cliente API
├── server/                      # Servidor backend
│   ├── _core/                   # Configuración del servidor
│   │   └── index.ts            # Punto de entrada
│   └── routes/                  # Rutas API
│       └── upload.ts           # Endpoint de subida
├── assets/                      # Recursos estáticos
│   └── images/                  # Iconos y logos
├── theme.config.js              # Configuración de colores
├── app.config.ts                # Configuración de Expo
└── package.json                 # Dependencias del proyecto
```

---

## API del Servidor

### POST /api/upload

Sube una imagen procesada al servidor.

**Request:**

```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data

file: [binary data]
filename: "PROD123_1.png"
```

**Response (200 OK):**

```json
{
  "success": true,
  "filename": "PROD123_1.png",
  "path": "/uploads/products/PROD123_1.png",
  "url": "http://localhost:3000/uploads/products/PROD123_1.png",
  "size": 245678,
  "mimetype": "image/png"
}
```

**Response (400 Bad Request):**

```json
{
  "error": "No file uploaded"
}
```

### GET /api/upload/list

Lista todas las imágenes subidas.

**Response (200 OK):**

```json
{
  "success": true,
  "files": [
    {
      "filename": "PROD123_1.png",
      "path": "/uploads/products/PROD123_1.png",
      "url": "http://localhost:3000/uploads/products/PROD123_1.png",
      "size": 245678,
      "created": "2026-01-21T15:30:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/upload/:filename

Obtiene información sobre una imagen específica.

**Response (200 OK):**

```json
{
  "success": true,
  "filename": "PROD123_1.png",
  "path": "/uploads/products/PROD123_1.png",
  "url": "http://localhost:3000/uploads/products/PROD123_1.png",
  "size": 245678,
  "created": "2026-01-21T15:30:00.000Z"
}
```

**Response (404 Not Found):**

```json
{
  "error": "File not found"
}
```

### DELETE /api/upload/:filename

Elimina una imagen del servidor.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Personalización y Extensión

### Modificar Colores del Tema

Los colores se definen en `theme.config.js`:

```javascript
const themeColors = {
  primary: { light: '#2563EB', dark: '#3B82F6' },
  background: { light: '#FFFFFF', dark: '#0F172A' },
  surface: { light: '#F8FAFC', dark: '#1E293B' },
  // ... más colores
};
```

Los cambios se aplican automáticamente en toda la aplicación gracias a NativeWind.

### Agregar Nuevos Formatos de Código de Barras

En `app/scanner.tsx`, modificar la propiedad `barcodeTypes`:

```typescript
barcodeScannerSettings={{
  barcodeTypes: [
    "ean13",
    "qr",        // Agregar QR codes
    "aztec",     // Agregar Aztec codes
    // ... más formatos
  ],
}}
```

### Cambiar Proveedor de Procesamiento de Imágenes

En `lib/image-processing.ts`, modificar la función `removeBackground`:

```typescript
// Ejemplo: Cambiar a Photoroom API
const response = await fetch("https://api.photoroom.com/v1/remove-background", {
  method: "POST",
  headers: {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image_file_b64: base64,
  }),
});
```

### Integrar con Almacenamiento en la Nube

Para subir imágenes directamente a S3, Google Cloud Storage o Azure Blob:

1. Instalar SDK correspondiente:

```bash
pnpm add @aws-sdk/client-s3  # Para AWS S3
```

2. Modificar `lib/image-processing.ts`:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(imageUri: string, filename: string) {
  const s3 = new S3Client({ region: "us-east-1" });
  
  // Leer imagen como buffer
  const response = await fetch(imageUri);
  const buffer = await response.arrayBuffer();
  
  // Subir a S3
  await s3.send(new PutObjectCommand({
    Bucket: "mi-bucket",
    Key: `productos/${filename}`,
    Body: Buffer.from(buffer),
    ContentType: "image/png",
  }));
  
  return `https://mi-bucket.s3.amazonaws.com/productos/${filename}`;
}
```

---

## Solución de Problemas

### La cámara no funciona en iOS

**Problema**: La aplicación solicita permisos pero la cámara no se activa.

**Solución**: Verificar que los permisos estén configurados en `app.config.ts`:

```typescript
ios: {
  infoPlist: {
    NSCameraUsageDescription: "Necesitamos acceso a tu cámara para escanear códigos de barras y tomar fotos de productos."
  }
}
```

### Las imágenes no se suben al servidor

**Problema**: El procesamiento completa pero las imágenes no aparecen en el servidor.

**Solución**:

1. Verificar que el servidor esté ejecutándose en el puerto correcto
2. Comprobar la URL del servidor en `app/processing.tsx`
3. Revisar logs del servidor para errores de CORS o permisos de escritura

### El escaneo de códigos de barras es lento

**Problema**: La detección de códigos tarda varios segundos.

**Solución**:

1. Reducir el número de formatos de código en `barcodeScannerSettings`
2. Mejorar la iluminación del entorno
3. Asegurar que el código de barras esté limpio y sin daños

### Error "No API key configured"

**Problema**: Las imágenes no tienen el fondo removido.

**Solución**: Configurar la API key en el archivo `.env` como se describe en la sección de configuración. Sin API key, la aplicación funcionará pero no procesará los fondos.

---

## Limitaciones Conocidas

### Procesamiento en Tiempo Real

El procesamiento de imágenes ocurre secuencialmente, no en paralelo. Para sesiones con muchas fotos (más de 10), el tiempo de procesamiento puede ser considerable. Una mejora futura podría implementar procesamiento en lote con workers paralelos.

### Almacenamiento Local

Las imágenes se almacenan en el sistema de archivos del servidor sin compresión adicional. Para entornos de producción con alto volumen, se recomienda implementar:

- Compresión automática de imágenes
- Limpieza periódica de archivos antiguos
- Migración a almacenamiento en la nube (S3, GCS)

### Funcionalidad Offline

La aplicación requiere conexión a internet para el procesamiento de imágenes y la subida al servidor. No hay soporte actual para modo offline con sincronización posterior.

### Límites de API

Los servicios de procesamiento de imágenes tienen límites de uso:

- **Remove.bg**: 50 llamadas gratuitas al mes
- **Photoroom**: 200 créditos gratuitos
- **Claid.ai**: Varía según el plan

Se recomienda monitorear el uso y considerar planes de pago para producción.

---

## Roadmap Futuro

### Funcionalidades Planificadas

**Galería de Productos**: Pantalla para visualizar todas las fotos de un producto específico, con opciones de descarga en lote y compartir.

**Historial de Sesiones**: Registro persistente de todas las sesiones de fotografía con fechas, códigos de producto y número de fotos capturadas.

**Edición Básica**: Herramientas para recortar, rotar y ajustar brillo/contraste antes del procesamiento.

**Sincronización en la Nube**: Backup automático de imágenes en servicios de almacenamiento en la nube con acceso desde múltiples dispositivos.

**Modo Offline**: Captura y procesamiento local con sincronización automática cuando se restaura la conexión.

**Exportación de Catálogos**: Generación automática de PDFs o archivos CSV con todas las imágenes de productos para integración con sistemas ERP.

### Mejoras Técnicas

**Optimización de Rendimiento**: Implementación de procesamiento paralelo para múltiples imágenes, reduciendo el tiempo total de procesamiento.

**Compresión Inteligente**: Algoritmos adaptativos que balancean calidad y tamaño de archivo según el tipo de producto fotografiado.

**Machine Learning Local**: Modelos de remoción de fondo que se ejecutan directamente en el dispositivo, eliminando la dependencia de APIs externas.

**Autenticación de Usuarios**: Sistema de cuentas para equipos con permisos diferenciados y auditoría de actividades.

---

## Conclusión

**Product Photo Scanner** proporciona una solución completa y eficiente para la fotografía de productos en entornos comerciales. La integración de escaneo de códigos de barras, captura de imágenes de alta calidad, procesamiento automático con inteligencia artificial y almacenamiento centralizado optimiza significativamente el flujo de trabajo, reduciendo el tiempo de procesamiento manual y mejorando la consistencia de las imágenes de catálogo.

La arquitectura modular permite fácil extensión y personalización según las necesidades específicas de cada negocio. El código está bien documentado y sigue las mejores prácticas de desarrollo móvil con React Native y TypeScript, facilitando el mantenimiento y la evolución continua del sistema.

Para soporte adicional, consultas técnicas o solicitudes de nuevas funcionalidades, visite [help.manus.im](https://help.manus.im).

---

**Desarrollado por Manus AI**  
**Última actualización:** 21 de enero de 2026
