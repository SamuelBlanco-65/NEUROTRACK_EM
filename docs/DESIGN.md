# Diseño — Neurotrack EM

Propuesta visual. **Pendiente de aprobación** hasta que el usuario lo confirme por escrito.
Nada de esto se implementa antes de esa aprobación. Los valores de color son una propuesta:
`accessibility-reviewer` debe validar el contraste y el daltonismo antes de fijarlos.

Regla que manda sobre todo lo demás: si una decisión de diseño contradice el enunciado,
gana el enunciado, y la contradicción se anota en la sección 7.

## 1. Dirección visual
Un espacio de **acompañamiento**, no un instrumento clínico de medición (§III-B, §IV-B).
Calmado, aireado y de baja fatiga: un elemento principal por pantalla, mucho espacio en
blanco, tipografía grande. Referencia de tono: apps de bienestar/salud serenas antes que
tableros clínicos densos. La lección de MSCopilot manda: menos texto, menos fatiga (§III-B).

## 2. Tokens (`src/theme/`)

**Colores** — un color significa siempre lo mismo en toda la app. *(Propuesta a validar.)*

| Token | Valor (propuesta) | Significado |
|---|---|---|
| `bg` | `#F7FAFC` (claro) / `#14181D` (bajo brillo) | Fondo de pantalla |
| `surface` | `#FFFFFF` / `#1E242B` | Tarjeta / contenedor |
| `text` / `textMuted` | `#1A2027` / `#5A6472` (claro) | Texto principal / secundario |
| `ok` / `warn` / `danger` | `#2E7D5B` / `#B26A00` / `#B23A48` | Estados (siempre con ícono + texto) |
| `accent` | `#2B6CB0` | Acción principal |

Contraste a comprobar antes de aprobar: mínimo 4,5:1 para texto normal, en claro y en bajo
brillo. Evitar blanco puro sobre negro puro (§V-D4). La paleta se valida contra protanopia,
deuteranopia y tritanopia (§V-D3). Los estados `ok/warn/danger` **nunca** comunican solo por
color: siempre acompañan ícono y texto (§V-D3, §V-D6).

**Espaciado:** escala 4 / 8 / 12 / 16 / 24 / 32 · **Radios:** 8 / 12 / 16 ·
**Área táctil mínima:** 48×48 dp (§V-C).

**Tipografía** *(respeta el escalado de fuente del sistema, §V-D2)*

| Estilo | Tamaño / peso | Uso |
|---|---|---|
| Título | 28 / bold | Encabezado de pantalla (uno por pantalla) |
| Subtítulo | 20 / semibold | Secciones |
| Cuerpo | 17 / regular | Texto general |
| Etiqueta | 15 / medium | Controles y metadatos |

**Iconografía:** SF Symbols en iOS vía `expo-symbols` y equivalentes en Android; confirmar el
set y su licencia al implementar y anotarlo en el README si exige atribución.

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
