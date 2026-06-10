const lienzo = document.getElementById('lienzo-imagen');
const lugarActualTxt = document.getElementById('nombre-lugar-actual');

const panelFlotante = document.getElementById('entry-panel');
const epTitulo = document.getElementById('ep-txt-titulo');
const epBadge = document.getElementById('ep-txt-badge');
const epDescripcion = document.getElementById('ep-txt-descripcion');

const configNodos = {
    1: {
        imagen: "Basicos/pasillos/Entrada_Basicos.png",
        nombre: "Entrada de Básicos"
    },
    2: {
        imagen: "Basicos/pasillos/segundo_Nivel_Coordinación.png",
        nombre: "Segundo Nivel - Distribuidor Coordinación"
    },
    3: {
        imagen: "Basicos/pasillos/SalonesQuimica_segundo nivel.png",
        nombre: "Laboratorios de Química"
    },
    4: {
        imagen: "Basicos/pasillos/pasillo1_segundoNivel.png",
        nombre: "Pasillo 1 - Segundo Nivel"
    },
    5: {
        imagen: "Basicos/pasillos/pasillo_salon_indus.png",
        nombre: "Pasillo Salón Industrial"
    },
    6: {
        imagen: "Basicos/pasillos/pasillo_salones_segundoNivel.png",
        nombre: "Pasillo Salones Segundo Nivel"
    },
    7: {
        imagen: "Basicos/pasillos/pasilloCoordinación.png",
        nombre: "Pasillo de Acceso a Coordinación"
    },
    8: {
        imagen: "Basicos/pasillos/Coordinacion.png",
        nombre: "Oficina de Coordinación"
    }
};

function cambiarNodo(numeroNodo) {

    cerrarPanelFlotante();

    const nodo = configNodos[numeroNodo];

    if (nodo) {
        lienzo.src = nodo.imagen;
        lugarActualTxt.innerText = nodo.nombre;
    }

    document
        .querySelectorAll('.hotspot')
        .forEach(h => h.classList.remove('activo'));

    document
        .querySelectorAll(`[data-nodo="${numeroNodo}"]`)
        .forEach(h => h.classList.add('activo'));
}

function abrirPanelFlotante(titulo, badge, descripcion) {
    epTitulo.innerText = titulo;
    epBadge.innerText = badge;
    epDescripcion.innerText = descripcion;
    panelFlotante.classList.add('visible');
}

function cerrarPanelFlotante() {
    panelFlotante.classList.remove('visible');
}