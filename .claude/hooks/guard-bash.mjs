// Hook PreToolUse (Bash): bloquea comandos que rompen reglas del proyecto.
//
// Exit 2 bloquea el comando y Claude recibe stderr como error, con la alternativa correcta.
// No duplica lo que ya cubre la lista "deny" de settings.json; aquí van los casos
// que necesitan mirar el contenido del comando.

const REGLAS = [
  {
    // Instalar paquetes con npm/yarn/pnpm en un proyecto Expo: rompe la coherencia
    // de versiones con el SDK. Un "npm install" pelado (restaurar dependencias) sí se permite.
    prueba: (c) => {
      const m = c.match(/\b(npm\s+(?:install|i|add)|yarn\s+add|pnpm\s+(?:add|install))\b([^&|;]*)/);
      if (!m) return false;
      const resto = (m[2] || "").trim();
      if (!resto) return false; // sin paquetes: restauración, se permite
      // Solo banderas (--legacy-peer-deps, etc.): también es restauración
      return resto.split(/\s+/).some((t) => t && !t.startsWith("-"));
    },
    razon:
      "En un proyecto Expo los paquetes se instalan con 'npx expo install <paquete>', que elige " +
      "la version compatible con el SDK. Con npm/yarn/pnpm add es facil romper el proyecto.",
  },
  {
    // Bloquea leer .env y .env.<algo>, pero deja leer .env.example.
    prueba: (c) =>
      /\b(cat|type|more|less|head|tail|Get-Content|gc)\b[^&|;]*\.env(?!\.example\b)(?![\w-])/.test(c),
    razon: "Los archivos .env no se leen desde aqui. Si necesitas saber que variables existen, mira .env.example.",
  },
  {
    prueba: (c) => /\bgit\s+(commit|push)\b[^&|;]*--no-verify\b/.test(c),
    razon:
      "No se omiten las verificaciones previas al commit. Si un hook de git falla, " +
      "hay que arreglar la causa, no saltarla.",
  },
  {
    // "git restore --staged" solo saca archivos del stage y no borra nada: se permite.
    // Sin --staged, o con --worktree/-W, descarta cambios: se bloquea.
    prueba: (c) => {
      if (/\bgit\s+checkout\s+--\s/.test(c)) return true;
      const m = c.match(/\bgit\s+restore\b([^&|;]*)/);
      if (!m) return false;
      const args = m[1];
      const soloStage = /(^|\s)(--staged|-S)(\s|$)/.test(args);
      const tocaArbol = /(^|\s)(--worktree|-W)(\s|$)/.test(args);
      return !soloStage || tocaArbol;
    },
    razon:
      "Ese comando descarta cambios sin guardar y no se puede deshacer. " +
      "Dime que quieres descartar y lo decido yo.",
  },
  {
    prueba: (c) => /\beas\s+(build|submit|update)\b/.test(c),
    razon:
      "Las builds y envios de EAS consumen cuota de mi cuenta y algunos no se deshacen. " +
      "Prepara la configuracion y pideme que lo ejecute yo (ver la skill 'publicar').",
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

  const comando = String((datos.tool_input || {}).command || "");
  if (!comando) process.exit(0);

  for (const regla of REGLAS) {
    if (regla.prueba(comando)) {
      process.stderr.write(`Comando bloqueado por el proyecto.\n${regla.razon}\n`);
      process.exit(2);
    }
  }

  process.exit(0);
});
