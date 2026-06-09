import { MapModel } from './model/model.js';
import { MapView } from './view/view.js';
import { MapController } from './controller/controller.js';

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

  init() {
    const canvasElement = document.getElementById('map');
    const mapWrapElement = document.getElementById('map-wrap');

    if (!canvasElement || !mapWrapElement) {
      console.error('Elementos del DOM no encontrados');
      return;
    }

    this.model = new MapModel();
    this.view = new MapView();
    this.controller = new MapController(this.model, this.view);

    this.controller.init();
  }

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

  window.addEventListener('resize', () => {
    if (app.view) {
      app.view.applyTransform();
    }
  });

  // Exponer la app globalmente para debugging (opcional)
  window.app = app;
});