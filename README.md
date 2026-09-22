# Daytona Mobile

App móvil de venta de mostrador para **Daytona Repuestos Automotor**.
Trabajo para Laboratorio 2 — Aplicaciones Móviles.

Consume la API real del sistema de gestión Daytona (ASP.NET Web API +
SQL Server) y permite registrar una venta completa desde el celular:
buscar repuestos, armar el carrito, elegir tipo de cliente y descuento,
confirmar, y consultar el historial.

## Qué usa de cada clase

| Clase | Contenido | Dónde está en la app |
|---|---|---|
| 1 | Expo Router, navegación Stack, styled-components, ThemeProvider, parámetros entre pantallas | `app/_layout.tsx`, `components/ui.tsx`, `lib/theme.ts`, `ventas/[id].tsx` |
| 2 | TextInput con validación, TouchableOpacity, ScrollView, FlatList con datos de API, iconos | `app/index.tsx` (login), `venta/index.tsx` (buscador), `venta/carrito.tsx` |
| 4 | TanStack Query: `useQuery`, `useMutation`, `queryKey`, caché, invalidación | `venta/index.tsx`, `venta/confirmar.tsx`, `ventas/index.tsx` |
| 4 | Zustand: stores globales con suscripción selectiva | `lib/store/auth.ts`, `lib/store/carrito.ts`, `lib/store/venta.ts` |

## Pantallas

1. **Login** — correo y contraseña, mostrar/ocultar clave, recuperar contraseña.
2. **Buscador** — busca en el catálogo con `useQuery`; cada resultado se agrega al carrito.
3. **Carrito** — cantidades, tipo de cliente (Público / Mecánico), descuento, total.
4. **Confirmar** — resumen y POST de la venta con `useMutation`.
5. **Venta registrada** — número y total, con opción de nueva venta.
6. **Historial** — lista de ventas y detalle por ruta dinámica.

## Por qué Zustand

El carrito se lee y escribe desde tres pantallas que no son padre e hijo:
el buscador agrega y muestra el badge, el carrito edita, la confirmación
lo vacía. Pasarlo por props sería el prop drilling que se vio en clase.

## Cómo correrla

Requiere la API de Daytona corriendo en `http://localhost:52954`.

```
npm install
npx expo start --web
```

Para probar desde un celular en la misma red, cambiar `API_BASE` en
`src/lib/api.ts` por la IP de la PC y configurar IIS Express para que
escuche en esa IP.

## Estructura

```
src/
  app/              pantallas (expo-router)
    _layout.tsx     Stack + QueryClientProvider + ThemeProvider
    index.tsx       login
    recuperar.tsx   recuperar contraseña
    venta/          buscador, carrito, confirmar, confirmación
    ventas/         historial y detalle
  components/       ui (styled-components), filas de lista, marca
  lib/
    api.ts          URL y fetch con token
    theme.ts        colores de Daytona
    tipos.ts        formas de la API
    useSesion.ts    protección de rutas
    store/          auth, carrito, venta (Zustand)
```

## Lo que queda fuera

Presupuestos, cuenta corriente, compras y reportes existen en el sistema
web pero no en la app: el alcance fue un solo proceso completo.
"Recordarme" requiere persistencia segura (`expo-secure-store`), pendiente.
