import { ANCHO, ALTO, FILAS, COLUMNAS, CELDA, COLORES, BORDE } from './config_2level.js';

export class VistaMapa {
    constructor() {
        this.lienzo        = document.getElementById('map');
        this.lapiz         = this.lienzo.getContext('2d');
        this.envoltura     = document.getElementById('map-canvas-wrap');
        this.contenedorMapa = document.getElementById('map-wrap');
        this.panelEntrada   = document.getElementById('entry-panel');

        this.lienzo.width  = ANCHO;
        this.lienzo.height = ALTO;

        this.escala = 1.0;
        this.desplazamientoX = 0;
        this.desplazamientoY = 0;
    }

    aplicarTransformacion() {
        this.envoltura.style.transform = `translate(${this.desplazamientoX}px,${this.desplazamientoY}px) scale(${this.escala})`;
        document.getElementById('sb-zoom').textContent = Math.round(this.escala * 100) + '%';
        this.actualizarBarraEscala();
    }

    actualizarBarraEscala() {
        const pixeles50m = (50 / 5) * CELDA * this.escala;
        document.getElementById('scale-line').style.width = Math.min(120, Math.max(40, pixeles50m)) + 'px';
    }

    centrarMapa() {
        this.desplazamientoX = (this.contenedorMapa.clientWidth  - ANCHO * this.escala) / 2;
        this.desplazamientoY = (this.contenedorMapa.clientHeight - ALTO  * this.escala) / 2;
        this.aplicarTransformacion();
    }

    dibujar(modelo) {
        const lapiz = this.lapiz;
        lapiz.clearRect(0, 0, ANCHO, ALTO);
        lapiz.fillStyle = '#ffffff';
        lapiz.fillRect(0, 0, ANCHO, ALTO);

        // Celdas rellenas
        for (let fila = 0; fila < FILAS; fila++) {
            for (let columna = 0; columna < COLUMNAS; columna++) {
                const tipo = modelo.grilla[fila][columna];
                if (tipo === 0) continue;
                lapiz.fillStyle = COLORES[tipo] || '#cccccc';
                lapiz.fillRect(columna * CELDA, fila * CELDA, CELDA, CELDA);
            }
        }

        // Bordes estructurales
        for (let fila = 0; fila < FILAS; fila++) {
            for (let columna = 0; columna < COLUMNAS; columna++) {
                const tipo = modelo.grilla[fila][columna];
                if (tipo === 0) continue;
                const colorBorde = BORDE[tipo];
                if (!colorBorde) continue;
                lapiz.strokeStyle = colorBorde;
                lapiz.lineWidth = 1.5;

                // Borde izquierdo
                if (columna === 0 || modelo.grilla[fila][columna - 1] !== tipo) {
                    lapiz.beginPath();
                    lapiz.moveTo(columna * CELDA, fila * CELDA);
                    lapiz.lineTo(columna * CELDA, (fila + 1) * CELDA);
                    lapiz.stroke();
                }
                // Borde derecho
                if (columna === COLUMNAS - 1 || modelo.grilla[fila][columna + 1] !== tipo) {
                    lapiz.beginPath();
                    lapiz.moveTo((columna + 1) * CELDA, fila * CELDA);
                    lapiz.lineTo((columna + 1) * CELDA, (fila + 1) * CELDA);
                    lapiz.stroke();
                }
                // Borde superior
                if (fila === 0 || modelo.grilla[fila - 1][columna] !== tipo) {
                    lapiz.beginPath();
                    lapiz.moveTo(columna * CELDA, fila * CELDA);
                    lapiz.lineTo((columna + 1) * CELDA, fila * CELDA);
                    lapiz.stroke();
                }
                // Borde inferior
                if (fila === FILAS - 1 || modelo.grilla[fila + 1][columna] !== tipo) {
                    lapiz.beginPath();
                    lapiz.moveTo(columna * CELDA, (fila + 1) * CELDA);
                    lapiz.lineTo((columna + 1) * CELDA, (fila + 1) * CELDA);
                    lapiz.stroke();
                }
            }
        }

        // calculo de la ruta
        if (modelo.rutaCalculada && modelo.rutaCalculada.length > 1) {
            lapiz.strokeStyle = '#c0392b';
            lapiz.lineWidth = 4;
            lapiz.lineCap   = 'round';
            lapiz.lineJoin  = 'round';
            lapiz.beginPath();
            modelo.rutaCalculada.forEach((nodo, indice) => {
                const posX = nodo.columna * CELDA + CELDA / 2;
                const posY = nodo.fila    * CELDA + CELDA / 2;
                if (indice === 0) lapiz.moveTo(posX, posY);
                else              lapiz.lineTo(posX, posY);
            });
            lapiz.stroke();
        }

        // puntos de origen y destino
        if (modelo.nodoOrigen)
            this.dibujarMarcador(
                modelo.nodoOrigen.columna * CELDA + CELDA / 2,
                modelo.nodoOrigen.fila    * CELDA + CELDA / 2,
                '#27ae60'
            );
        if (modelo.nodoDestino)
            this.dibujarMarcador(
                modelo.nodoDestino.columna * CELDA + CELDA / 2,
                modelo.nodoDestino.fila    * CELDA + CELDA / 2,
                '#c0392b'
            );

        // Etiqueta de texto
        lapiz.textAlign    = 'center';
        lapiz.textBaseline = 'middle';
        modelo.etiquetas.forEach(etq => {
            lapiz.font      = `${etq.negrita ? '600' : '400'} ${etq.tamano}px 'IBM Plex Mono', monospace`;
            lapiz.fillStyle = '#1a1a1a';
            const lineas    = etq.texto.split('\n');
            const alturaLinea = etq.tamano * 1.3;
            const baseY     = etq.fila * CELDA - ((lineas.length - 1) * alturaLinea) / 2;
            lineas.forEach((linea, indice) => {
                lapiz.fillText(linea, etq.columna * CELDA, baseY + indice * alturaLinea);
            });
        });
    }

    dibujarMarcador(posX, posY, color) {
        this.lapiz.fillStyle = color;
        this.lapiz.beginPath();
        this.lapiz.arc(posX, posY, 7, 0, Math.PI * 2);
        this.lapiz.fill();
        this.lapiz.strokeStyle = '#fff';
        this.lapiz.lineWidth = 2;
        this.lapiz.stroke();
    }

    alternarPanelEntrada() { this.panelEntrada.classList.toggle('visible'); }
    cerrarPanelEntrada()   { this.panelEntrada.classList.remove('visible'); }

    actualizarUI(modelo) {
        const elementoOrigen  = document.getElementById('origin-name');
        const elementoDestino = document.getElementById('dest-name');
        const botonCalcular   = document.getElementById('calc-route-btn');

        elementoOrigen.textContent = modelo.nodoOrigen
            ? `Fila ${modelo.nodoOrigen.fila}, Col ${modelo.nodoOrigen.columna}`
            : 'Sin seleccionar';
        elementoOrigen.classList.toggle('set', !!modelo.nodoOrigen);

        elementoDestino.textContent = modelo.nodoDestino
            ? `Fila ${modelo.nodoDestino.fila}, Col ${modelo.nodoDestino.columna}`
            : 'Sin seleccionar';
        elementoDestino.classList.toggle('set', !!modelo.nodoDestino);

        botonCalcular.disabled = !(modelo.nodoOrigen && modelo.nodoDestino);
    }
}