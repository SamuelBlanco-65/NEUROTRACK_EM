# Diseño — Neurotrack EM

**Aprobado para T0** (2026-11-08): los tokens de la sección 2 ya están implementados en
`src/theme/` y pasaron la auditoría de `accessibility-reviewer` (contraste ≥4.5:1 en ambos
esquemas, sin hallazgos de severidad alta — ver `docs/REQUISITOS.md` RNF-003/004/005/007/009).
Los 5 hallazgos menores detectados ya se corrigieron en el código (check visual de selección,
`accessibilityRole="header"`, `accessibilityState busy`, nota de uso de `outline`).

Regla que manda sobre todo lo demás: si una decisión de diseño contradice el enunciado,
gana el enunciado, y la contradicción se anota en la sección 7.

## 1. Dirección visual
Un espacio de **acompañamiento**, no un instrumento clínico de medición (§III-B, §IV-B).
Calmado, aireado y de baja fatiga: un elemento principal por pantalla, mucho espacio en
blanco, tipografía grande. Referencia de tono: apps de bienestar/salud serenas antes que
tableros clínicos densos. La lección de MSCopilot manda: menos texto, menos fatiga (§III-B).

## 2. Tokens (`src/theme/`)

Implementados a partir del export de Stitch (`docs/diseno/stitch-export/`), paleta Material 3.
Ver `src/theme/colors.ts`, `typography.ts`, `spacing.ts`.

**Colores** — esquema claro tomado literal del export; el **oscuro/bajo brillo es derivado**
(roles `inverse-*` de M3) porque el export no trae esquema oscuro. *(Pendiente de validación
de `accessibility-reviewer` en esta sesión — ver resultado abajo.)*

| Rol | Claro | Oscuro (derivado) |
|---|---|---|
| `primary` / `onPrimary` | `#00424d` / `#ffffff` | `#98cfdd` / `#00363f` |
| `secondary` / `onSecondary` | `#526162` / `#ffffff` | `#b9cacb` / `#243536` |
| `tertiary` / `onTertiary` | `#46392d` / `#ffffff` | `#d6c3b2` / `#3b2e22` |
| `error` / `onError` | `#ba1a1a` / `#ffffff` | `#ffb4ab` / `#690005` |
| `background` / `onBackground` | `#fcf9f4` / `#1c1c19` | `#1c1c19` / `#e5e2dd` |
| `surface` / `onSurface` | `#fcf9f4` / `#1c1c19` | `#1c1c19` / `#e5e2dd` |

Contraste exigido: mínimo 4,5:1 para texto normal, en claro y en oscuro. Evitar blanco puro
sobre negro puro (§V-D4) — ninguno de los dos esquemas usa `#000000`/`#ffffff` como superficie.
La paleta se valida contra protanopia, deuteranopia y tritanopia (§V-D3). Ningún estado se
comunica solo por color: siempre ícono + texto (§V-D3, §V-D6; ver RNF-006).

**Espaciado:** `xs` 6 · `sm` 12 · `md` 16 · `lg` 24 · `xl` 36 · `margin` 20 (dp).
**Radios:** `default` 16 · `lg` 32 · `xl` 48 · `full` 9999.
**Área táctil mínima:** 48×48 dp, vía `MinTouchSize` + `hitSlop` donde aplica (§V-C, RNF-005).

**Tipografía** — Atkinson Hyperlegible Next (diseñada para baja visión/dislexia), respeta el
escalado de fuente del sistema (§V-D2):

| Estilo | Tamaño / interlineado / peso |
|---|---|
| `headlineLg` | 28 / 36 / bold |
| `headlineMd` | 24 / 32 / bold |
| `headlineSm` | 20 / 28 / bold |
| `bodyLg` / `bodyMd` / `bodySm` | 19 / 17 / 15, regular |
| `labelLg` / `labelMd` / `labelSm` | 17 / 15 / 13, bold |

**Iconografía:** Material Symbols vía `NativeTabs.Trigger.Icon` (`md="..."`), consistente con
el export de Stitch; no se usa `expo-symbols` (solo Android, sin iOS en este proyecto).

## 3. Estructura de pantalla
Encabezado fijo con el título; contenido desplazable debajo; una acción principal destacada.
Barra de tabs inferior por perfil (área táctil amplia, etiqueta de texto + ícono). Un
elemento principal por pantalla; nada de interfaces densas (§V-B, §V-D2).

## 4. Ficha por pantalla o zona
Para cada una se definirá: **qué muestra** y de dónde sale el dato (backend/cache), **qué
controles** tiene, y sus **estados** (carga, error, vacío, offline, y estados límite del
dominio: sin síntomas registrados, actividad sin intentos previos, cuidador sin vínculo).

Pantallas propuestas (ver `STATUS.md` para el orden):
- Selección de perfil · Registro/Login
- Paciente: Inicio · Calendario de síntomas · Actividades · Progreso · Apoyo/Info
- Cuidador: Inicio · Observaciones · Acompañar · Recordatorios · Apoyo/Info

## 5. Tabla de estados

| Elemento | Estado | Aspecto |
|---|---|---|
| Lista/datos | Carga | Esqueleto o spinner con `accessibilityLabel` "Cargando" |
| Lista/datos | Vacío | Mensaje breve + acción sugerida (p. ej. "Registra tu primer síntoma") |
| Lista/datos | Error / offline | Mensaje claro + reintentar; nunca pantalla en blanco |
| Severidad de síntoma | ok/warn/danger | Color + ícono + texto (no solo color) |
| Recordatorio | Activo | Aviso visual + háptico, nunca solo sonoro (§V-A) |

## 6. Movimiento
Transiciones suaves y cortas (≤ 200 ms). **Sin destellos ni transiciones muy brillantes**
(§V-D4). Respetar "reducir movimiento" del sistema. Nada de animación que sea la única vía
para entender un cambio de estado.

## 7. Conflictos con el enunciado
Ninguno detectado. El diseño deriva directamente de los requisitos de accesibilidad (§V).

## 8. Reglas de implementación
- Colores, tipografía y espaciado solo desde `src/theme/`; ningún literal en los componentes.
- Todo control interactivo: `testID` y `accessibilityLabel`.
- Respetar los márgenes seguros del sistema.
