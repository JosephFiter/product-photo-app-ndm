# Product Photo Scanner 📷

Aplicación móvil para escanear códigos de barras, fotografiar productos y procesar imágenes con fondo blanco automáticamente.

## Características Principales

✨ **Escaneo de Códigos de Barras**: Detección automática de múltiples formatos (EAN-13, UPC, Code 128, etc.)  
📸 **Captura Múltiple**: Toma varias fotos del mismo producto con nomenclatura automática  
🎨 **Procesamiento Automático**: Remoción de fondo con IA para imágenes profesionales  
☁️ **Almacenamiento Centralizado**: Subida automática al servidor con nombres estandarizados  
📱 **Multiplataforma**: Funciona en iOS, Android y Web

## Inicio Rápido

### Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

### Probar en Dispositivo

1. Instalar **Expo Go** desde App Store o Google Play
2. Escanear el código QR mostrado en la terminal
3. ¡Listo para usar!

### Configuración Opcional

Para habilitar la remoción automática de fondo, crear archivo `.env`:

```env
REMOVE_BG_API_KEY=tu_api_key_aqui
```

Obtener API key en: https://www.remove.bg/api

## Uso

1. **Escanear**: Toca el botón principal y escanea el código de barras del producto
2. **Fotografiar**: Toma múltiples fotos desde diferentes ángulos
3. **Procesar**: La app automáticamente remueve el fondo y sube las imágenes
4. **Descargar**: Accede a las imágenes desde el servidor en `/uploads/products/`

## Nomenclatura de Archivos

Las imágenes se nombran automáticamente como: `{codigo_producto}_{numero}.png`

Ejemplo:
- `PROD12345_1.png`
- `PROD12345_2.png`
- `PROD12345_3.png`

## Tecnologías

- **React Native 0.81** con **Expo SDK 54**
- **TypeScript 5.9** para seguridad de tipos
- **NativeWind 4** (Tailwind CSS para React Native)
- **Express.js** para el servidor backend
- **Multer** para manejo de archivos
- **Expo Camera** y **Barcode Scanner** para captura

## Estructura del Proyecto

```
app/              # Pantallas de la aplicación
├── (tabs)/       # Pantalla principal
├── scanner.tsx   # Escaneo de códigos
├── camera.tsx    # Captura de fotos
└── processing.tsx # Procesamiento y subida

server/           # Backend Express
└── routes/
    └── upload.ts # API de subida de imágenes

lib/              # Lógica de negocio
└── image-processing.ts # Procesamiento de imágenes
```

## API del Servidor

### Subir Imagen

```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary]
filename: "PROD123_1.png"
```

### Listar Imágenes

```http
GET /api/upload/list
```

### Acceder a Imagen

```
http://localhost:3000/uploads/products/{filename}
```

## Documentación Completa

Para documentación detallada, ver [DOCUMENTATION.md](./DOCUMENTATION.md)

## Soporte

Para consultas y soporte técnico: https://help.manus.im

---

**Desarrollado por Manus AI** | Versión 1.0.0
