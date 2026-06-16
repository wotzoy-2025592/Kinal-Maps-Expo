const panelFlotante = document.getElementById('entry-panel');
const epTitulo = document.getElementById('ep-txt-titulo');
const epBadge = document.getElementById('ep-txt-badge');
const epDescripcion = document.getElementById('ep-txt-descripcion');
const lugarActualTxt = document.getElementById('nombre-lugar-actual');

// Inicialización de Pannellum Tour
const viewer = pannellum.viewer('panorama-viewer', {
    "default": {
        "firstScene": "nodo1",
        "author": "Kinal",
        "autoLoad": true,
        "showControls": false // Desactiva los botones nativos si prefieres interfaz limpia
    },

    "scenes": {
        "nodo1": {
            "title": "Pasillo Inicial",
            "panorama": "img/Image 7.jpg",
            "hotSpots": [
                {
                    "pitch": -15,
                    "yaw": 0,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo2",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Avanzar a las gradas")
                },
                {
                    "pitch": -10,
                    "yaw": -45,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo5",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Ir a Coordinación")
                }
            ]
        },
        "nodo2": {
            "title": "Área de Gradas",
            "panorama": "img/Image 8.jpg",
            "hotSpots": [
                {
                    "pitch": 0,
                    "yaw": -20,
                    "type": "info",
                    "cssClass": "custom-hotspot-info",
                    "clickHandlerFunc": () => abrirPanelFlotante('Módulo de Gradas', 'CONEXIÓN B', 'Gradas principales de acceso arquitectónico hacia los laboratorios tecnológicos del segundo nivel.')
                },
                {
                    "pitch": -15,
                    "yaw": 45,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo3",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Ir al pasillo de salones")
                },
                {
                    "pitch": -20,
                    "yaw": 180,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo1",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Regresar al pasillo inicial")
                }
            ]
        },
        "nodo3": {
            "title": "Pasillo de Salones",
            "panorama": "img/efecto360.png",
            "hotSpots": [
                {
                    "pitch": 0,
                    "yaw": 15,
                    "type": "info",
                    "cssClass": "custom-hotspot-info",
                    "clickHandlerFunc": () => abrirPanelFlotante('Pasillo de Aulas Académicas', 'ZONA CENTRAL', 'Área perimetral destinada al desarrollo de salones teóricos y laboratorios de informática.')
                },
                {
                    "pitch": -15,
                    "yaw": 0,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo4",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Caminar hacia el balcón")
                },
                {
                    "pitch": -20,
                    "yaw": 180,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo2",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Regresar a las gradas")
                }
            ]
        },
        "nodo4": {
            "title": "Zona del Balcón",
            "panorama": "img/Image 10.jpg",
            "hotSpots": [
                {
                    "pitch": 0,
                    "yaw": 30,
                    "type": "info",
                    "cssClass": "custom-hotspot-info",
                    "clickHandlerFunc": () => abrirPanelFlotante('Área del Balcón Abierto', 'NIVEL 1', 'Espacio abierto de descanso con vista directa al patio central.')
                },
                {
                    "pitch": -20,
                    "yaw": 180,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo3",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Regresar al pasillo de salones")
                }
            ]
        },
        "nodo5": {
            "title": "Pasillo de Coordinación",
            "panorama": "img/Image 11.jpg",
            "hotSpots": [
                {
                    "pitch": -15,
                    "yaw": 0,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo6",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Acercarse a la puerta de Coordinación")
                },
                {
                    "pitch": -20,
                    "yaw": 180,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo1",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Regresar al pasillo inicial")
                }
            ]
        },
        "nodo6": {
            "title": "Oficina de Coordinación",
            "panorama": "img/Image 12.jpg", // Asegúrate de tener este asset listo o mapeado correctamente
            "hotSpots": [
                {
                    "pitch": 0,
                    "yaw": 0,
                    "type": "info",
                    "cssClass": "custom-hotspot-info",
                    "clickHandlerFunc": () => abrirPanelFlotante('Oficina de Coordinación', 'CONTROL', 'Entrada directa a las oficinas de control académico y atención al estudiante.')
                },
                {
                    "pitch": -20,
                    "yaw": 180,
                    "type": "scene",
                    "cssClass": "custom-hotspot-arrow",
                    "sceneId": "nodo5",
                    "createTooltipFunc": (hotSpotDiv) => hotSpotDiv.setAttribute("title", "Dar un paso atrás")
                }
            ]
        }
    }
});

// Listener para actualizar dinámicamente el nombre de la ubicación en el DOM
viewer.on('scenechange', function(sceneId) {
    cerrarPanelFlotante();
    const configEscena = viewer.getConfig().scenes[sceneId];
    if (configEscena && configEscena.title) {
        lugarActualTxt.innerText = configEscena.title;
    }
});

// Funciones del panel modal informativo
function abrirPanelFlotante(titulo, badge, descripcion) {
    epTitulo.innerText = titulo;
    epBadge.innerText = badge;
    epDescripcion.innerText = descripcion;
    panelFlotante.classList.add('visible');
}

function cerrarPanelFlotante() {
    panelFlotante.classList.remove('visible');
}