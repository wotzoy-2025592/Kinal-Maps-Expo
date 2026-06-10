        import { buildGrid } from './diver-model.js';
        import { MapView } from './diver-view.js';
        import { MapController } from './diver-controller.js';

        window.addEventListener('DOMContentLoaded', () => {
        // 1. MODEL — construye la grilla con los obstáculos
        const grid = buildGrid();

        // 2. VIEW — crea el renderizador del canvas
        const view = new MapView('mapCanvas', 'image/diversificado-lvl2.png');
        view.setGrid(grid);

        // 3. CONTROLLER — conecta la UI con el modelo y la vista
        const controller = new MapController(view, grid);

        // Exponer en window para debug desde consola (opcional)
        window._kinal = { grid, view, controller };
            
        console.log('%cKinal Maps MVC iniciado ✓', 'color:#27ae60;font-weight:bold');
        console.log(`Grilla: ${import('./diver-model.js').then ? '' : ''}` +
                    `Cols×Rows = cargando desde model.js`);
});