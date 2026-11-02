# Daytona Mobile

App móvil de venta de mostrador para **Daytona Repuestos Automotor**, un
negocio de repuestos de Córdoba. Consume la API del sistema de gestión
Daytona (ASP.NET Web API + SQL Server) y permite registrar una venta
completa desde el celular.

Proyecto para **Laboratorio 2 — Aplicaciones Móviles**.

---

## 👥 Integrantes

- Sofía Ludueña
- Hernán Pereyra
- Noelia Pereyra

---

## ✅ Features implementadas

**Autenticación**
- Login con correo y contraseña contra la API real (JWT)
- Mostrar / ocultar contraseña
- Validación de correo mientras se escribe
- Mensajes distintos para credenciales incorrectas y falta de conexión
- Recuperar contraseña (registra la solicitud en el backend)
- "Recordarme": la sesión queda guardada cifrada con `expo-secure-store`
  (en web, `localStorage`) y se descarta sola cuando el token vence
- Diseño responsive: una columna en celular, dos zonas en tablet

**Venta de mostrador**
- Buscador de repuestos en el catálogo, con búsqueda diferida (debounce)
- **Escáner de código de barras** con la cámara (`expo-camera`), con
  pedido de permiso, acceso a ajustes si se negó y linterna
- Resultados con código, marca, descripción, stock con semáforo y precio
- Agregar al carrito con validación de stock
- Badge del carrito con animación (`Animated`) cada vez que se suma algo
- Carrito con cantidades editables y quitar ítems
- Selección de tipo de cliente: Público / Mecánico
- Descuentos configurables leídos de la API (al mecánico se le aplica solo)
- Cobro con uno o varios medios de pago (efectivo, débito, QR…), vuelto en
  efectivo y comisión estimada de cada medio
- Confirmación con resumen y registro real de la venta en el sistema
- Token de operación: si la venta se envía dos veces, no se duplica

**Ficha técnica del repuesto (modelo EAV)**
- Al tocar un repuesto se abre su ficha (ruta dinámica `repuesto/[id]`)
- Datos técnicos como filas atributo / valor (medida, rosca, material…):
  cada repuesto tiene los suyos, sin columnas fijas
- Alta, edición y borrado de datos, con sugerencias de los nombres ya usados

**Historial**
- Pestañas Todas / Activas / Anuladas
- Scroll infinito con `useInfiniteQuery`: carga de a 20 ventas
- Ventas anuladas diferenciadas visualmente
- Pull-to-refresh
- Comprobante de cada venta por ruta dinámica, con renglones, descuento y
  medios de pago
- **Compartir el comprobante como imagen** (`react-native-view-shot` +
  `expo-sharing`) por WhatsApp, mail, etc.

**Infraestructura**
- Sesión global con Zustand
- Carrito y opciones de venta en Zustand (compartidos entre pantallas)
- Todas las llamadas a la API con TanStack Query (`useQuery`,
  `useInfiniteQuery`, `useMutation`) e invalidación de caché
- Protección de rutas: sin sesión, redirige al login
- Manejo de sesión vencida
- Dirección de la API configurable con `EXPO_PUBLIC_API_URL` (`.env`); sin
  `.env` la app la detecta sola en web y en el celular
- APK con EAS (`eas.json`, perfil `preview`)
- Tema con la identidad de Daytona en styled-components
- **Tests con Jest + React Native Testing Library**: unitarios (carrito,
  cobro, formato, paginación, ficha técnica) y de integración (pestañas,
  fila de repuesto, cobro)

---

## ⏳ Features pendientes

- **Selección de cliente registrado**: hoy se usan los clientes internos
  (Consumidor Final / Mecánico Mostrador); falta poder elegir uno de la lista
- **Venta a cuenta corriente**: la API lo soporta, la app solo registra
  ventas cubiertas en el momento
- **Código OTP en recuperar contraseña**: requiere endpoint en el backend
- **Foto del repuesto** en la ficha técnica: requiere guardar imágenes en
  el servidor
- Presupuestos, compras y reportes existen en el sistema web pero quedan
  fuera del alcance de la app

---

## Pantallas

1. **Login** — `app/index.tsx`
2. **Recuperar contraseña** — `app/recuperar.tsx`
3. **Buscador** — `app/venta/index.tsx`
4. **Escanear código** — `app/venta/escanear.tsx`
5. **Ficha del repuesto** — `app/repuesto/[id].tsx`
6. **Carrito** — `app/venta/carrito.tsx`
7. **Confirmar venta** — `app/venta/confirmar.tsx`
8. **Venta registrada** — `app/venta/confirmacion.tsx`
9. **Historial** — `app/ventas/index.tsx`
10. **Comprobante** — `app/ventas/[id].tsx`

---

## Cómo correrla

Requiere la API de Daytona corriendo en `http://localhost:52954`, con el
script `SQL/scripts/97-App-movil.sql` del sistema aplicado (historial
paginado y ficha técnica).

```
npm install
npx expo start
```

Con **w** se abre en el navegador; escaneando el QR con Expo Go (SDK 55) se
abre en el celular. El escáner y compartir el comprobante funcionan en el
celular.

Para usar la API publicada, copiar `.env.example` como `.env` y completar
`EXPO_PUBLIC_API_URL`.

### Tests

```
npm test
```

### APK

```
eas build -p android --profile preview
```

---

## Stack

Expo SDK 55 · expo-router · React Native 0.83 · TypeScript ·
@tanstack/react-query 5 · zustand 5 · styled-components 6 · expo-camera ·
expo-sharing · react-native-view-shot · expo-secure-store ·
Jest + React Native Testing Library

## Estructura

```
src/
  app/              pantallas (expo-router)
  components/       ui, filas de lista, pestañas, cobro, badge
  lib/
    api.ts          URL y fetch con token
    theme.ts        colores de Daytona
    tipos.ts        formas de la API
    formato.ts      fechas y número de comprobante
    fichaTecnica.ts reglas de la ficha técnica
    useSesion.ts    protección de rutas
    store/          auth, carrito, venta (Zustand)
  __tests__/        tests de Jest
```
