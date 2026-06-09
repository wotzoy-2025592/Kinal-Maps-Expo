import { MAP_CONFIG } from './config/config-basicos-lv1.js';
import { MapModel } from './model/model-basicos-lv1.js';
import { MapView } from './view/view-basicos-lv1.js';
import { MapController } from './controller/controller-basicos-lv1.js';
import { buildGrid, buildLabels, buildSearchItems } from './data/data-basicos-lv1.js';

/**
 * Inicialización de la aplicación
 * Punto de entrada principal
 */
class Application {
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
    }

    /**
     * Inicializa todos los componentes de la aplicación
     */
    init() {
        // Obtener referencias a elementos del DOM
        const canvasElement = document.getElementById('map');
        const mapWrapElement = document.getElementById('map-wrap');

        if (!canvasElement || !mapWrapElement) {
            console.error('Elementos del DOM no encontrados');
            return;
        }

        // Construir datos del mapa
        const grid = buildGrid(MAP_CONFIG.ROWS, MAP_CONFIG.COLS);
        const labels = buildLabels();
        const searchItems = buildSearchItems();

        // Crear instancias MVC
        this.model = new MapModel(grid, labels, searchItems);
        this.view = new MapView(canvasElement, mapWrapElement);
        this.controller = new MapController(this.model, this.view, searchItems);

        // Inicializar la aplicación
        this.controller.init();
    }

    /**
     * Método para recargar/limpiar el estado
     */
    reset() {
        if (this.model) {
            this.model.clearRoute();
        }
        if (this.view && this.model) {
            this.view.render(this.model);
        }
        if (this.controller) {
            this.controller.updateUI();
        }
    }
}

// Esperar a que el DOM esté listo y lanzar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();

    // Exponer la app globalmente para debugging (opcional)
    window.app = app;
});