// ============================================================
//  MAIN.JS  —  Punto de entrada, inicializa MVC
// ============================================================

import { GRID, COLS, ROWS, NavState } from './model_basicos2l.js';
import { initView, renderAll } from './view_basicos2l.js';
import { initController } from './controller_basicos2l.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. MODEL — GRID ya está construida en model_basicos2l.js
  // 2. VIEW — inicializa el canvas y carga la imagen del mapa
  const viewState = initView('mapCanvas', 'img/mapa.jpg');

  // 3. CONTROLLER — conecta la UI con el modelo y la vista
  initController();

  // Renderizar inicial (con fondo hasta que cargue la imagen)
  renderAll();

  // Exponer en window para debug desde consola (opcional)
  window._kinal = { GRID, NavState, viewState };

  console.log('%cKinal Maps MVC iniciado ✓', 'color:#27ae60;font-weight:bold');
  console.log(`Grilla: ${COLS}×${ROWS} celdas (${COLS * 14}×${ROWS * 14} px)`);
  console.log(`Mapa cargado: 1492×1054 px — Zoom y pan listos.`);
});