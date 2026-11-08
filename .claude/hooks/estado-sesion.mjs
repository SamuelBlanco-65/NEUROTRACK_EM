// Hook SessionStart: inyecta en el contexto las secciones clave de docs/STATUS.md,
// para que una sesión nueva (o después de /clear) arranque sabiendo dónde quedó todo.
//
// En SessionStart, el texto que el hook escribe en stdout se añade al contexto de Claude.
// Este hook siempre termina con exit 0: si algo falla, no pasa nada y la sesión sigue igual.

import { readFileSync } from "node:fs";

const SECCIONES = [
  "Objetivo en curso",
  "Siguiente acción concreta",
  "Ya intentado, no repetir",
  "Errores conocidos",
];
const MAX_LINEAS_POR_SECCION = 14;

try {
  const texto = readFileSync("docs/STATUS.md", "utf8");
  const lineas = texto.split(/\r?\n/);

  const partes = [];
  for (const titulo of SECCIONES) {
    const inicio = lineas.findIndex(
      (l) => /^#{1,6}\s/.test(l) && l.toLowerCase().includes(titulo.toLowerCase()),
    );
    if (inicio === -1) continue;

    const cuerpo = [];
    for (let i = inicio + 1; i < lineas.length; i++) {
      if (/^#{1,6}\s/.test(lineas[i])) break;
      cuerpo.push(lineas[i]);
      if (cuerpo.length >= MAX_LINEAS_POR_SECCION) break;
    }

    const limpio = cuerpo.join("\n").trim();
    if (limpio) partes.push(`## ${titulo}\n${limpio}`);
  }

  if (partes.length) {
    process.stdout.write(
      "Estado guardado del proyecto (de docs/STATUS.md; el archivo completo tiene mas detalle):\n\n" +
        partes.join("\n\n") +
        "\n\nNo repitas nada de 'Ya intentado, no repetir'. Aplica los arreglos de entorno antes de ejecutar comandos.\n",
    );
  }
} catch {
  // Sin docs/STATUS.md todavía: no hay nada que inyectar.
}

process.exit(0);
