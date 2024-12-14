// import { fetchIonosphereData } from './mapPRController.js';


// [A] Configuracion inicial ---------------------------------------------------
const width = 1200; // Ancho del mapa
const height = 600; // Alto del mapa
const gridSize = 2; // Tamaño de las celdas de la cuadrícula en grados

// [A.1] Configuracion de la proyección Mercator
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]); // Centra la proyección

// [A.2] Generador de rutas para GeoJSON
const pathGenerator = d3.geoPath().projection(projection);

// [A.3] Contenedor SVG para el mapa
const svg = d3.select("#map_mercator2")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// [B] Inicializa el mapa ------------------------------------------------
async function initMap() {
    try {
        // [B.1] Carga datos del mundo en formato GeoJSON
        const worldData = await loadWorldData();

        // [B.2] Dibuja los países en el mapa
        drawCountries(worldData);

        // [B.3] Genera la cuadrícula 2x2 grados
        const gridData = generateGridData(projection, gridSize);

        // [B.4] Obtiene datos dinamicos desde el backend
        const dynamicData = await fetchIonosphereData();

        if (!dynamicData) {
            console.error("No se pudieron cargar los datos dinámicos.");
            return;
        }

        // [B.5] Pintar la cuadrícula con datos dinámicos
        paintGrid(gridData, dynamicData);

        console.log("Celdas pintadas con colores dinámicos.");
    } catch (error) {
        console.error("Error al inicializar el mapa:", error);
    }
}

// [C] Carga datos del mapa --------------------------------------------------
async function loadWorldData() {
    try {
        return await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    } catch (error) {
        throw new Error("Error al cargar el GeoJSON del mapa mundial.");
    }
}

// [D] Dibuja países ---------------------------------------------------------
function drawCountries(worldData) {
    svg.selectAll("path")
        .data(worldData.features)
        .join("path")
        .attr("d", pathGenerator)
        .attr("fill", "#dcdcdc") // Color gris para los países
        .attr("stroke", "black"); // Bordes de los países
}

// [E] Genera datos de la cuadrícula -----------------------------------------
function generateGridData(projection, gridSize) {
    const gridData = [];
    for (let lon = -180; lon < 180; lon += gridSize) {
        for (let lat = -90; lat < 90; lat += gridSize) {
            const topLeft = projection([lon, lat]);
            const bottomRight = projection([lon + gridSize, lat - gridSize]);

            if (topLeft && bottomRight) {
                gridData.push({
                    x: topLeft[0],
                    y: topLeft[1],
                    width: bottomRight[0] - topLeft[0],
                    height: bottomRight[1] - topLeft[1],
                    Longitude: lon,
                    Latitude: lat,
                });
            }
        }
    }
    return gridData;
}

// [F] Pintar la cuadrícula ---------------------------------------------------
function paintGrid(gridData, dynamicData) {
    svg.selectAll(".grid-cell")
        .data(gridData)
        .join("rect")
        .attr("class", "grid-cell")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .style("fill", d => {
            const match = findMatchingCell(dynamicData, d);
            return match ? getColor(match.mean_sphi) : "none"; // Pintar o dejar vacío
        })
        .style("stroke", "lightgray") // Bordes de la cuadrícula
        .style("stroke-width", 0.5);
}

// [G] Encontrar coincidencia para cada celda ---------------------------------
function findMatchingCell(dynamicData, gridCell) {
    const tolerance = 0.01; // Tolerancia para evitar problemas de precisión
    return dynamicData.flatMap(group => group.data).find(cell =>
        Math.abs(cell.Longitude - gridCell.Longitude) <= tolerance &&
        Math.abs(cell.Latitude - gridCell.Latitude) <= tolerance
    );
}

// [H] Función de colores -----------------------------------------------------
function getColor(value) {
    if (value === null || value === 0) return null; // No pintar
    if (value < 0.0001) return "#00008B"; // Azul oscuro
    if (value < 0.005) return "#0000FF"; // Azul
    if (value < 0.01) return "#40E0D0"; // Turquesa
    if (value < 0.05) return "#00FF00"; // Verde
    if (value < 0.1) return "#FFFF00"; // Amarillo
    if (value < 0.15) return "#FFA500"; // Naranja
    if (value < 0.2) return "#FF4500"; // Rojo
    return "#8B0000"; // Rojo oscuro
}

// [Z] Inicializar el mapa ----------------------------------------------------
initMap();



