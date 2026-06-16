import { GRID, COLS, ROWS, NavState } from './model_basicos2l.js';
import { initView, renderAll } from './view_basicos2l.js';
import { initController } from './controller_basicos2l.js';

window.addEventListener('DOMContentLoaded', () => {

  const viewState = initView('mapCanvas', 'img/mapa.jpg');

  initController();

  renderAll();

  window._kinal = { GRID, NavState, viewState };

  console.log('%cKinal Maps MVC iniciado ✓', 'color:#27ae60;font-weight:bold');
  console.log(`Grilla: ${COLS}×${ROWS} celdas (${COLS * 14}×${ROWS * 14} px)`);
  console.log(`Mapa cargado: 1492×1054 px — Zoom y pan listos.`);
});