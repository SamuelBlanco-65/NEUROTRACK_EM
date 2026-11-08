---
name: publicar
description: Prepara una build real y su distribución con EAS (perfiles, versionado, variables de entorno, firma y actualizaciones). Úsalo cuando haya que entregar un APK/AAB instalable o publicar en una tienda.
---

# Publicar

## 0. Reglas de esta skill
- **Nunca ejecutes `eas` sin pedírmelo primero.** Las builds consumen cuota de mi cuenta
  y algunas acciones (subir a una tienda, crear credenciales) no se deshacen fácil.
- Genera y revisa la configuración; yo ejecuto, o te autorizo explícitamente.
- Verifica el esquema actual con `eas build:configure` y la documentación vigente
  en lugar de escribir `eas.json` de memoria: este archivo cambia entre versiones.

## 1. Antes de pensar en publicar
Checklist previo. Si algo falla, no hay build que valga:
- `npm run typecheck`, `npm run lint`, `npm test` pasan.
- `npx expo-doctor` sin advertencias graves.
- Todos los requisitos Obligatorios de `docs/REQUISITOS.md` en Verificado.
- Ningún `// MOCK:` sin anotar en `docs/STATUS.md`.
- Ningún secreto en el repositorio (ejecuta el subagente `security-reviewer`).

## 2. Identidad de la app
En `app.json` o `app.config.ts`:
- `name`, `slug`, `version`
- `android.package` (y `ios.bundleIdentifier` si aplica) — **no se pueden cambiar**
  después de publicar en una tienda. Decídelo bien la primera vez.
- Icono y pantalla de carga en las resoluciones que pide cada plataforma.
- Permisos: solo los que la app realmente usa. Cada permiso de más hay que justificarlo
  ante la tienda y es un riesgo de rechazo.

## 3. Perfiles de build
Tres entornos, no uno:
- **development** — para desarrollo con cliente de desarrollo.
- **preview** — instalable para probar en un teléfono real o entregar al profesor.
  Para Android, un APK es lo más fácil de instalar directamente.
- **production** — formato de tienda (AAB en Android) y firma de producción.

Cada perfil apunta a su propia configuración y URL base. Si los tres hablan con el mismo
servidor, dilo explícitamente en lugar de dejarlo implícito.

## 4. Variables de entorno
- Las variables públicas (prefijo `EXPO_PUBLIC_`) se incrustan en el binario: trátalas como visibles.
- Lo que deba quedar fuera del repositorio va en la configuración de entorno de EAS,
  no en un `.env` versionado.
- Documenta en `.env.example` qué variables necesita el proyecto.

## 5. Versionado
- `version` es lo que ve el usuario; el número de build interno es lo que exige la tienda
  que suba en cada envío.
- Define si el incremento es automático o manual y déjalo escrito en `docs/DECISIONES.md`.
- Cada entrega al profesor o a la tienda se etiqueta en git, para poder volver a ella.

## 6. Firma
- Deja que EAS gestione las credenciales salvo que haya una razón para no hacerlo.
- Si se gestionan a mano: la clave de firma de Android, perdida, significa no poder
  actualizar nunca más esa app en la tienda. Respaldo obligatorio, fuera del repositorio.

## 7. Actualizaciones sobre el aire (OTA)
- Sirven para JavaScript y recursos. **No** sirven para cambios nativos
  (un paquete nuevo con código nativo, permisos, iconos): eso necesita build nueva.
- El canal de actualización debe coincidir con el perfil de build, o la app no recibe nada.

## 8. Tiendas (si aplica)
- Ficha: descripción, capturas por tamaño de pantalla, clasificación de contenido.
- Política de privacidad accesible por URL y formulario de datos recolectados:
  si la app pide permisos o envía datos, hay que declararlo.
- Cuenta de desarrollador con pago anual o único según la plataforma. Confírmame que existe
  antes de planear una entrega que dependa de ella.

## 9. Al terminar
Repórtame: perfil usado, artefacto generado y dónde está, versión y número de build,
qué quedó sin probar en dispositivo real, y los pasos que ejecuté yo frente a los que ejecutaste tú.
