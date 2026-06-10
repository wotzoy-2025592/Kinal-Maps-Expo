import { ModeloMapa }      from './model_2level.js';
import { VistaMapa }       from './view_2level.js';
import { ControladorMapa } from './controller_2level.js';

document.addEventListener('DOMContentLoaded', () => {
    const modelo      = new ModeloMapa();
    const vista       = new VistaMapa();
    const controlador = new ControladorMapa(modelo, vista);

    controlador.iniciar();
});