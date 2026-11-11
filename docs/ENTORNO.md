# Entorno de desarrollo — este equipo

Arreglos y datos del entorno que no cambian entre proyectos. Si resuelves un problema
de entorno nuevo, anótalo aquí **y** en la plantilla, para no volver a perder tiempo.

## Equipo
- Windows. Terminal: PowerShell y, dentro de VS Code, también Git Bash.
- Verificación solo en emulador Android. No hay iOS disponible.
- Node: comprobar con `node -v` al empezar. Expo SDK 58 exige ≥22.13 y `agent-device` exige
  ≥22.12; con Node 20.x ambos avisan (`EBADENGINE`) o bloquean directamente (`expo lint`,
  `expo install` se niegan a correr), aunque `npx eslint`/`npx tsc` directos sí funcionan.
  Este equipo usa **nvm (nvm4w)**: actualizar con `nvm install <versión>` + `nvm use <versión>`
  (versión actual: **24.22.2**, 2026-11-10). Hay además un Node 26 suelto en
  `C:\Program Files\nodejs` que nvm tapa en el PATH; no usarlo. Si se usa winget en cambio:
  `winget install OpenJS.NodeJS.LTS` y **cerrar y reabrir todas las terminales y VS Code**.

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
- **Emulador `offline` en `adb devices`** (Expo no puede abrir la app): reiniciar adb (`adb kill-server`,
  `adb start-server`, `adb reconnect offline`) **no** lo arregla. Hacer **Cold Boot Now** desde Android Studio
  (Device Manager → ⋮ del AVD), o `emulator -avd Pixel_8 -no-snapshot-load`. Esperar a que
  `adb shell getprop sys.boot_completed` devuelva `1`. Si aparece «System UI isn't responding», tocar «Wait».
- **Abrir la app en Expo Go del emulador sin QR:**
  `adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:<puerto>" host.exp.exponent`
  (`10.0.2.2` es el computador visto desde el emulador).

## Probar en un celular físico (Expo Go)
- Celular y equipo en la **misma red Wi-Fi**. Levantar con `npx expo start --go --port 8081`.
- Si Expo corre en segundo plano no hay QR visible: en Expo Go usar «Enter URL manually» con
  `exp://<IP-LAN>:8081`. Este equipo tiene adaptadores extra (VMware VMnet, Tailscale); la IP
  correcta es la de la red local (`ipconfig`; no la `100.x` de Tailscale ni las `192.168.72.x` /
  `192.168.255.x` de VMware). Última vez: `192.168.40.71`.
- Si no conecta: permitir Node en el Firewall de Windows (redes privadas) o usar `--tunnel`
  (pide `@expo/ngrok`, más lento).
- Antes de levantar, `netstat -ano | grep 8081`: un Metro viejo en el mismo puerto da errores raros.
  Si `npx expo start` dice «Port 8081 is unavailable» y no quieres cerrar esa terminal, usa otro puerto:
  `npx expo start --go --port 8082` (y `exp://<IP>:8082`).
- `npx expo-doctor` puede fallar con `Cannot find module '@expo/env'` por la caché de `npx` (visto el 2026-11-11, también
  con `@latest`). Para revisar versiones basta `npx expo install --check`.

## Grabar video del emulador y editarlo
- **ffmpeg** (Gyan, 9.0.2) se instaló con `winget install --id Gyan.FFmpeg -e` (2026-11-11). El PATH nuevo solo lo ven las
  terminales abiertas después. En la sesión actual usar la ruta completa:
  `/c/Users/Samuel/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin`.
- **Grabar:** `adb shell screenrecord --time-limit N /sdcard/x.mp4` y luego `adb pull /sdcard/x.mp4 <destino>`; límite de
  180 s por clip. Resolución del emulador Pixel: 1080×2400.
- **Git Bash convierte `/sdcard/...` en `C:/Program Files/Git/sdcard/...`**: anteponer `MSYS_NO_PATHCONV=1` al comando
  (o escribir `//sdcard/...`).
- **Zona horaria del emulador:** puede estar en GMT. `adb shell settings put global time_zone America/Bogota` la guarda en
  los ajustes, pero `persist.sys.timezone` sigue en GMT; comprobar la hora en la barra de estado y reiniciar el emulador si no cambió.
- **Hyperframes** (HeyGen, HTML → MP4, requiere Node ≥ 22 y ffmpeg): **usado y funcionando (2026-11-11)** con Node 24.22.2
  (nvm4w) y ffmpeg por ruta completa en el PATH. No hace falta instalar nada: `npx hyperframes init <dir> --example blank
  --non-interactive --resolution landscape`, `npx hyperframes check`, `npx hyperframes snapshot --at 3,9,60`,
  `npx hyperframes render --skill=hyperframes -o <salida>.mp4`. Sin ffmpeg/ffprobe en el PATH falla con
  `audio_source_unreadable`. Un render de 4 min tarda varios minutos (correrlo en segundo plano). Receta completa en
  `artifacts/video/promo/build.mjs`: recorta con `trim` dentro de `-vf` (no `-ss/-to`), sintetiza la música en JS y genera el HTML.
