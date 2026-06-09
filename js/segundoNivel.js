const CELDA = 24;
const COLUMNAS = 80;
const FILAS = 55;
const ANCHO = COLUMNAS * CELDA;
const ALTO = FILAS * CELDA;


const T = {
    salonH24izq:   1,
    salonH23:      2,
    salonH22:      3,
    pasilloBloqueH: 4,
    gradasBloqueH:  5,
    miniSalonH25:   6,
    miniSalonH26:   7,
    pasilloConectorH: 8,
    coordinacion:  9,
    salonG25:     10,
    salonG24:     11,
    serviciosSS:  12,
    salonG21:     13,
    pasilloCentral: 14,
    gradasG:       15,
    gradasConector: 16,
    oficina1:      17,
    oficina2:      18,
    laboratorioTics: 19,
    pasilloEste:   20,
    preceptorias:  21,
    salaReuniones: 22,
    gradasBloqueB: 23,
    salonB22der:   24,
    salonB21der:   25,
    areaVerde:     26,
    pasilloHorizontalDer: 27,
};


const COLORES = {
    [T.salonH24izq]:        '#b0b0b0',
    [T.salonH23]:           '#b0b0b0',
    [T.salonH22]:           '#b0b0b0',
    [T.pasilloBloqueH]:     '#f5c842',
    [T.gradasBloqueH]:      '#4ecdc4',
    [T.miniSalonH25]:       '#b0b0b0',
    [T.miniSalonH26]:       '#b0b0b0',
    [T.pasilloConectorH]:   '#f5c842',
    [T.coordinacion]:       '#b0b0b0',
    [T.salonG25]:           '#b0b0b0',
    [T.salonG24]:           '#b0b0b0',
    [T.serviciosSS]:        '#b0b0b0',
    [T.salonG21]:           '#b0b0b0',
    [T.pasilloCentral]:     '#f5c842',
    [T.gradasG]:            '#4ecdc4',
    [T.gradasConector]:     '#4ecdc4',
    [T.oficina1]:           '#b0b0b0',
    [T.oficina2]:           '#b0b0b0',
    [T.laboratorioTics]:    '#b0b0b0',
    [T.pasilloEste]:        '#f5c842',
    [T.preceptorias]:       '#b0b0b0',
    [T.salaReuniones]:      '#b0b0b0',
    [T.gradasBloqueB]:      '#4ecdc4',
    [T.salonB22der]:        '#b0b0b0',
    [T.salonB21der]:        '#b0b0b0',
    [T.areaVerde]:          '#5dbb63',
    [T.pasilloHorizontalDer]: '#f5c842',
};

const BORDE = {
    [T.salonH24izq]:        '#555',
    [T.salonH23]:           '#555',
    [T.salonH22]:           '#555',
    [T.pasilloBloqueH]:     '#c9970a',
    [T.gradasBloqueH]:      '#289991',
    [T.miniSalonH25]:       '#555',
    [T.miniSalonH26]:       '#555',
    [T.pasilloConectorH]:   '#c9970a',
    [T.coordinacion]:       '#555',
    [T.salonG25]:           '#555',
    [T.salonG24]:           '#555',
    [T.serviciosSS]:        '#555',
    [T.salonG21]:           '#555',
    [T.pasilloCentral]:     '#c9970a',
    [T.gradasG]:            '#289991',
    [T.gradasConector]:     '#289991',
    [T.oficina1]:           '#555',
    [T.oficina2]:           '#555',
    [T.laboratorioTics]:    '#555',
    [T.pasilloEste]:        '#c9970a',
    [T.preceptorias]:       '#555',
    [T.salaReuniones]:      '#555',
    [T.gradasBloqueB]:      '#289991',
    [T.salonB22der]:        '#555',
    [T.salonB21der]:        '#555',
    [T.areaVerde]:          '#2e7d32',
    [T.pasilloHorizontalDer]: '#c9970a',
};


const listaEtiquetas = [];
function agregarEtiqueta(fila, columna, texto, tamano, negrita) {
    listaEtiquetas.push({ fila, columna, texto, tamano: tamano || 10, negrita: negrita || false });
}


const lugaresEnMapa = [
    { nombre: 'Clase H24',        fila: 14, columna: 5  },
    { nombre: 'Clase H23',        fila: 22, columna: 5  },
    { nombre: 'Clase H22',        fila: 30, columna: 5  },
    { nombre: 'Clase G25',        fila: 8,  columna: 27 },
    { nombre: 'Clase G24',        fila: 14, columna: 27 },
    { nombre: 'SS',               fila: 20, columna: 24 },
    { nombre: 'Clase G21',        fila: 26, columna: 24 },
    { nombre: 'Coordinacion',     fila: 4,  columna: 27 },
    { nombre: 'Oficina 1',        fila: 35, columna: 42 },
    { nombre: 'Oficina 2',        fila: 40, columna: 42 },
    { nombre: 'Tics',             fila: 46, columna: 47 },
    { nombre: 'Sala de Reuniones',fila: 18, columna: 62 },
    { nombre: 'Clase B22',        fila: 22, columna: 73 },
    { nombre: 'Clase B21',        fila: 30, columna: 73 },
    { nombre: 'Gradas H',         fila: 8,  columna: 18 },
    { nombre: 'Gradas G',         fila: 28, columna: 36 },
    { nombre: 'Gradas B',         fila: 26, columna: 68 },
];

