// Hook PreToolUse (Write|Edit|NotebookEdit): protege archivos que Claude no debe modificar.
//
// Motivo principal: el enunciado del profesor es la fuente de verdad del proyecto.
// Si se "corrige" o se reescribe, se pierde la referencia contra la cual se evalúa todo.
//
// Exit 2 bloquea la herramienta y Claude recibe el texto de stderr como error.
// Cualquier otra salida deja pasar.

import { basename } from "node:path";

const REGLAS = [
  {
    prueba: (r) => r.includes("/docs/enunciado/") && !r.endsWith("/aclaraciones.md"),
    razon:
      "docs/enunciado/ es el material original del profesor y es la fuente de verdad del proyecto. " +
      "No se edita. Si hay una aclaracion nueva, escribela en docs/enunciado/aclaraciones.md.",
  },
  {
    // .env y .env.<lo-que-sea>, excepto .env.example (plantilla sin secretos, sí se edita).
    prueba: (r) => {
      const n = basename(r);
      return (n === ".env" || n.startsWith(".env.")) && n !== ".env.example";
    },
    razon:
      "Los archivos .env contienen secretos y no se editan desde aqui. " +
      "Si hace falta una variable nueva, agregala a .env.example y dime que la ponga yo.",
  },
  {
    prueba: (r) => r.includes("/node_modules/"),
    razon:
      "node_modules se regenera con npm install: cualquier cambio ahi se pierde. " +
      "Si un paquete tiene un problema, dimelo en lugar de parchearlo.",
  },
  {
    prueba: (r) => ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"].includes(basename(r)),
    razon:
      "El archivo de bloqueo de dependencias lo genera el gestor de paquetes. " +
      "Para cambiar dependencias usa npx expo install y dejalo que lo actualice.",
  },
];

let entrada = "";
process.stdin.on("data", (c) => (entrada += c));
process.stdin.on("end", () => {
  let datos = {};
  try {
    datos = JSON.parse(entrada || "{}");
  } catch {
    process.exit(0);
  }

  const ti = datos.tool_input || {};
  const bruto = ti.file_path || ti.notebook_path || ti.path || "";
  if (!bruto) process.exit(0);

  const ruta = String(bruto).replace(/\\/g, "/");

  for (const regla of REGLAS) {
    if (regla.prueba(ruta)) {
      process.stderr.write(`Bloqueado por el proyecto: ${bruto}\n${regla.razon}\n`);
      process.exit(2);
    }
  }

  process.exit(0);
});