- **Hora de Bogotá en el emulador sin reiniciar:** `adb shell "service call alarm 3 s16 America/Bogota"` (cambia al
  instante la hora de la barra de estado; `settings put global time_zone` no basta). Se pierde al reiniciar el AVD.
- **Quitar el botón flotante «Tools» de Expo Go** (tapa contenido en capturas y video): menú de desarrollo
  (`adb shell input keyevent 82`) → bajar → interruptor «Tools button». Se recuerda entre sesiones.
- **Modo oscuro del emulador:** `adb shell "cmd uimode night yes"` / `no`; para el video empezar siempre en `no`.
- **Automatizar el emulador sin gastar tokens:** `adb shell uiautomator dump` + un script que busque el nodo por texto y haga
  `input tap` (ver `ui.mjs` descrito en STATUS). `input text` con `%s` por espacio; cerrar el teclado con `back` antes de
  tocar botones; el campo de contraseña en el login está en (500, 1316) y el botón en (540, 1683) en 1080×2400.
- **No copiar SQL al portapapeles con `clip` desde Git Bash:** rompe los acentos y emojis (UTF-8 → OEM). Abrir el archivo en
  un editor y copiar desde ahí.

## Bash tool y archivos largos
- No escribir archivos con heredocs que lleven comillas, apóstrofes o secuencias de escape:
  fallan con `unexpected EOF` o corrompen el contenido en silencio. Usar `Write`/`Edit`.
- Tampoco `node -e "..."` con código que lleve plantillas (`` ` `` o `${}`): el shell las expande y deja el código vacío.
  Y `node - <<EOF` / `python3 - <<EOF` que leen de stdin se cuelgan en esta herramienta.

## Pruebas con jest-expo
Si un test falla con "Must use import to load ES Module", es porque el paquete se resuelve
como ESM. La solución es ampliar `transformIgnorePatterns` en la configuración de jest
con los paquetes implicados.

Si los tests no compilan por tipos, revisar que `tsconfig.json` declare los tipos de jest:
las versiones recientes de TypeScript ya no los incluyen solas.

## Rutas largas en Windows
Borrar `node_modules` puede fallar por la longitud de las rutas. Alternativa:
`npx rimraf node_modules` en lugar de `Remove-Item -Recurse`.

## Node en el Bash de Claude Code (Git Bash)
El Bash de esta herramienta toma por defecto el **Node 26** de `C:\Program Files\nodejs` (nvm queda tapado). Antes de
`npx`, `npm` o `jest` anteponer `export PATH="/c/nvm4w/nodejs:$PATH"` (da la 24.22.2 de nvm4w). `tsc` funciona con
cualquiera, pero `expo lint`/`expo install` y las pruebas se hacen con la 24.

## Páginas web estáticas en Vercel (`web-auth/`)
- Plan Hobby gratuito (uso personal/no comercial; confirmar límites en su página de precios). Iniciar sesión con la
  cuenta de GitHub dueña del repo (`SamuelBlanco-65`) y dar acceso solo a `NEUROTRACK_EM`.
- Project settings: **Root Directory `web-auth`**; variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` (sin el
  prefijo `EXPO_PUBLIC_`); redespliega solo con cada push a `master`. Cambiar una variable exige redesplegar.
- Detalle y lista de prueba: `docs/SUPABASE-CORREO.md`.

## Vista previa de HTML (correos y web) con Chrome headless
```
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=500,760 --screenshot=<salida>.png file:///<ruta>.html
```
Usar ancho **≥ 500** (menos recorta el lado derecho). Sin `--blink-settings=preferredColorScheme=0|1` sigue el modo
del sistema. Para correos, sustituir antes `{{ .SiteURL }}` y `{{ .TokenHash }}` con `sed` en una copia del
scratchpad. No sustituye una prueba en Gmail real (Gmail aplica su propio modo oscuro).

## Cosas que NO hay que intentar
_(Se llena con lo aprendido; evita repetir callejones sin salida entre proyectos.)_
- Instalar paquetes con `npm install <paquete>` en un proyecto Expo: usar `npx expo install`.

## Exportar `docs/ENTREGA-FINAL.md` a PDF (2026-11-11)
No hay pandoc. Se genera con Chrome headless: una página HTML que carga `marked@12.0.2` y `mermaid@10.9.1` desde jsDelivr, convierte
el Markdown (insertado como JSON), dibuja los dos diagramas y se imprime con
`chrome.exe --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=30000 --print-to-pdf=<salida>.pdf file:///<ruta>.html`.
Necesita internet. Hoja A4, Georgia 11 pt, márgenes 18/17 mm, diagramas al 82 % de ancho. Para contar páginas no hay `pdfinfo`:
`pdftotext -layout x.pdf x.txt` y contar los `\f`. El script de generación quedó en el scratchpad de la sesión, no en el repo.
