//---------------------------------------------------------------------------------------------
// Importa las funciones del módulo past_unxz_calendar y echarts
import * as echarts from 'echarts';
import { getSelectedDateInfo, processSphiData } from './past_unxz_calendar.js';

// [A] Variables Globales para almacenar los datos de SPHI en PAST RECORDS -----
let pastRecordsData = {
  sphi: null  // Esta variable almacenará el JSON de sphi.tmp
};

let selectedStation = ""; // Variable para almacenar la estación seleccionada

// [B] Función para obtener los datos de sphi.tmp desde el backend -------------
function fetchSphiData(year, doy) {
  const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;
  //console.log("Solicitando datos de sphi.tmp a:", url);

  return fetch(url)
    .then(response => {
      //console.log("Respuesta de sphi.tmp recibida:", response);
      if (!response.ok) {
        throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
      }
      return response.json();
    })
    .then(data => {
      pastRecordsData.sphi = data; // Almacenar los datos en la variable global
      //console.log("Datos de sphi.tmp almacenados en pastRecordsData.sphi:", pastRecordsData.sphi);
      alert("Datos de sphi.tmp obtenidos y almacenados");
      return data; // Devuelve los datos obtenidos
    });
}

// [C] Función para detectar la estación seleccionada y graficar --------------
function detectSelectedStation() {
  const stationSelector = document.getElementById("pastStationSelector");
  selectedStation = stationSelector.value;
  //selectedStation = stationSelector.value.split('_')[0];
  console.log("Estación seleccionada:", selectedStation);

  // Llama a la función para filtrar y graficar los datos
  updateSphiChart(pastRecordsData.sphi, selectedStation);
}

// [D] Función para actualizar el gráfico de SPHI sin ajustes responsivos -----
function updateSphiChart(data, station) {
  const chartDom = document.getElementById('pastChart');

  // Verificar si el contenedor tiene dimensiones
  if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
      console.warn("No es posible renderizar grafico");
      return;
  }

  // Filtrar los datos según la estación seleccionada
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      console.warn("No se encontraron datos para la estación seleccionada.");
      return;
  }

  const myChart = echarts.init(chartDom);

  const scatterData = filteredData.map(item => [item[0], item[5]]);
  const option = {
      title: { text: `Sigma_phi L1 para ${station}` },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', name: 'Time (seconds of the day)', nameLocation: 'center', nameGap: 40 },
      yAxis: { type: 'value', name: 'Sigma_phi L1 (radian)' },
      series: [{
          name: 'Sigma_phi L1',
          type: 'scatter',
          data: scatterData,
          itemStyle: { color: '#32a852', opacity: 0.5 },
          symbolSize: 4
      }]
  };

  // Configuración del gráfico
  myChart.setOption(option);
}

// [E] Evento para capturar la fecha seleccionada ------------------------------
document.getElementById("dateInput").addEventListener("change", function () {
  const { year, doy } = getSelectedDateInfo(this.value); // Llama a la función del módulo
  console.log("Fecha seleccionada:", this.value, "Año:", year, "Día del año (DoY):", doy);

  // Llamada a la función principal para procesar los datos de sphi.tmp
  processSphiData(year, doy, fetchSphiData); // Llama a la función en el módulo
});

// [F] Evento para capturar la estación seleccionada y actualizar el gráfico ----
document.getElementById("pastStationSelector").addEventListener("change", detectSelectedStation);

// [G] Llamada inicial para obtener los datos al cargar la página --------------
fetchSphiData(); // Esta función debe ejecutarse para inicializar los datos al cargar


