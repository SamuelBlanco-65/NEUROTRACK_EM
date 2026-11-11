import { createAction } from '@reduxjs/toolkit';

/**
 * Se despacha cuando la sesión termina (cerrar sesión, borrar cuenta, sesión expirada):
 * vacía los datos de salud en memoria (síntomas, actividades, cuidador, recordatorios...) para
 * que la siguiente persona que use el teléfono no vea nada de la anterior. Conserva las
 * preferencias de accesibilidad (son del dispositivo) y el estado de `auth`, que gestiona su
 * propio slice.
 */
export const resetAll = createAction('app/resetAll');
