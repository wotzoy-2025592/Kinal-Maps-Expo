pannellum.viewer("panorama", {
    default: {
        firstScene: "entrada",
        hfov: 120

    },
    scenes: {

        entrada: {
            panorama: "image/panoramas/foto3.png",

            hotSpots: [
                {
                    pitch: -5,
                    yaw: 0,
                    type: "scene",
                    text: "Ir al Pasillo",
                    sceneId: "pasillo1"
                }
            ]
        },

        pasillo1: {
            panorama: "image/panoramas/foto1.png",

            hotSpots: [
                {
                    pitch: -5,
                    yaw: 0,
                    type: "scene",
                    text: "Continuar",
                    sceneId: "pasillo2"
                }
            ]
        },

        pasillo2: {
            panorama: "image/panoramas/foto2.png"
        }
    }
});