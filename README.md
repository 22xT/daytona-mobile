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
- Diseño responsive: una columna en celular, dos zonas en tablet

**Venta de mostrador**
- Buscador de repuestos en el catálogo, con búsqueda diferida (debounce)
- Resultados con código, marca, descripción, stock con semáforo y precio
- Agregar al carrito con validación de stock
- Badge con la cantidad de ítems en la cabecera
- Carrito con cantidades editables y quitar ítems
- Selección de tipo de cliente: Público / Mecánico
- Descuentos configurables leídos de la API (al mecánico se le aplica solo)
- Cálculo de subtotal, descuento y total
- Confirmación con resumen y registro real de la venta en el sistema
- Pantalla de venta registrada con número de comprobante

**Historial**
- Lista de ventas ordenadas de la más nueva a la más vieja
- Ventas anuladas diferenciadas visualmente
- Detalle de cada venta por ruta dinámica
- Pull-to-refresh

**Infraestructura**
- Sesión global con Zustand
- Carrito y opciones de venta en Zustand (compartidos entre pantallas)
- Todas las llamadas a la API con TanStack Query (`useQuery` / `useMutation`)
- Invalidación de caché al registrar una venta
- Protección de rutas: sin sesión, redirige al login
- Funciona en web y en celular físico (Expo Go) con el mismo comando: la
  app detecta sola la dirección del backend
- Manejo de sesión vencida
- Tema con la identidad de Daytona en styled-components

---

## ⏳ Features pendientes

- **"Recordarme"**: la casilla existe pero requiere persistencia segura
  (`expo-secure-store`); hoy la sesión dura mientras la app está abierta
- **Selección de cliente registrado**: hoy se usan los clientes internos
  (Consumidor Final / Mecánico Mostrador); falta poder elegir uno de la lista
- **Venta a cuenta corriente**: la API lo soporta, la app solo registra contado
- **Código OTP en recuperar contraseña**: requiere endpoint en el backend
- **Paginación del historial** con `useInfiniteQuery`
- Presupuestos, compras y reportes existen en el sistema web pero quedan
  fuera del alcance de la app

---

## Pantallas

1. **Login** — `app/index.tsx`
2. **Recuperar contraseña** — `app/recuperar.tsx`
3. **Buscador** — `app/venta/index.tsx`
4. **Carrito** — `app/venta/carrito.tsx`
5. **Confirmar venta** — `app/venta/confirmar.tsx`
6. **Venta registrada** — `app/venta/confirmacion.tsx`
7. **Historial** — `app/ventas/index.tsx`
8. **Detalle de venta** — `app/ventas/[id].tsx`

---

## Cómo correrla

Requiere la API de Daytona corriendo en `http://localhost:52954`.

```
npm install
npx expo start --web
```

Con **w** se abre en el navegador; escaneando el QR con Expo Go (SDK 55) se
abre en el celular. La configuración de red para que el celular llegue al
backend está en `CELULAR.md`.

---

## Stack

Expo SDK 55 · expo-router · React Native 0.83 · TypeScript ·
@tanstack/react-query 5 · zustand 5 · styled-components 6 · @expo/vector-icons

## Estructura

```
src/
  app/              pantallas (expo-router)
  components/       ui (styled-components), filas de lista, marca
  lib/
    api.ts          URL y fetch con token
    theme.ts        colores de Daytona
    tipos.ts        formas de la API
    useSesion.ts    protección de rutas
    store/          auth, carrito, venta (Zustand)
```
