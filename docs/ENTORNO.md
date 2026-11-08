# Entorno de desarrollo — este equipo

Arreglos y datos del entorno que no cambian entre proyectos. Si resuelves un problema
de entorno nuevo, anótalo aquí **y** en la plantilla, para no volver a perder tiempo.

## Equipo
- Windows. Terminal: PowerShell y, dentro de VS Code, también Git Bash.
- Verificación solo en emulador Android. No hay iOS disponible.
- Node: comprobar con `node -v` al empezar. Expo moderno pide una versión reciente;
  si aparece `EBADENGINE`, actualizar con `winget install OpenJS.NodeJS.LTS`
  y **cerrar y reabrir todas las terminales y VS Code** para que tome la versión nueva.

## adb y el SDK de Android
`adb` existe pero normalmente **no está en el PATH**. En cada sesión de terminal nueva
hay que añadirlo antes de usar el emulador.

En Git Bash, las variables tipo `%LOCALAPPDATA%` o `$LOCALAPPDATA` se expanden mal
y producen rutas rotas. Usar la ruta absoluta:

```bash
export PATH="$PATH:/c/Users/<usuario>/AppData/Local/Android/Sdk/platform-tools"
```

En PowerShell:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

Comprobar con `adb devices`: debe aparecer un `emulator-*`.

## Emulador y capturas
- Orden obligatorio con agent-device: **abrir sesión antes de capturar**. Un `screenshot`
  sin sesión abierta falla.
- Si el daemon de agent-device arrancó en una terminal donde `adb` no estaba en el PATH,
  seguirá sin encontrarlo aunque luego lo arregles. En ese caso hay que reiniciar el daemon
  (pedir permiso antes de matar el proceso) o usar la alternativa de abajo.
- Alternativa que siempre funciona:
  `adb exec-out screencap -p > artifacts/<nombre>.png`

## Pruebas con jest-expo
Si un test falla con "Must use import to load ES Module", es porque el paquete se resuelve
como ESM. La solución es ampliar `transformIgnorePatterns` en la configuración de jest
con los paquetes implicados.

Si los tests no compilan por tipos, revisar que `tsconfig.json` declare los tipos de jest:
las versiones recientes de TypeScript ya no los incluyen solas.

## Rutas largas en Windows
Borrar `node_modules` puede fallar por la longitud de las rutas. Alternativa:
`npx rimraf node_modules` en lugar de `Remove-Item -Recurse`.

## Cosas que NO hay que intentar
_(Se llena con lo aprendido; evita repetir callejones sin salida entre proyectos.)_
- Instalar paquetes con `npm install <paquete>` en un proyecto Expo: usar `npx expo install`.
