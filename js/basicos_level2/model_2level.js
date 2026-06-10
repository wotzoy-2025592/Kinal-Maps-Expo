import { FILAS, COLUMNAS, T } from './config_2level.js';

export class ModeloMapa {
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

        // Bloque G

        // Coordinacion 
        this.rellenar(2, 22, 5, 38, T.coordinacion);

        // Salon G25
        this.rellenar(6, 22, 15, 29, T.salonG25);

        // Pasillo  
        this.rellenar(6, 30, 29, 34, T.pasilloCentral);

        //Clase G24
        this.rellenar(14, 22, 19, 29, T.salonG24);

        // Servicios SS
        this.rellenar(20, 22, 22, 25, T.serviciosSS);

        // Clase G21 
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

        // Pasillo principal
        this.rellenar(26, 43, 43, 54, T.pasilloEste);
        this.rellenar(24, 50, 38, 50, T.pasilloEste);

        // Area descod
        this.rellenar(26, 54, 29, 56, T.areaVerde);

        // Bloque B 

        // Sala de Reuniones 
        this.rellenar(13, 57, 24, 67, T.salaReuniones);

        // Preceptorias 
        this.rellenar(25, 57, 29, 62, T.preceptorias);
        this.rellenar(25, 63, 29, 67, T.preceptorias);

        // Pasilloderecho
        this.rellenar(30, 55, 35, 78, T.pasilloHorizontalDer);

        // Gradas B
        this.rellenar(26, 68, 29, 71, T.gradasBloqueB);

        //clase h24 
        this.rellenar(22, 71, 29, 79, T.salonB22der);

        //clase h24 
        this.rellenar(36, 71, 45, 79, T.salonB21der);
    }

    construirEtiquetas() {
        //H izquierdo
        this.etq(13,  5, 'clase\nh24',  11, true);
        this.etq(23,  5, 'clase\nh23',  11, true);
        this.etq(32,  5, 'clase\nh22',  11, true);
        this.etq(12, 12.5, 'cor\ned\nor',  8, false);
        this.etq(24, 12.5, 'core\ndor',    8, false);

        // Gradas y  salones H
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

        this.etq(34.5, 41.5, 'Oficina\n1',  10, true);
        this.etq(40.5, 41.5, 'Oficina\n2',  10, true);
        this.etq(45,   48.5, 'tics',         13, true);

        // Pasillo 
        this.etq(28, 47, 'coredor', 8, false);
        this.etq(26, 52, 'cored\nor', 8, false);

        this.etq(18.5, 63.5, 'sala de reuniones', 10, true);
        this.etq(27,   59.5, 'cored\nor', 8, false);

        // Gradas y salones 
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