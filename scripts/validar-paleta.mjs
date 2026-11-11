// Valida la paleta final de src/theme/colors.ts:
//  1) Contraste WCAG de los pares texto/fondo que la app usa de verdad (mínimo 4.5:1 texto, 3:1 íconos/bordes).
//  2) Distinguibilidad bajo protanopia, deuteranopia y tritanopia (matrices de Machado et al., 2009, severidad 1.0),
//     medida como diferencia de color CIE76 (ΔE) entre los colores que la app usa juntos para comunicar estados.
// Uso: node scripts/validar-paleta.mjs
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/theme/colors.ts', import.meta.url), 'utf8');
function parseBlock(name) {
  const body = src.split(`export const ${name} = {`)[1].split('} as const')[0];
  return Object.fromEntries([...body.matchAll(/^\s*(\w+):\s*'(#[0-9a-fA-F]{6})'/gm)].map((m) => [m[1], m[2]]));
}
const schemes = { claro: parseBlock('LightColors'), oscuro: parseBlock('DarkColors') };

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = hex2rgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const CVD = {
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
function simulate(hex, m) {
  const c = hex2rgb(hex).map(lin);
  const out = m.map((row) => Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2])));
  return out;
}
function lab(rgbLin) {
  const [r, g, b] = rgbLin;
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const dE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const normal = (hex) => hex2rgb(hex).map(lin);

// Pares texto/fondo realmente usados (rol de texto, rol de fondo, mínimo).
const TEXT_PAIRS = [
  ['onSurface', 'surface', 4.5], ['onSurface', 'surfaceContainer', 4.5], ['onSurface', 'surfaceContainerLowest', 4.5],
  ['onSurfaceVariant', 'surface', 4.5], ['onSurfaceVariant', 'surfaceContainer', 4.5],
  ['onSurfaceVariant', 'surfaceContainerLow', 4.5], ['secondary', 'surface', 4.5],
  ['primary', 'surface', 4.5], ['primary', 'surfaceContainerLowest', 4.5],
  ['onPrimary', 'primary', 4.5], // botones principales (antes primaryContainer)
  ['onSecondaryContainer', 'secondaryContainer', 4.5], ['onError', 'error', 4.5],
  ['onErrorContainer', 'errorContainer', 4.5], ['error', 'surface', 4.5],
  ['onTertiaryContainer', 'tertiaryContainer', 4.5],
  ['primary', 'secondaryContainer', 3], ['tertiary', 'surface', 3], // íconos y barras (no texto)
  ['outline', 'surface', 3], // bordes de campos
];

let fails = 0;
for (const [scheme, c] of Object.entries(schemes)) {
  console.log(`\n=== Contraste — esquema ${scheme} ===`);
  for (const [fg, bg, min] of TEXT_PAIRS) {
    const r = contrast(c[fg], c[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(`${ok ? 'OK  ' : 'FALLA'} ${fg.padEnd(22)} sobre ${bg.padEnd(24)} ${r.toFixed(2).padStart(5)}:1 (mín ${min})`);
  }
}

// Colores que comunican estado y aparecen en la misma pantalla.
const STATE_PAIRS = [
  ['primary', 'error', 'Acierto / error en actividades'],
  ['tertiary', 'surface', 'Barras de severidad frente al fondo'],
  ['primary', 'tertiary', 'Progreso (nivel) frente a severidad'],
  ['primary', 'secondary', 'Seleccionado / no seleccionado'],
  ['error', 'errorContainer', 'Error y su contenedor'],
];
const MIN_DE = 15; // por debajo, la diferencia solo de color se vuelve poco fiable
console.log(`\n=== Daltonismo — diferencia de color ΔE entre colores de estado (ΔE ≥ ${MIN_DE} = distinguible solo por color) ===`);
const weak = [];
for (const [scheme, c] of Object.entries(schemes)) {
  console.log(`\n-- esquema ${scheme}`);
  for (const [a, b, why] of STATE_PAIRS) {
    const cells = [`visión normal ${dE(normal(c[a]), normal(c[b])).toFixed(0).padStart(3)}`];
    for (const [name, m] of Object.entries(CVD)) {
      const d = dE(simulate(c[a], m).map((v) => v), simulate(c[b], m));
      cells.push(`${name} ${d.toFixed(0).padStart(3)}`);
      if (d < MIN_DE) weak.push(`${scheme}: ${a} vs ${b} (${why}) bajo ${name}: ΔE ${d.toFixed(0)}`);
    }
    console.log(`${(a + ' vs ' + b).padEnd(30)} ${cells.join(' · ')}   ← ${why}`);
  }
}
console.log('\nPares que NO se distinguen solo por color (deben llevar además ícono/forma/texto, RNF-006):');
console.log(weak.length ? weak.map((w) => ' - ' + w).join('\n') : ' (ninguno)');
console.log(`\nResultado de contraste: ${fails === 0 ? 'todos los pares cumplen' : fails + ' pares fallan'}`);
process.exit(fails === 0 ? 0 : 1);
