# Diseño de Interfaz - Product Photo Scanner

## Orientación y Uso
- **Orientación**: Vertical (9:16) - Diseñado para uso con una mano
- **Plataforma**: iOS/Android siguiendo Apple Human Interface Guidelines

## Lista de Pantallas

### 1. Home (Pantalla Principal)
**Contenido Principal:**
- Botón prominente "Escanear Código de Barras"
- Lista de productos recientes con miniaturas
- Contador de fotos tomadas hoy

**Funcionalidad:**
- Iniciar escaneo de código de barras
- Ver historial de productos fotografiados
- Acceder a galería de fotos por producto

### 2. Escáner de Código de Barras
**Contenido Principal:**
- Vista de cámara en tiempo real
- Overlay con guías de escaneo
- Indicador visual cuando se detecta código
- Campo de texto para entrada manual (fallback)

**Funcionalidad:**
- Escaneo automático de códigos de barras
- Entrada manual de código si el escaneo falla
- Validación de formato de código
- Transición automática a pantalla de captura

### 3. Captura de Fotos
**Contenido Principal:**
- Vista previa de cámara a pantalla completa
- Código de producto visible en la parte superior
- Contador de fotos tomadas para este producto
- Botón de captura prominente
- Miniaturas de fotos tomadas en carrusel inferior

**Funcionalidad:**
- Capturar múltiples fotos del mismo producto
- Vista previa inmediata de foto capturada
- Nomenclatura automática: `{codigo}_{numero}.jpg`
- Procesamiento automático de fondo blanco
- Opción de retomar foto
- Finalizar sesión y subir fotos

### 4. Procesamiento y Subida
**Contenido Principal:**
- Barra de progreso de procesamiento
- Lista de fotos siendo procesadas
- Estado de subida (pendiente/procesando/completado)
- Mensaje de confirmación al finalizar

**Funcionalidad:**
- Procesamiento de fondo blanco en cada foto
- Subida automática a servidor
- Reintentos automáticos en caso de fallo
- Notificación de éxito/error

### 5. Galería de Producto
**Contenido Principal:**
- Grid de fotos del producto seleccionado
- Código de producto como título
- Fecha de captura
- Opciones de compartir/descargar

**Funcionalidad:**
- Ver todas las fotos de un producto
- Descargar fotos individuales o en lote
- Compartir enlaces de descarga
- Eliminar fotos

## Flujos de Usuario Principales

### Flujo 1: Fotografiar Nuevo Producto
1. Usuario abre app → Home
2. Toca "Escanear Código de Barras" → Pantalla de Escáner
3. Escanea código (o ingresa manualmente) → Pantalla de Captura
4. Toma múltiples fotos del producto
5. Toca "Finalizar y Subir" → Pantalla de Procesamiento
6. Fotos se procesan (fondo blanco) y suben automáticamente
7. Confirmación → Regresa a Home

### Flujo 2: Ver Fotos de Producto Existente
1. Usuario en Home
2. Toca producto en lista reciente → Galería de Producto
3. Ve todas las fotos del producto
4. Puede descargar o compartir

### Flujo 3: Entrada Manual de Código
1. Usuario en Pantalla de Escáner
2. Código no se detecta automáticamente
3. Toca campo de texto y escribe código manualmente
4. Confirma → Continúa a Pantalla de Captura

## Paleta de Colores

### Colores Principales
- **Primary**: `#2563EB` (Azul profesional) - Botones principales, acciones
- **Background**: `#FFFFFF` (Blanco) - Fondo general
- **Surface**: `#F8FAFC` (Gris muy claro) - Tarjetas, superficies elevadas
- **Foreground**: `#0F172A` (Gris oscuro) - Texto principal
- **Muted**: `#64748B` (Gris medio) - Texto secundario

### Colores de Estado
- **Success**: `#10B981` (Verde) - Subida exitosa, confirmaciones
- **Warning**: `#F59E0B` (Ámbar) - Advertencias, reintentos
- **Error**: `#EF4444` (Rojo) - Errores, fallos de subida

### Colores de Cámara/Escáner
- **Scan Overlay**: `#2563EB` con 60% opacidad - Guías de escaneo
- **Scan Success**: `#10B981` - Indicador de código detectado
- **Camera Controls**: `#FFFFFF` con sombra - Botones sobre cámara

## Notas de Implementación
- No se requiere autenticación de usuario (app local)
- Almacenamiento local con AsyncStorage para historial
- Procesamiento de fondo blanco mediante API externa (remove.bg o similar)
- Subida a servidor mediante API REST o almacenamiento S3
