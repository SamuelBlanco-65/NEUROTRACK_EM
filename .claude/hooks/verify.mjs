// Hook Stop: no deja que Claude dé una tarea por terminada si el proyecto no compila
// o no pasa el lint. Si el script no existe en package.json, no hace nada.
//
// Protección contra bucles en dos capas:
//  1. El campo stop_hook_active, si esta versión de Claude Code lo envía.
//  2. Un contador propio en la carpeta temporal del sistema, que funciona igual
//     si ese campo no existe. Tras MAX_BLOQUEOS seguidos deja pasar, para no
//     quedar atrapado en un fallo que Claude no puede arreglar solo.
//
// Para saltarlo a propósito en una sesión: VERIFY_SKIP=1
// Para incluir también las pruebas (más lento): VERIFY_TESTS=1

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MAX_BLOQUEOS = 3;
const VENTANA_MS = 10 * 60 * 1000;
const MAX_SALIDA = 2500;

const archivoContador = join(
  tmpdir(),
  "claude-verify-" + Buffer.from(process.cwd()).toString("base64url").slice(0, 32) + ".json",
);

function leerContador() {
  try {
    const d = JSON.parse(readFileSync(archivoContador, "utf8"));
    if (Date.now() - d.ts > VENTANA_MS) return 0;
    return Number(d.n) || 0;
  } catch {
    return 0;
  }
}

function escribirContador(n) {
  try {
    writeFileSync(archivoContador, JSON.stringify({ n, ts: Date.now() }));
  } catch {
    // Si no se puede escribir, seguimos: solo perdemos la capa 2.
  }
}

function correr(comando) {
  try {
    execSync(comando, { stdio: "pipe" });
    return null;
  } catch (err) {
    return (String(err.stdout || "") + String(err.stderr || "")).slice(-MAX_SALIDA);
  }
}

let entrada = "";
process.stdin.on("data", (c) => (entrada += c));
process.stdin.on("end", () => {
  let datos = {};
  try {
    datos = JSON.parse(entrada || "{}");
  } catch {
    // Sin entrada válida seguimos: el hook todavía puede hacer su trabajo.
  }

  if (datos.stop_hook_active) process.exit(0);
  if (process.env.VERIFY_SKIP === "1") process.exit(0);

  let scripts;
  try {
    scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts || {};
  } catch {
    process.exit(0); // No estamos en la raíz de un proyecto npm.
  }

  const fallos = [];
  if (scripts.typecheck) {
    const r = correr("npm run typecheck --silent");
    if (r) fallos.push(["typecheck", r]);
  }
  if (scripts.lint) {
    const r = correr("npm run lint --silent");
    if (r) fallos.push(["lint", r]);
  }
  if (process.env.VERIFY_TESTS === "1" && scripts.test) {
    const r = correr("npm test --silent");
    if (r) fallos.push(["test", r]);
  }

  if (fallos.length === 0) {
    escribirContador(0);
    process.exit(0);
  }

  const intentos = leerContador() + 1;
  escribirContador(intentos);

  if (intentos > MAX_BLOQUEOS) {
    escribirContador(0);
    process.stderr.write(
      `El hook de verificacion ya bloqueo ${MAX_BLOQUEOS} veces seguidas y deja pasar para no entrar en bucle.\n` +
        `Sigue fallando: ${fallos.map(([n]) => n).join(", ")}. Reportalo como Bloqueado y explica que falta.\n`,
    );
    process.exit(0);
  }

  const detalle = fallos.map(([nombre, salida]) => `--- ${nombre} ---\n${salida}`).join("\n\n");
  process.stderr.write(
    `No termines todavia: ${fallos.map(([n]) => n).join(" y ")} falla.\n` +
      `Corrigelo y vuelve a intentar (intento ${intentos} de ${MAX_BLOQUEOS}).\n\n${detalle}\n`,
  );
  process.exit(2);
});