/*
// Configuración inicial
const width = 1200; // Ancho base del mapa
const height = 600; // Alto base del mapa (proporción 2:1)

// Configuración de la proyección Mercator
const projection = d3.geoMercator()
    .scale(150) // Escala fija adecuada para 1200x600
    .translate([width / 2, height / 2]); // Centramos la proyección

const pathGenerator = d3.geoPath().projection(projection);

// Contenedor SVG (con viewBox para hacerlo escalable)
const svg = d3.select("#map_mercator2")
    .attr("viewBox", `0 0 ${width} ${height}`) // Hace que SVG escale con el contenedor
    .attr("preserveAspectRatio", "xMidYMid meet"); // Centra el contenido y mantiene proporciones

// Cargar datos del mapa en formato GeoJSON
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(worldData => {
        // Dibujar países
        svg.selectAll("path")
            .data(worldData.features)
            .join("path")
            .attr("d", pathGenerator)
            .attr("fill", "#dcdcdc") // Gris claro
            .attr("stroke", "black");

        // Dibujar cuadrícula 2x2 grados como rectángulos
        const gridSize = 2; // Tamaño de la celda en grados
        const gridData = [];

        for (let lon = -180; lon < 180; lon += gridSize) {
            for (let lat = -90; lat < 90; lat += gridSize) {
                const topLeft = projection([lon, lat]);
                const bottomRight = projection([lon + gridSize, lat - gridSize]);

                if (topLeft && bottomRight) {
                    gridData.push({
                        x: topLeft[0],
                        y: topLeft[1],
                        width: bottomRight[0] - topLeft[0],
                        height: bottomRight[1] - topLeft[1],
                    });
                }
            }
        }

        // Dibujar las celdas de la cuadrícula
        svg.selectAll(".grid-cell")
            .data(gridData)
            .join("rect")
            .attr("class", "grid-cell")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .style("fill", "none") // Sin relleno
            .style("stroke", "lightgray") // Color de las líneas de la cuadrícula
            .style("stroke-width", 0.5); // Grosor de las líneas de la cuadrícula

        // Dibujar marcador en Madrid
        const madridCoords = [-3.7038, 40.4168];
        const [madridX, madridY] = projection(madridCoords);

        svg.append("circle")
            .attr("class", "marker")
            .attr("cx", madridX)
            .attr("cy", madridY)
            .attr("r", 5);

        svg.append("text")
            .attr("x", madridX + 10)
            .attr("y", madridY + 5)
            .text("Madrid")
            .attr("font-size", "12px")
            .attr("fill", "black");
    })
    .catch(error => console.error("Error al cargar datos del mapa:", error));

*/
/********************************************************
*                                                        *
*    MAPA BASE ORIGINAL FUNCIONAL NO RESPONSIVO!!        *
*                                                        *
********************************************************/

/*
const width = 1200; // Ancho más grande
const height = 600; // Alto ajustado para mantener la proporción 2:1

// Configuración de la proyección Mercator
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

// Generador de rutas
const pathGenerator = d3.geoPath().projection(projection);

// Contenedor SVG
const svg = d3.select("#map_mercator2")
    .attr("width", width)
    .attr("height", height);

// Cargar datos del mapa en formato GeoJSON
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(worldData => {
        // Dibujar países
        svg.selectAll("path")
            .data(worldData.features)
            .join("path")
            .attr("d", pathGenerator)
            .attr("fill", "#dcdcdc") // Gris claro
            .attr("stroke", "black");

        // Dibujar cuadrícula 2x2 grados como rectángulos
        const gridSize = 2; // Tamaño de la celda en grados
        const gridData = [];

        for (let lon = -180; lon < 180; lon += gridSize) {
            for (let lat = -90; lat < 90; lat += gridSize) {
                // Coordenadas de las esquinas de la celda
                const topLeft = projection([lon, lat]);
                const bottomRight = projection([lon + gridSize, lat - gridSize]);

                if (topLeft && bottomRight) {
                    gridData.push({
                        x: topLeft[0],
                        y: topLeft[1],
                        width: bottomRight[0] - topLeft[0],
                        height: bottomRight[1] - topLeft[1],
                    });
                }
            }
        }

        // Dibujar las celdas de la cuadrícula
        svg.selectAll(".grid-cell")
            .data(gridData)
            .join("rect")
            .attr("class", "grid-cell")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("width", d => d.width)
            .attr("height", d => d.height);

        // Coordenadas de Madrid
        const madridCoords = [-3.7038, 40.4168]; // [longitud, latitud]

        // Dibujar marcador en Madrid
        svg.append("circle")
            .attr("class", "marker")
            .attr("cx", projection(madridCoords)[0])
            .attr("cy", projection(madridCoords)[1])
            .attr("r", 5);

        // Etiqueta en Madrid
        svg.append("text")
            .attr("x", projection(madridCoords)[0] + 10)
            .attr("y", projection(madridCoords)[1] + 5)
            .text("Madrid")
            .attr("font-size", "12px")
            .attr("fill", "black");
    })
    .catch(error => console.error("Error al cargar datos del mapa:", error));

*/
