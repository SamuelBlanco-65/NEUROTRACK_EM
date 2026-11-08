---
name: arranque
description: Reconstruye el contexto al empezar una sesión de trabajo: lee el estado guardado, revisa git y comprueba que el proyecto compila. Úsalo como primer comando de cada sesión, sobre todo después de /clear.
---

# Arranque de sesión

Objetivo: saber en 1 minuto dónde quedó el proyecto, sin que yo tenga que explicártelo.
No escribas código en esta etapa.

## 1. Lee el estado guardado
- `docs/STATUS.md` completo. Presta especial atención a:
  - **Siguiente acción concreta** — es tu punto de partida.
  - **Ya intentado, no repetir** — no vuelvas a intentar nada de esa lista.
  - **Errores conocidos** — aplica los arreglos de entorno antes de ejecutar comandos.
- `docs/REQUISITOS.md`: cuenta cuántos requisitos están Pendiente / Implementado sin probar / Verificado.
- `docs/ENTORNO.md` si existe: contiene los arreglos de Windows, PATH y emulador de este equipo.
- Si `docs/STATUS.md` no existe, dímelo y propón ejecutar `/iniciar-proyecto`.

## 2. Revisa el repositorio
- `git status` (¿hay cambios sin commitear? ¿archivos sin seguimiento?)
- `git log --oneline -5`
- Si hay cambios sin commitear, no los deshagas ni los commitees: solo repórtalos.

## 3. Comprueba que compila
- `npm run typecheck`. Si el script no existe, usa `npx tsc --noEmit`.
- Si falla, eso pasa a ser la siguiente acción, por encima de lo que diga STATUS.

## 4. Repórtame esto y detente

```
Rama: <rama> · Último commit: <hash> <mensaje>
Sin commitear: <lista corta o "nada">
Requisitos: <n> Verificado · <n> Sin probar · <n> Pendiente
Typecheck: <pasa / falla con N errores>
Objetivo en curso: <una frase de STATUS>
Siguiente acción propuesta: <un solo paso ejecutable>
```

Si detectas una contradicción entre STATUS y lo que ves en el código o en git
(por ejemplo, STATUS dice que una tarea está Verificada pero no hay captura en `artifacts/`),
dímelo explícitamente en lugar de confiar en el documento.

No empieces a implementar hasta que yo confirme la siguiente acción.