/*
// [A] Variables Globales para almacenar los datos de SPHI en PAST RECORDS -----
let pastRecordsData = {
  sphi: null  // Esta variable almacenará el JSON de sphi.tmp
};

// [B] Función para descomprimir los archivos en el backend -------------------
function decompressFiles(year, doy) {
  const decompressUrl = `http://127.0.0.1:5000/descomprimir-archivos/${year}/${doy}`;
  console.log("Solicitando descompresión a:", decompressUrl);

  return fetch(decompressUrl, { method: 'POST' })
    .then(response => {
      console.log("Respuesta de descompresión recibida:", response);
      if (!response.ok) {
        throw new Error("Error en la descompresión para la fecha seleccionada");
      }
      return response.json();
    })
    .then(decompressData => {
      console.log("Datos de descompresión:", decompressData);
      alert("Descompresión completada con éxito!");
      return decompressData; // Devuelve los datos de la descompresión
    });
}

// [C] Función para obtener los datos de sphi.tmp desde el backend -------------
function fetchSphiData(year, doy) {
  const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;
  console.log("Solicitando datos de sphi.tmp a:", url);

  return fetch(url)
    .then(response => {
      console.log("Respuesta de sphi.tmp recibida:", response);
      if (!response.ok) {
        throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
      }
      return response.json();
    })
    .then(data => {
      pastRecordsData.sphi = data; // Almacenar los datos en la variable global
      console.log("Datos de sphi.tmp almacenados en pastRecordsData.sphi:", pastRecordsData.sphi);
      alert("Datos de sphi.tmp obtenidos y almacenados con éxito!");
      return data; // Devuelve los datos obtenidos
    });
}

// [D] Función principal que coordina el proceso -------------------------------
function processSphiData(year, doy) {
  decompressFiles(year, doy)
    .then(() => fetchSphiData(year, doy))
    .catch(error => {
      console.error("Error en el proceso de obtención de datos:", error);
      alert("Error en el proceso de descompresión o lectura de datos para la fecha seleccionada.");
    });
}

// [E] Evento para capturar la fecha seleccionada ------------------------------
document.getElementById("dateInput").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const year = selectedDate.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const diff = selectedDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const doy = Math.floor(diff / oneDay);

  console.log("Fecha seleccionada:", selectedDate, "Año:", year, "Día del año (DoY):", doy);

  // Llamada a la función principal para procesar los datos de sphi.tmp
  processSphiData(year, doy);
});







/*
import * as echarts from 'echarts';

// [A] Variables Globales para almacenar los datos de SPHI en PAST RECORDS -----
let pastRecordsData = {
  sphi: null  // Esta variable almacenará el JSON de sphi.tmp
};

// [B] Función para obtener los datos de sphi.tmp desde el backend -------------
function fetchSphiData(year, doy) {
  const decompressUrl = `http://127.0.0.1:5000/descomprimir-archivos/${year}/${doy}`;
  console.log("Iniciando descompresión en:", decompressUrl);

  return fetch(decompressUrl, { method: 'POST' })
    .then(response => {
      console.log("Respuesta de descompresión:", response);
      if (!response.ok) {
        throw new Error("Error en la descompresión para la fecha seleccionada");
      }
      return response.json();
    })
    .then(decompressData => {
      console.log("Resultado de la descompresión:", decompressData);
      alert("Descompresión completada con éxito!");

      const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;
      console.log("Solicitando datos de sphi.tmp desde:", url);
      return fetch(url);
    })
    .then(response => {
      console.log("Respuesta de sphi.tmp:", response);
      if (!response.ok) {
        throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
      }
      return response.json();
    })
    .then(data => {
      pastRecordsData.sphi = data;
      console.log("Datos de sphi.tmp almacenados en pastRecordsData.sphi:", pastRecordsData.sphi);
      alert("Datos de sphi.tmp obtenidos y almacenados con éxito!");
    })
    .catch(error => {
      console.error("Error en el proceso de obtención de datos:", error);
      alert("Error en el proceso de descompresión o lectura de datos para la fecha seleccionada.");
    });
}

// [C] Evento para capturar la fecha seleccionada ------------------------------
document.getElementById("dateInput").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const year = selectedDate.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const diff = selectedDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const doy = Math.floor(diff / oneDay);

  console.log("Fecha seleccionada:", selectedDate, "Año:", year, "Día del año (DoY):", doy);

  // Llamada a la función fetchSphiData con el año y el día del año (DoY)
  fetchSphiData(year, doy);
});

// [D] Evento para la selección de estación ------------------------------------
document.getElementById("pastStationSelector").addEventListener("change", function () {
  const selectedStation = this.value.split('_')[0]; // Obtener el código de la estación
  console.log("Estación seleccionada:", selectedStation);

  // Verificar que los datos de sphi están disponibles y filtrar por estación
  if (!pastRecordsData.sphi) {
    alert("No se han cargado datos para la fecha seleccionada. Selecciona una fecha primero.");
    return;
  }

  const filteredData = pastRecordsData.sphi.filter(item => item[1] === selectedStation); // Filtrar por estación
  console.log("Datos filtrados para la estación seleccionada:", filteredData);

  if (filteredData.length === 0) {
    alert("No hay datos disponibles para la estación seleccionada.");
    return;
  }

  // Llamar a la función para graficar los datos filtrados
  generateChart(filteredData, selectedStation);
});

// [E] Función para generar el gráfico usando Echarts --------------------------
function generateChart(data, station) {
  const chartDom = document.getElementById('pastChart');
  const myChart = echarts.init(chartDom);

  const scatterData = data.map(item => [item[0], item[5]]); // columna 1 (tiempo) en X y columna 6 (sphiL1) en Y

  const option = {
    title: { text: `Sigma_phi L1 para la estación ${station}` },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', name: 'Tiempo (segundos del día)', nameLocation: 'center', nameGap: 30 },
    yAxis: { type: 'value', name: 'Sigma_phi L1 (radianes)' },
    series: [{
      name: 'Sigma_phi L1',
      type: 'scatter',
      data: scatterData,
      itemStyle: { color: '#32a852', opacity: 0.5 },
      symbolSize: 4
    }]
  };

  // Configurar el gráfico
  myChart.setOption(option);
}







/*
// [A] Variables Globales para almacenar los datos de SPHI en PAST RECORDS -----
let pastRecordsData = {
  sphi: null  // Esta variable almacenará el JSON de sphi.tmp
};

// [B] Función para obtener los datos de sphi.tmp desde el backend -------------
function fetchSphiData(year, doy) {
  // URL para descomprimir archivos
  const decompressUrl = `http://127.0.0.1:5000/descomprimir-archivos/${year}/${doy}`;
  console.log("Solicitando descompresión a:", decompressUrl);

  return fetch(decompressUrl, { method: 'POST' })
    .then(response => {
      console.log("Respuesta de descompresión recibida:", response);
      if (!response.ok) {
        throw new Error("Error en la descompresión para la fecha seleccionada");
      }
      return response.json();
    })
    .then(decompressData => {
      console.log("Datos de descompresión:", decompressData);
      alert("Descompresión completada con éxito!");

      // Después de la descompresión, solicitar los datos de sphi.tmp
      const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;
      console.log("Solicitando datos de sphi.tmp a:", url);

      return fetch(url);
    })
    .then(response => {
      console.log("Respuesta de sphi.tmp recibida:", response);
      if (!response.ok) {
        throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
      }
      return response.json();
    })
    .then(data => {
      // Almacenar los datos de sphi.tmp en pastRecordsData.sphi
      pastRecordsData.sphi = data;
      console.log("Datos de sphi.tmp almacenados en pastRecordsData.sphi:", pastRecordsData.sphi);
      alert("Datos de sphi.tmp obtenidos y almacenados con éxito!");
    })
    .catch(error => {
      console.error("Error en el proceso:", error);
      alert("Error en el proceso de descompresión o lectura de datos para la fecha seleccionada.");
    });
}

// [C] Evento para capturar la fecha seleccionada ------------------------------
document.getElementById("dateInput").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const year = selectedDate.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const diff = selectedDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const doy = Math.floor(diff / oneDay);

  console.log("Fecha seleccionada:", selectedDate, "Año:", year, "Día del año:", doy);

  // Llamada a la función fetchSphiData con el año y el día del año (DoY)
  fetchSphiData(year, doy);
});

*/





