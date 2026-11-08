---
name: capa-datos
description: Añade o revisa la capa de datos de la app (cliente HTTP, autenticación, almacenamiento seguro, caché y manejo de errores). Úsalo cuando la app deba consumir una API o guardar sesión.
---

# Capa de datos

## 0. Antes de empezar
- Confirma que el enunciado o el proyecto realmente pide backend. Si no lo pide,
  pregúntame antes de añadir dependencias o infraestructura.
- En proyectos académicos, cada librería nueva debe estar permitida por el enunciado.
  Si no se menciona, pregúntame antes de instalarla.
- Verifica el nombre y la guía actual de cada paquete con `npx expo install <paquete>`
  en lugar de confiar en una versión recordada.

## 1. Separación
```
src/features/<feature>/api.ts     ← llamadas de esa funcionalidad
src/features/<feature>/types.ts   ← tipos del dominio
src/lib/http.ts                   ← cliente HTTP (único lugar con fetch)
src/lib/auth.ts                   ← sesión y tokens
```
Ningún componente llama `fetch` directamente. La UI consume funciones tipadas.

## 2. Cliente HTTP
En un solo módulo, con:
- URL base por entorno (nunca escrita a mano en varios archivos).
- **Timeout y cancelación** con `AbortController`. Una petición sin timeout cuelga la pantalla.
- Cabeceras comunes y inyección del token en un solo punto.
- Traducción de la respuesta a un resultado tipado: no devuelvas `any` ni el `Response` crudo.

## 3. Secretos y entornos
- Lo que viaja en el bundle de la app **es público**. En Expo, cualquier variable con
  prefijo `EXPO_PUBLIC_` queda incrustada en el binario: sirve para URLs base, nunca
  para llaves privadas.
- Una llave que deba permanecer secreta no puede vivir en la app: necesita un backend
  o una función intermedia. Si el enunciado pide lo contrario, dímelo y lo anotamos
  como riesgo en `docs/DECISIONES.md`.
- `.env` no se versiona. Mantén un `.env.example` con los nombres de las variables y
  valores falsos, para que el proyecto se pueda levantar en otra máquina.

## 4. Sesión y tokens
- Tokens y datos sensibles: almacenamiento cifrado del dispositivo (`expo-secure-store`),
  nunca almacenamiento plano tipo AsyncStorage, y nunca en el estado global persistido a disco.
- Define qué pasa cuando el token expira: refresh silencioso o cierre de sesión.
  No dejes ese caso sin decidir; es el que rompe la app en manos del usuario.
- Nunca registres tokens, contraseñas ni datos personales en logs, ni en desarrollo.

## 5. Validación en el borde
- No confíes en la forma de la respuesta del servidor. Valida en el punto de entrada
  (por ejemplo con un esquema) y convierte a tus tipos del dominio ahí mismo.
- Un campo que llega `null` cuando esperabas texto debe producir un error controlado,
  no una pantalla en blanco tres componentes más adelante.

## 6. Errores con significado
Clasifica, porque cada clase se muestra distinto:

| Clase | Qué le digo al usuario |
|---|---|
| Sin conexión | "Revisa tu conexión" + reintentar |
| 401 / sesión vencida | Volver a iniciar sesión |
| 403 | No tienes permiso (no reintentar) |
| 404 | El contenido no existe (no reintentar) |
| 4xx de validación | El mensaje concreto del campo |
| 5xx | "Falló el servidor" + reintentar |
| Respuesta inesperada | Error genérico + registrar el detalle |

Reintentos automáticos solo para operaciones idempotentes (GET). Nunca reintentes
automáticamente un pago, un envío o una creación.

## 7. Caché y offline
- Mínimo aceptable: mensaje claro y botón de reintentar. No pantalla congelada.
- Si el proyecto justifica caché, propónmelo antes de instalar una librería de datos
  (tipo TanStack Query): resuelve mucho, pero es una dependencia más que hay que saber explicar.
- Define qué datos pueden mostrarse viejos y cuáles no (un saldo, no; un catálogo, sí).

## 8. Pruebas
- Simula en el borde del HTTP, no en el componente: así pruebas el mapeo y la validación.
- Casos que sí hay que probar: respuesta correcta, respuesta con campo faltante,
  error de red, 401, y timeout.

## 9. Al terminar
- Anota en `docs/DECISIONES.md`: qué cliente usas, dónde viven los tokens, cómo se
  manejan los errores y qué quedó fuera del alcance.
- Explícame en 3–5 líneas el flujo de una petición, de la pantalla al servidor y de vuelta.