//Modelo del mapa 
class ModeloMapa {
    constructor() {
        this.grilla = Array.from({ length: FILAS }, () => new Array(COLUMNAS).fill(0));
        this.etiquetas = [];
        this.nodoOrigen = null;
        this.nodoDestino = null;
        this.rutaCalculada = null;

        this.construirGrilla();
        this.construirEtiquetas();
    }

    rellenar(filaInicio, columnaInicio, filaFin, columnaFin, tipo) {
        for (let fila = filaInicio; fila <= filaFin; fila++) {
            for (let columna = columnaInicio; columna <= columnaFin; columna++) {
                if (fila >= 0 && fila < FILAS && columna >= 0 && columna < COLUMNAS)
                    this.grilla[fila][columna] = tipo;
            }
        }
    }

    etq(fila, columna, texto, tamano, negrita) {
        this.etiquetas.push({ fila, columna, texto, tamano: tamano || 10, negrita: negrita || false });
    }

    construirGrilla() {

        // clase h24 
        this.rellenar(7,  0, 15, 10, T.salonH24izq);

        // clase h23 
        this.rellenar(15, 0, 22, 10, T.salonH23);

        // clase h22
        this.rellenar(22, 0, 28, 10, T.salonH22);

        // Pasillo 
        this.rellenar(7, 11, 24, 14, T.pasilloBloqueH);

        // Gradas 
        this.rellenar(7, 15, 11, 19, T.gradasBloqueH);

        // salones
        this.rellenar(11,  15, 18, 19, T.miniSalonH25);
        this.rellenar(15, 15, 18, 19, T.miniSalonH26);

        // Pasillo 
        this.rellenar(20, 15, 22, 19, T.pasilloConectorH);
        this.rellenar(20, 20, 22, 23, T.pasilloConectorH);

        // Bloque G central

        // Coordinacion 
        this.rellenar(2, 22, 5, 38, T.coordinacion);

        // Salon Clase G25
        this.rellenar(6, 22, 15, 29, T.salonG25);

        // Pasillo vertical 
        this.rellenar(6, 30, 29, 34, T.pasilloCentral);

        // Salon Clase G24
        this.rellenar(14, 22, 19, 29, T.salonG24);

        // Servicios SS
        this.rellenar(20, 22, 22, 25, T.serviciosSS);

        // Salon Clase G21 
        this.rellenar(20, 22, 31, 29, T.salonG21);

        // Pasillo horizontal
        this.rellenar(20, 22, 22, 35, T.pasilloCentral);
          //  corredor del centro 
        this.rellenar(6,  29, 22, 38, T.pasilloCentral);
        this.rellenar(22, 36, 26, 41, T.pasilloCentral);
        this.rellenar(26, 30, 30, 44, T.pasilloCentral);

        // Gradas G 
        this.rellenar(28, 42, 31, 46, T.gradasG);

        // Gradas conector 
        this.rellenar(22, 39, 25, 41, T.gradasConector);

        // Oficina 1
        this.rellenar(32, 37, 38, 42, T.oficina1);

        // Oficina 2
        this.rellenar(38, 37, 43, 42, T.oficina2);

        // Tics 
        this.rellenar(44, 43, 51, 52, T.laboratorioTics);

        // Pasillo diagonal

        // Pasillo principal hacia bloque B (diagonal-derecha)
        this.rellenar(26, 43, 43, 54, T.pasilloEste);
        this.rellenar(24, 50, 38, 50, T.pasilloEste);

        // Area descod
        this.rellenar(26, 54, 29, 56, T.areaVerde);

        // Bloque B d

        // Sala de Reuniones 
        this.rellenar(13, 57, 24, 67, T.salaReuniones);

        // Preceptorias 
        this.rellenar(25, 57, 29, 62, T.preceptorias);
        this.rellenar(25, 63, 29, 67, T.preceptorias);

        // Pasillo horizontal derecho (amarillo que conecta a salones B)
        this.rellenar(30, 55, 35, 78, T.pasilloHorizontalDer);

        // Gradas bloque B
        this.rellenar(26, 68, 29, 71, T.gradasBloqueB);

        // Salon clase h24 
        this.rellenar(22, 71, 29, 79, T.salonB22der);

        // Salon clase h24 inferior derecha (debajo)
        this.rellenar(36, 71, 45, 79, T.salonB21der);
    }

