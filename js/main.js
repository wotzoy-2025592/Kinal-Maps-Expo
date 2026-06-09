import { MapModel } from './model.js';
import { MapView } from './view.js';
import { MapController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
  const model = new MapModel();
  const view = new MapView();
  const controller = new MapController(model, view);

  controller.init();

  window.addEventListener('resize', () => {
    view.applyTransform();
  });
});