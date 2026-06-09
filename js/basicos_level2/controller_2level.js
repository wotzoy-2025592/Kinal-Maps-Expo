import { CELDA, FILAS, COLUMNAS, lugaresEnMapa } from './config_2level.js';

export class ControladorMapa {
    constructor(modelo, vista) {
        this.modelo        = modelo;
        this.vista         = vista;
        this.modoActual    = 'view';
        this.arrastrando   = false;
        this.inicioX       = 0;
        this.inicioY       = 0;
        this.lugaresEnMapa = lugaresEnMapa;
    }

    iniciar() {
        this.registrarEventos();
        this.vista.centrarMapa();
        this.vista.dibujar(this.modelo);
    }

    registrarEventos() {
        document.getElementById('btn-view').addEventListener('click',   () => this.cambiarModo('view'));
        document.getElementById('btn-origin').addEventListener('click', () => this.cambiarModo('origin'));
        document.getElementById('btn-dest').addEventListener('click',   () => this.cambiarModo('dest'));

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.modelo.limpiarRuta();
            this.vista.actualizarUI(this.modelo);
            document.getElementById('route-info').textContent = '';
            this.vista.dibujar(this.modelo);
        });

        document.getElementById('calc-route-btn').addEventListener('click', () => {
            const ruta = this.modelo.encontrarRuta();
            const elementoInfo = document.getElementById('route-info');
            elementoInfo.textContent = ruta
                ? `Distancia: ~${ruta.length * 5} metros (${ruta.length} celdas)`
                : 'No se encontro una ruta viable.';
            this.vista.dibujar(this.modelo);
        });

        // Zoom con scroll
        this.vista.contenedorMapa.addEventListener('wheel', (evento) => {
            evento.preventDefault();
            const rectangulo      = this.vista.contenedorMapa.getBoundingClientRect();
            const ratonX          = evento.clientX - rectangulo.left;
            const ratonY          = evento.clientY - rectangulo.top;
            const escalaAnterior  = this.vista.escala;
            const factor          = evento.deltaY < 0 ? 1.12 : 0.89;
            const nuevaEscala     = Math.min(4, Math.max(0.2, escalaAnterior * factor));

            this.vista.desplazamientoX = ratonX - (ratonX - this.vista.desplazamientoX) * (nuevaEscala / escalaAnterior);
            this.vista.desplazamientoY = ratonY - (ratonY - this.vista.desplazamientoY) * (nuevaEscala / escalaAnterior);
            this.vista.escala = nuevaEscala;
            this.vista.aplicarTransformacion();
        }, { passive: false });

        document.getElementById('zoom-in').addEventListener('click',  () => this.zoomCentro(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomCentro(0.8));

        document.getElementById('ver-entrada-btn').addEventListener('click', () => this.vista.alternarPanelEntrada());
        document.getElementById('entry-close').addEventListener('click',     () => this.vista.cerrarPanelEntrada());

        document.getElementById('entry-go-btn').addEventListener('click', () => {
            this.modelo.nodoOrigen = { fila: 6, columna: 32 };
            this.vista.actualizarUI(this.modelo);
            this.vista.cerrarPanelEntrada();
            this.vista.dibujar(this.modelo);
        });

        // Arrastre del mapa
        const contenedor = this.vista.contenedorMapa;
        contenedor.addEventListener('mousedown', (evento) => {
            if (evento.target.closest('.zoom-btn') || evento.target.closest('#ver-entrada-btn') || evento.target.closest('#entry-panel')) return;
            this.arrastrando = true;
            contenedor.classList.add('grabbing');
            this.inicioX = evento.clientX - this.vista.desplazamientoX;
            this.inicioY = evento.clientY - this.vista.desplazamientoY;
        });
        window.addEventListener('mousemove', (evento) => {
            if (!this.arrastrando) return;
            this.vista.desplazamientoX = evento.clientX - this.inicioX;
            this.vista.desplazamientoY = evento.clientY - this.inicioY;
            this.vista.aplicarTransformacion();
        });
        window.addEventListener('mouseup', () => {
            if (!this.arrastrando) return;
            this.arrastrando = false;
            contenedor.classList.remove('grabbing');
        });

        // Click en la celda
        this.vista.lienzo.addEventListener('click', (evento) => {
            const rectangulo = this.vista.lienzo.getBoundingClientRect();
            const clicX = (evento.clientX - rectangulo.left) / this.vista.escala;
            const clicY = (evento.clientY - rectangulo.top)  / this.vista.escala;
            const columna = Math.floor(clicX / CELDA);
            const fila    = Math.floor(clicY / CELDA);
            if (fila >= 0 && fila < FILAS && columna >= 0 && columna < COLUMNAS)
                this.manejarClickCelda(fila, columna);
        });

        // Buscar lugar
        document.getElementById('search-btn').addEventListener('click', () => this.ejecutarBusqueda());
        document.getElementById('search-peticion').addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter') this.ejecutarBusqueda();
        });
    }

    cambiarModo(modo) {
        this.modoActual = modo;
        document.querySelectorAll('.mode-btn').forEach(boton => boton.classList.remove('active'));
        if (modo === 'view')   document.getElementById('btn-view').classList.add('active');
        if (modo === 'origin') document.getElementById('btn-origin').classList.add('active');
        if (modo === 'dest')   document.getElementById('btn-dest').classList.add('active');
    }

    manejarClickCelda(fila, columna) {
        const nombreZona = this.modelo.obtenerNombreZona(fila, columna);
        document.getElementById('cx').textContent    = columna;
        document.getElementById('cy').textContent    = fila;
        document.getElementById('czone').textContent = nombreZona;
        document.getElementById('sb-sel').innerHTML  = `SELECCION: <span>Fila ${fila}, Col ${columna} (${nombreZona})</span>`;

        if (this.modoActual === 'origin') {
            this.modelo.nodoOrigen = { fila, columna };
            this.vista.actualizarUI(this.modelo);
            this.cambiarModo('view');
        } else if (this.modoActual === 'dest') {
            this.modelo.nodoDestino = { fila, columna };
            this.vista.actualizarUI(this.modelo);
            this.cambiarModo('view');
        }
        this.vista.dibujar(this.modelo);
    }

    ejecutarBusqueda() {
        const consulta = document.getElementById('search-peticion').value.trim().toLowerCase();
        if (!consulta) return;
        const encontrado = this.lugaresEnMapa.find(lugar => lugar.nombre.toLowerCase().includes(consulta));
        if (encontrado) {
            this.enfocarCelda(encontrado.fila, encontrado.columna);
            this.manejarClickCelda(encontrado.fila, encontrado.columna);
        } else {
            alert('No se encontro ningun lugar con ese nombre.');
        }
    }

    enfocarCelda(fila, columna) {
        const anchoVentana  = this.vista.contenedorMapa.clientWidth;
        const altoVentana   = this.vista.contenedorMapa.clientHeight;
        this.vista.escala = 2.0;
        this.vista.desplazamientoX = anchoVentana / 2 - (columna * CELDA + CELDA / 2) * this.vista.escala;
        this.vista.desplazamientoY = altoVentana  / 2 - (fila    * CELDA + CELDA / 2) * this.vista.escala;
        this.vista.aplicarTransformacion();
    }

    zoomCentro(factor) {
        const escalaAnterior = this.vista.escala;
        const nuevaEscala    = Math.min(4, Math.max(0.2, escalaAnterior * factor));
        const centroX = this.vista.contenedorMapa.clientWidth  / 2;
        const centroY = this.vista.contenedorMapa.clientHeight / 2;
        this.vista.desplazamientoX = centroX - (centroX - this.vista.desplazamientoX) * (nuevaEscala / escalaAnterior);
        this.vista.desplazamientoY = centroY - (centroY - this.vista.desplazamientoY) * (nuevaEscala / escalaAnterior);
        this.vista.escala = nuevaEscala;
        this.vista.aplicarTransformacion();
    }
}