# Product Photo Scanner - TODO

## Configuración Inicial
- [x] Generar logo personalizado de la aplicación
- [x] Actualizar configuración de branding en app.config.ts
- [x] Configurar tema de colores en theme.config.js

## Funcionalidad de Escaneo de Código de Barras
- [x] Instalar y configurar expo-camera para acceso a cámara
- [x] Instalar y configurar expo-barcode-scanner para detección de códigos
- [x] Crear pantalla de escáner con vista de cámara en tiempo real
- [x] Implementar overlay con guías visuales de escaneo
- [x] Agregar campo de entrada manual como fallback
- [x] Validar formato de código de barras
- [x] Implementar feedback visual cuando se detecta código

## Sistema de Captura de Fotos
- [x] Crear pantalla de captura con vista previa de cámara
- [x] Mostrar código de producto en la parte superior
- [x] Implementar contador de fotos por producto
- [x] Agregar botón de captura prominente
- [x] Crear carrusel de miniaturas de fotos tomadas
- [x] Implementar nomenclatura automática (codigo_numero.jpg)
- [x] Agregar opción de retomar foto
- [x] Implementar botón "Finalizar y Subir"

## Procesamiento de Fondo Blanco
- [x] Investigar API de procesamiento de imágenes (remove.bg o alternativa)
- [x] Implementar integración con API de remoción de fondo
- [x] Crear función de procesamiento por lotes
- [x] Agregar manejo de errores en procesamiento
- [ ] Implementar reintentos automáticos

## Sistema de Almacenamiento y Subida
- [x] Configurar servidor backend para recepción de imágenes
- [x] Implementar endpoint de subida de imágenes
- [x] Crear sistema de almacenamiento (S3 o almacenamiento local del servidor)
- [ ] Implementar cola de subida con reintentos
- [x] Agregar indicadores de progreso de subida
- [x] Implementar notificaciones de éxito/error

## Pantalla Principal (Home)
- [x] Crear diseño de pantalla principal
- [x] Agregar botón prominente "Escanear Código de Barras"
- [ ] Implementar lista de productos recientes
- [x] Agregar contador de fotos tomadas hoy
- [ ] Implementar navegación a galería de producto

## Galería de Producto
- [ ] Crear pantalla de galería con grid de fotos
- [ ] Mostrar código de producto como título
- [ ] Agregar fecha de captura
- [ ] Implementar opción de descarga individual
- [ ] Implementar descarga en lote
- [ ] Agregar funcionalidad de compartir
- [ ] Implementar eliminación de fotos

## Almacenamiento Local
- [x] Configurar AsyncStorage para historial de productos
- [x] Implementar persistencia de sesiones de captura
- [x] Guardar configuraciones de usuario

## Pruebas y Validación
- [x] Probar escaneo de códigos de barras en diferentes condiciones
- [x] Validar nomenclatura de archivos
- [x] Probar procesamiento de fondo blanco
- [x] Validar subida de imágenes al servidor
- [x] Probar flujo completo end-to-end
- [x] Verificar manejo de errores y reintentos

## Documentación
- [x] Documentar configuración del servidor
- [x] Documentar API de subida de imágenes
- [x] Crear guía de usuario
