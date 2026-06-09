// Configuración del mapa
export const MAP_CONFIG = {
    CELL_SIZE: 20,        // Tamaño de celda en píxeles
    COLS: 50,             // Columnas
    ROWS: 40,             // Filas
    METERS_PER_CELL: 0.5, // Metros por celda
    ZOOM: {
        MIN: 0.3,
        MAX: 4,
        DEFAULT: 1.0,
        FACTOR_IN: 1.12,
        FACTOR_OUT: 0.89
    },
    ROUTE: {
        LINE_WIDTH: 3,
        LINE_COLOR: '#c0392b'
    },
    PIN: {
        RADIUS: 5,
        STROKE_COLOR: 'white',
        STROKE_WIDTH: 1.5
    }
};

// Tipos de zonas
export const ZoneType = {
    AULA: 1,
    ESCALERA: 2,
    PASILLO: 3,
    BANIO: 4,
    ADMIN: 5,
    VACIO: 0
};

// Colores de relleno por tipo de zona
export const COLORS = {
    [ZoneType.AULA]: '#e8dcc8',
    [ZoneType.ESCALERA]: '#c8dce8',
    [ZoneType.PASILLO]: '#d8e8c8',
    [ZoneType.BANIO]: '#f0dcc8',
    [ZoneType.ADMIN]: '#e8c8d0',
    [ZoneType.VACIO]: '#f0ede6'
};

// Colores de borde por tipo de zona
export const STROKE_COLORS = {
    [ZoneType.AULA]: '#b8a880',
    [ZoneType.ESCALERA]: '#7a9cb8',
    [ZoneType.PASILLO]: '#90a060',
    [ZoneType.BANIO]: '#c89060',
    [ZoneType.ADMIN]: '#c08090',
    [ZoneType.VACIO]: '#d0ccc4'
};

// Colores de UI
export const UI_COLORS = {
    ORIGIN_PIN: '#27ae60',
    DEST_PIN: '#c0392b',
    LABEL: '#1a1612',
    BACKGROUND: '#f0ede6'
};

// Obtener dimensiones del canvas
export const getCanvasDimensions = () => ({
    width: MAP_CONFIG.COLS * MAP_CONFIG.CELL_SIZE,
    height: MAP_CONFIG.ROWS * MAP_CONFIG.CELL_SIZE
});