/*
// [A] Evento para capturar la fecha seleccionada --------------------------------
document.getElementById("dateInput").addEventListener("change", function () {

  // [A.1] Capturar la fecha seleccionada ---------------------------------------
  const selectedDate = new Date(this.value);

  // [A.2] Obtener el año de la fecha seleccionada ------------------------------
  const year = selectedDate.getFullYear();

  // [A.3] Calcular el día del año (DoY) ---------------------------------------
  const startOfYear = new Date(year, 0, 0); // Día cero del año
  const diff = selectedDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const doy = Math.floor(diff / oneDay); // Calcula DoY como un número entero

  // [B] Construcción de la URL absoluta del endpoint de descompresión del backend -------
  const url = `http://127.0.0.1:5000/descomprimir-archivos/${year}/${doy}`;

  // [C] Solicitud POST al backend para descomprimir archivos -------------------
  fetch(url, {
    method: 'POST'
  })
    .then(response => {
      // [C.1] Verificación de la respuesta del backend -------------------------
      if (!response.ok) {
        throw new Error("Error initiating decompression for the specified date");
      }
      return response.json();
    })
    .then(data => {
      // [C.2] Confirmación de la descompresión -------------------------------
      console.log("Decompression response:", data);
      alert("Decompression completed successfully!");
    })
    .catch(error => {
      // [C.3] Manejo de errores ------------------------------------------------
      console.error("Error during decompression:", error);
      alert("Error during decompression for the specified date.");
    });
});
*/
