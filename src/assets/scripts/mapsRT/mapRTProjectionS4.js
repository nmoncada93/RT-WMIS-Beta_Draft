import { fetchIgpS4Data } from './mapRTController.js';
import { coordinateAxes, drawAxisLabels, drawColorBar, paintGrid } from './mapRTVisualS4.js';

// [A] Configuración inicial ---------------------------------------------------
const width = 1150; // Ancho del mapa
const height = 600; // Alto del mapa
const gridSize = 2; // Tamaño de las celdas de la cuadrícula en grados

// [A.1] Configuración de la proyección
const projection = d3.geoEquirectangular()
    .scale(150)
    .translate([width / 2, (height / 2)]); // Centra la proyección

// [A.2] Generador de rutas para GeoJSON
const pathGenerator = d3.geoPath().projection(projection);

// [A.3] Contenedor SVG
const svg = d3.select("#s4MapRender")
    .attr("viewBox", `-50 -5 ${width + 100} ${height + 100}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// [A.4] Variable global para el ID del intervalo
let intervalId;

// [B] Inicializa mapa ------------------------------------------------
async function initMap(fetchDataFunction) {
    try {
        // [B.1] Carga datos del mundo en formato GeoJSON
        const worldData = await loadWorldData();

        // [B.2] Dibuja países en el mapa
        drawCountries(worldData);

        // [B.2.2] Dibuja grilla (coordenadas X Y)
        coordinateAxes(projection, svg);

        // [B.2.3] Agrega etiquetas de ejes
        drawAxisLabels(svg, width, height);

        // [B.2.4] Dibuja barra de colores
        drawColorBar(svg, width, height);

        // [B.3] Genera la cuadrícula 2x2 grados
        const gridData = generateGridData(projection, gridSize);

        // [B.4] Obtiene datos dinámicos desde el backend
        const dynamicData = await fetchDataFunction();

        if (!dynamicData) {
            console.error("No se pudieron cargar los datos...");
            return;
        }
        // [B.5] Pinta la cuadrícula con datos dinámicos
        paintGrid(gridData, dynamicData, svg, 'mean_s4');

        // [B.6] Inicia actualización en tiempo real
        startRealTimeUpdates(gridData, fetchDataFunction);

        // [B.7] Hace visible el botón "Reset" al cargar el mapa
        const resetButton = document.getElementById("closeS4MapBtn");
        resetButton.style.display = "block";
    } catch (error) {
        console.error("Error al inicializar el mapa:", error);
    }
}

// [C] Carga datos del mapa --------------------------------------------------
async function loadWorldData() {
    try {
        return await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    } catch (error) {
        throw new Error("Error al cargar el GeoJSON del mapa...");
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

// [Z] Actualización en tiempo real ------------------------------------------
function startRealTimeUpdates(gridData, fetchDataFunction) {
    intervalId = setInterval(async () => {
        try {
            const dynamicData = await fetchDataFunction();
            if (dynamicData) {
                paintGrid(gridData, dynamicData, svg);
            }
        } catch (error) {
            console.error("Error durante la actualización en tiempo real:", error);
        }
    }, 10000); // Actualiza cada 10 segundos

    // [Z.1] Detiene actualizaciones cuando se cierra la página
    window.addEventListener("beforeunload", () => {
        clearInterval(intervalId);
    });
}

// [X] Detiene mapa y limpia -------------------------------------------------
function resetMap() {
    // [X.1] Detiene setInterval
    clearInterval(intervalId);
    console.log("Actualizaciones detenidas.");

    // [X.2] Limpia contenido del mapa
    svg.selectAll("*").remove();
    console.log("Mapa limpiado.");

      // [X.4] Oculta el contenedor del mapa
  const mapContainer = document.getElementById("s4MapContainer");
  if (mapContainer) {
      mapContainer.style.display = "none";
      console.log("Contenedor del mapa ocultado.");
  } else {
      console.error("No se encontró el contenedor del mapa.");
  }

}

// [Y] Inicia mapa al pulsar el botón ----------------------------------------
document.getElementById("s4MapBtn").addEventListener("click", async () => {
    const mapContainer = document.getElementById("s4MapContainer");
    mapContainer.style.display = "block";

    await initMap(fetchIgpS4Data);
});

// [Y.2] Detiene mapa al pulsar el botón "Reset" ------------------------------
document.getElementById("closeS4MapBtn").addEventListener("click", () => {
    resetMap();
});