    construirEtiquetas() {
        // Bloque H izquierdo
        this.etq(13,  5, 'clase\nh24',  11, true);
        this.etq(23,  5, 'clase\nh23',  11, true);
        this.etq(32,  5, 'clase\nh22',  11, true);
        this.etq(12, 12.5, 'cor\ned\nor',  8, false);
        this.etq(24, 12.5, 'core\ndor',    8, false);

        // Gradas y mini salones H
        this.etq(8.5, 17, 'gradas', 8, true);
        this.etq(10, 17, 'salon\nh25', 7, false);
        this.etq(16, 17, 'salon\nh26', 7, false);
        this.etq(21, 18.5, 'core\ndor', 7, false);
        this.etq(21, 21,   'core\ndor', 7, false);

        // Bloque G central
        this.etq(2.5, 26.5, 'cordinacion', 9, true);
        this.etq(9.5, 26.5, 'clase\nG25',  11, true);
        this.etq(16.5, 26.5, 'clase\nG24', 11, true);
        this.etq(21,  23.5, 'SS',           9, true);
        this.etq(27,  26.5, 'CLASE\nG21',  11, true);

        // Pasillo central
        this.etq(9,  33.5, 'cored\nor',  8, false);
        this.etq(14, 33.5, 'cored\nor',  8, false);
        this.etq(18, 35.5, 'coredor',   8, false);
        this.etq(21, 36.5, 'cored\nor',  8, false);
        this.etq(27, 40,   'cored\nor',  8, false);

        // Gradas G
        this.etq(29, 33.5, 'gradas', 8, true);
        this.etq(27, 38,   'gradas', 8, true);

        // Bloque inferior
        this.etq(34.5, 41.5, 'Oficina\n1',  10, true);
        this.etq(40.5, 41.5, 'Oficina\n2',  10, true);
        this.etq(45,   48.5, 'tics',         13, true);

        // Pasillo este
        this.etq(28, 47, 'coredor', 8, false);
        this.etq(26, 52, 'cored\nor', 8, false);

        // Bloque B derecho
        this.etq(18.5, 63.5, 'sala de reuniones', 10, true);
        this.etq(27,   59.5, 'cored\nor', 8, false);

        // Gradas y salones B
        this.etq(25.5, 69.5, 'gradas', 8, true);
        this.etq(20,   75,   'clase\nh24', 10, true);
        this.etq(32,   75,   'clase\nh24', 10, true);
    }

    obtenerNombreZona(fila, columna) {
        if (fila < 0 || fila >= FILAS || columna < 0 || columna >= COLUMNAS) return 'Fuera de limites';
        const tipo = this.grilla[fila][columna];
        for (let clave in T) {
            if (T[clave] === tipo) return clave;
        }
        return 'Desconocido';
    }

    encontrarRuta() {
        if (!this.nodoOrigen || !this.nodoDestino) return null;

        const inicio = this.nodoOrigen;
        const fin    = this.nodoDestino;

        const visitado = Array.from({ length: FILAS }, () => new Array(COLUMNAS).fill(false));
        const padre    = Array.from({ length: FILAS }, () => new Array(COLUMNAS).fill(null));
        const cola     = [inicio];
        visitado[inicio.fila][inicio.columna] = true;

        const direcciones = [[-1,0],[1,0],[0,-1],[0,1]];

        while (cola.length) {
            const actual = cola.shift();
            if (actual.fila === fin.fila && actual.columna === fin.columna) {
                const camino = [];
                let nodo = actual;
                while (nodo) {
                    camino.unshift(nodo);
                    nodo = padre[nodo.fila][nodo.columna];
                }
                this.rutaCalculada = camino;
                return camino;
            }
            for (const [deltaFila, deltaColumna] of direcciones) {
                const nuevaFila    = actual.fila    + deltaFila;
                const nuevaColumna = actual.columna + deltaColumna;
                if (
                    nuevaFila >= 0 && nuevaFila < FILAS &&
                    nuevaColumna >= 0 && nuevaColumna < COLUMNAS &&
                    !visitado[nuevaFila][nuevaColumna] &&
                    this.grilla[nuevaFila][nuevaColumna] !== 0
                ) {
                    visitado[nuevaFila][nuevaColumna] = true;
                    padre[nuevaFila][nuevaColumna] = actual;
                    cola.push({ fila: nuevaFila, columna: nuevaColumna });
                }
            }
        }
        this.rutaCalculada = null;
        return null;
    }

    limpiarRuta() {
        this.nodoOrigen   = null;
        this.nodoDestino  = null;
        this.rutaCalculada = null;
    }
}

//Vista
class VistaMapa {
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

        // Ruta calculada
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

        // Marcadores de origen y destino
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

        // Etiquetas de texto
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

//Controlador
class ControladorMapa {
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

        // Zoom con rueda del raton
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

        // Click en celda
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

//Inicio
document.addEventListener('DOMContentLoaded', () => {
    const modelo      = new ModeloMapa();
    const vista       = new VistaMapa();
    const controlador = new ControladorMapa(modelo, vista);
    controlador.iniciar();
});