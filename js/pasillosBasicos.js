const lienzo = document.getElementById('lienzo-imagen');
const lugarActualTxt = document.getElementById('nombre-lugar-actual');
const panelFlotante = document.getElementById('entry-panel');
const epTitulo = document.getElementById('ep-txt-titulo');
const epBadge = document.getElementById('ep-txt-badge');
const epDescripcion = document.getElementById('ep-txt-descripcion');

const configNodos = {
    // Sector Pasillos y Gradas
    1: { imagen: "Basicos/pasillos/pasillo_inicial.png", nombre: "Pasillo Inicial (Ingreso)" },
    2: { imagen: "Basicos/pasillos/gradas.png", nombre: "Área de Gradas Centrales" },
    3: { imagen: "Basicos/pasillos/salones.png", nombre: "Pasillo de Salones Académicos" },
    4: { imagen: "Basicos/pasillos/balcon.png", nombre: "Zona del Balcón (Nivel 2)" },
    5: { imagen: "Basicos/pasillos/Coordinacion.png", nombre: "Pasillo de Coordinación" },
    6: { imagen: "Basicos/pasillos/Coordinacion-puerta.png", nombre: "Puerta de Coordinación" },
    
    // Sector Técnico (Talleres y Laboratorios)
    7: { imagen: "Basicos/pasillos/laboratorio_computo.png", nombre: "Laboratorio de Informática" },
    8: { imagen: "Basicos/pasillos/taller_electronica.png", nombre: "Taller de Electrónica y Dispositivos" },
    9: { imagen: "Basicos/pasillos/taller_electricidad.png", nombre: "Taller de Electricidad Industrial" },
    10: { imagen: "Basicos/pasillos/taller_mecanica.png", nombre: "Taller de Mecánica Automotriz" },
    
    // Sector Áreas Comunes y Recreación
    11: { imagen: "Basicos/pasillos/cafeteria.png", nombre: "Área de Cafetería Central" },
    12: { imagen: "Basicos/pasillos/gimnasio.png", nombre: "Gimnasio y Canchas Deportivas" },
    13: { imagen: "Basicos/pasillos/auditorio.png", nombre: "Auditorio Kinal" },
    14: { imagen: "Basicos/pasillos/biblioteca.png", nombre: "Biblioteca y Centro de Documentación" },
    
    // Sector Administrativo y Servicios
    15: { imagen: "Basicos/pasillos/admisiones_caja.png", nombre: "Oficina de Admisiones y Caja" },
    16: { imagen: "Basicos/pasillos/banos.png", nombre: "Sector de Baños Generales" }
};

function cambiarNodo(numeroNodo) {
    cerrarPanelFlotante();
    
    const nodo = configNodos[numeroNodo];
    if(nodo) {
        lienzo.src = nodo.imagen;
        lugarActualTxt.innerText = nodo.nombre;
    }
    
    // Oculta todos los botones y muestra solo los del nodo actual
    document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active', 'activo'));
    document.querySelectorAll(`[data-nodo="${numeroNodo}"]`).forEach(h => h.classList.add('activo'));
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