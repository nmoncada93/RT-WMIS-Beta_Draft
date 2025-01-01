//import { getSelectedDate, processIndexData } from './indexPRUnxz.js';
import { renderChart } from './indexRTChart.js';

// [A] Variables Globales
let realTimeData = {
  sphi: null,  // Almacena el JSON de sphi.tmp
  roti: null   // Almacena el JSON de roti.tmp
};
let activeIndex = null;  // Índice activo (sphi, roti)
let selectedStation = ""; // Estación seleccionada
let isFetching = false;
let lastDataHash = null;  // Nuevo: Guarda el hash del último conjunto de datos
let fetchInterval = null;


// [B] Función para obtener los datos de sphi.tmp desde el backend
async function fetchSphiData() {
  const url = `http://127.0.0.1:5000/api/indexRT/read-sphi`;
  //console.time("fetchSphiData");  // Inicia el cronómetro
  console.log("Fetch Request Enviada a Sphi");

  // Mostrar texto de carga
  toggleLoadingText(true);

  //handlerSpinner(true);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obtaining sphi.tmp for selected date");
    }

    const data = await response.json();
    realTimeData.sphi = data;
    console.log("Data from sphi.tmp obtained and stored");
    updateStationSelector(data);
    console.log("Actualizando selector de estaciones desde Fetch de SPHI");
    //console.timeEnd("fetchSphiData");  // Finaliza el cronómetro
    //showIndexButtons();
    // Rehabilitar el selector aunque haya error
    //stationSelector.disabled = false;
    toggleLoadingText(false);

    return data;
  }

  catch (error) {
    console.error("Error during sphi.tmp request:", error);
    handleNoData("No data available for the selected date. Please try again later or choose another date!");



  }
}

// [C] Nueva función para obtener los datos de roti.tmp desde el backend
async function fetchRotiData() {

  const url = `http://127.0.0.1:5000/api/indexRT/read-roti`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obtaining roti.tmp for selected date");
    }

    const data = await response.json();
    realTimeData.roti = data;
    console.log("Data from roti.tmp obtained and stored");

    showIndexButtons();
    return data;
  }

  catch (error) {
    console.error("Error during roti.tmp request:", error);
    handleNoData("No data available for the selected date. Please try again later or choose another date!");
  }
}

// [D] Función para detectar la estación seleccionada
function detectSelectedStation() {
  const stationSelector = document.getElementById("stationSelector");
  selectedStation = stationSelector.value;
  console.log("Estación seleccionada:", selectedStation);
}

// [E] Función para actualizar estaciones en el selector
function updateStationSelector(data) {
  const stationSelector = document.getElementById("stationSelector");
  const availableStations = data.map(item => item[1]);  // Lista de estaciones disponibles

  Array.from(stationSelector.options).forEach(option => {
    const isAvailable = availableStations.includes(option.value);  // Verifica con includes
    option.disabled = !isAvailable;
    option.classList.toggle('selectOption--disabled', !isAvailable);

    // CAMBIO DE COLOR DINÁMICO
    option.style.color = isAvailable ? 'white' : 'red';
  });
}



// [F] Función para marcar el botón activo y desactivar el resto
function setActiveButton(button) {
  const buttons = document.querySelectorAll(".primaryRTBtn");
  buttons.forEach(btn => btn.classList.remove("active-button"));
  button.classList.add("active-button");
}


// [G] Función para mostrar botones de índice solo si hay estación seleccionada y datos cargados
function showIndexButtons() {
  const buttons = document.querySelectorAll('.primaryRTBtn');
  const s4Button = document.getElementById("s4Button");
  const rotiButton = document.getElementById("rotiButton");

  if (selectedStation) {
    // Mostrar SPHI solo si sphi.tmp está cargado
    buttons.forEach(btn => {
      if (btn.id === "sphiButton") {
        btn.style.display = realTimeData.sphi ? 'inline-block' : 'none';
      }


    });

    // Mostrar S4 y ROTI solo si roti.tmp está cargado
    const showRotiButtons = realTimeData.roti ? 'inline-block' : 'none';
    s4Button.style.display = showRotiButtons;
    rotiButton.style.display = showRotiButtons;

  }
}


// [H] Función para verificar y actualizar datos si han cambiado
async function checkAndUpdateData() {
  if (isFetching) return;
  isFetching = true;

  let newData;

  // Realiza el fetch dependiendo del índice activo
  if (activeIndex === 'sphi') {
    newData = await fetchSphiData();
  } else if (activeIndex === 'roti' || activeIndex === 's4') {
    newData = await fetchRotiData();
  } else {
    console.log("No active index to fetch data.");
    isFetching = false;
    return;
  }

  // Si hay datos nuevos, calcula el hash y compara
  if (newData && newData.length > 0) {
    const newHash = JSON.stringify(newData);

    if (lastDataHash !== newHash) {
      // Actualiza la data correspondiente
      if (activeIndex === 'sphi') {
        realTimeData.sphi = newData;
      } else {
        realTimeData.roti = newData;
      }

      lastDataHash = newHash;  // Guarda el nuevo hash
      console.log("Data updated - Changes detected.");

      // Re-renderiza el gráfico automáticamente si hay datos nuevos
      if (selectedStation) {
        console.log("Re-renderizando gráfico con datos actualizados...");
        renderChart(newData, selectedStation, activeIndex);
      }
    } else {
      console.log("Data is up to date.");
    }
  }

  isFetching = false;
}

// [N] Función para iniciar el fetch automático cada 10 segundos
function startAutoFetch() {
  if (!fetchInterval) {
    fetchInterval = setInterval(checkAndUpdateData, 10000);  // Cada 10 segundos
    console.log("Auto fetch started...");
  }
}

// [O] Función para detener autofetch
function stopAutoFetch() {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
    console.log("Auto fetch stopped.");
  }
}

// [X] Función para mostrar/ocultar texto de carga en el selector
function toggleLoadingText(isLoading) {
  const stationSelector = document.getElementById("stationSelector");
  const defaultOption = stationSelector.querySelector('.selectOption--disabled');

  if (isLoading) {
    defaultOption.textContent = "Loading stations...";
  } else {
    defaultOption.textContent = "Scroll down to select station";
  }
}

// [X] Función para mostrar/ocultar el botón Reset
function toggleResetButton(show) {
  const resetButton = document.getElementById("closeChartButton");
  resetButton.style.display = show ? 'inline-block' : 'none';
}

// [P] Función de Reset: Detener fetch y ocultar gráfico
function resetChart() {
  stopAutoFetch();  // Detener fetch automático

  const chartContainer = document.getElementById("indexRTContainer");
  if (chartContainer) {
    chartContainer.style.display = 'none';
    console.log("RESET: Fetch detenido y gráfico oculto.");
  } else {
    console.warn("El contenedor del gráfico no existe.");
  }

  // [1] Resetear el selector de estaciones
  const stationSelector = document.getElementById("stationSelector");
  stationSelector.selectedIndex = 0;

  // [2] Ocultar botones de índice (SigmaPhi, ROTI, S4)
  const indexButtons = document.querySelectorAll('.primaryRTBtn');
  indexButtons.forEach(btn => {
    btn.style.display = 'none';
    btn.classList.remove('active-button');  // Eliminar estado activo
  });

}





/*
// [P] Función para cerrar el gráfico y detener el fetch automático
function closeChart() {
  const chartContainer = document.getElementById("indexRTContainer");
  const stationSelector = document.getElementById("stationSelector");  // Selector de estaciones

  // [1] Ocultar el contenedor del gráfico
  chartContainer.style.display = 'none';

  // [2] Detener el fetch automático
  stopAutoFetch();

  // [3] Resetear variables globales (opcional)
  activeIndex = null;
  realTimeData.sphi = null;
  realTimeData.roti = null;
  selectedStation = "";  // Resetear estación seleccionada
  console.log("Chart closed and fetch stopped.");

  // [4] Ocultar botones de índice
  hideIndexButtons();

  // [5] Resetear selector de estaciones al valor por defecto
  stationSelector.selectedIndex = 0;
}

*/

/*
// [Q] Función para ocultar y desactivar botones de índice
function hideIndexButtons() {
  const buttons = document.querySelectorAll('.primaryBtn');




  buttons.forEach(btn => {
    btn.style.display = 'none';
    btn.classList.remove('active-button');   // Elimina el estado activo
  });
}
*/


//=======================================================================================
//==============================  LISTENERS =============================================
//=======================================================================================

/*
// [I] Preload al Cargar la Página
window.onload = function () {
  console.log("Fetching station data on page load...");
  fetchSphiData();
  //fetchRotiData();
};
*/

// [J] Evento para capturar la estación y renderizar automáticamente si hay índice activo
document.getElementById("stationSelector").addEventListener("change", function () {
  detectSelectedStation();
  showIndexButtons();
  if (activeIndex) {
    const dataToRender = activeIndex === 's4' ? realTimeData['roti'] : realTimeData[activeIndex];
    if (dataToRender) {
      console.log ("[I] Intentando renderizar");

      renderChart(dataToRender, selectedStation, activeIndex);
      toggleResetButton(true);
    }
  }
});

// [K1] Render Chart for SPHI Index
document.getElementById("sphiButton").addEventListener("click", function () {
  stopAutoFetch();
  if (realTimeData.sphi && selectedStation) {
    activeIndex = 'sphi';
    document.getElementById("indexRTContainer").style.display = 'flex';
    renderChart(realTimeData.sphi, selectedStation, 'sphi');
    setActiveButton(this);
    startAutoFetch();  // Iniciar fetch automático
    document.getElementById("closeChartButton").style.display = 'inline-block';
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});

// [K2] Render Chart for ROTI Index
document.getElementById("rotiButton").addEventListener("click", function () {
  stopAutoFetch();
  if (realTimeData.roti && selectedStation) {
    activeIndex = 'roti';
    document.getElementById("indexRTContainer").style.display = 'flex';
    renderChart(realTimeData.roti, selectedStation, 'roti');
    //chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this); //pasa el boton clicado como argumento a la función
    startAutoFetch();  // Iniciar fetch automático
    document.getElementById("closeChartButton").style.display = 'inline-block';
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});

// [K3] Render Chart for S4 Index
document.getElementById("s4Button").addEventListener("click", function () {
  stopAutoFetch();
  if (realTimeData.roti && selectedStation) {
    activeIndex = 's4';
    document.getElementById("indexRTContainer").style.display = 'flex';
    renderChart(realTimeData.roti, selectedStation, 's4');
    //chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
    startAutoFetch();  // Iniciar fetch automático
    document.getElementById("closeChartButton").style.display = 'inline-block';
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});

// [L] Evento para ejecutar el fetch
document.getElementById("stationSelector").addEventListener("focus", function () {
  console.log("Evento FOCUS del selector de estaciones");
  fetchSphiData();
  fetchRotiData();
});

const resetButton = document.getElementById("closeChartButton");
if (resetButton) {
  resetButton.addEventListener("click", function () {
    resetChart();
    toggleResetButton(false);
  });
} else {
  console.warn("El botón de reset no existe en el DOM.");
}


/*
// Evento que intercepta la seleccion de estaciones con teclado que ya están en rojo.
document.getElementById("stationSelector").addEventListener("keydown", function(event) {
  const stationSelector = event.target;
  const options = Array.from(stationSelector.options);
  let currentIndex = stationSelector.selectedIndex;

  // Detectar teclas de flecha arriba y abajo
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    let nextIndex = currentIndex;

    // Incrementa o disminuye dependiendo de la tecla
    if (event.key === "ArrowDown") {
      nextIndex++;
    } else if (event.key === "ArrowUp") {
      nextIndex--;
    }

    // Saltar opciones deshabilitadas
    while (options[nextIndex] && options[nextIndex].disabled) {
      nextIndex += (event.key === "ArrowDown") ? 1 : -1;
    }

    // Si hay una opción válida, selecciónala
    if (options[nextIndex] && !options[nextIndex].disabled) {
      stationSelector.selectedIndex = nextIndex;
    }

    // Evita que el selector quede en una opción deshabilitada
    event.preventDefault();
  }
});
*/

/*
// [L] Evento para ejecutar el fetch solo si es necesario
["focus", "click"].forEach(event =>
  document.getElementById("stationSelector").addEventListener(event, function () {
    console.log("Evento de Click y Focus en selector de estaciones..");
    fetchSphiData();
    fetchRotiData();
    //checkAndUpdateData();  // Llamada directa, no bloquea el evento
  })
);
*/

/*
// [L] Evento para ejecutar el fetch solo si es necesario
["focus", "click"].forEach(event =>
  document.getElementById("stationSelector").addEventListener(event, async function () {
    console.log("Verificando si se necesita actualizar estaciones...");
    await checkAndUpdateData();
  })
);
*/

/*
// [L] Evento para ejecutar el fetch solo si es necesario
["focus", "click"].forEach(event =>
  document.getElementById("stationSelector").addEventListener(event, async function () {
    console.log("Forzando fetch de datos...");

    // Realiza el fetch directo sin comprobaciones
    await fetchSphiData();
    await fetchRotiData();
  })
);
*/



/*
// [L] Evento para ejecutar el fetch solo si es necesario
document.getElementById("stationSelector").addEventListener("focus", async function () {
  console.log("Verificando si se necesita actualizar estaciones...");
  await checkAndUpdateData();  // Llama a la función de verificación antes de abrir el selector
});
*/

/*
// [Q] Listener para el botón RESET
document.getElementById("closeChartButton").addEventListener("click", function () {
  closeChart();
  this.style.display = 'none';  // Ocultar el botón RESET después de cerrar el gráfico
});
*/



/*
setInterval(() => {
  fetchSphiData();
  fetchRotiData();
  console.log("Fetch automático ejecutado cada 10 segundos");
}, 5000);  // 10 segundos
*/


/*

// [L] Función para resetear y vaciar el gráfico --------------------------------
function resetChart() {
  // Si ya hay una instancia de myChart, la destruye antes de crear una nueva
  if (chartDom) {
      echarts.dispose(chartDom); // Esto destruye cualquier gráfico previo
  }
  chartDom = document.getElementById('chart'); // Reinicializa el contenedor del gráfico
  // Muestra el mensaje de carga
  //loadingMessageRTindex.style.display = 'block';
}
*/


/*============================PERFECTO==========================================================================
import * as echarts from 'echarts';

// [A] Variables Globales -------------------------------------------
let allData = [];
let pollingInterval = null;
let chartDom = document.getElementById('chart');
let closeButton = document.getElementById('closeChartButton');
let stationSelector = document.getElementById('stationSelector');
let activeIndex = null; // [A.1] Nueva variable para almacenar el índice seleccionado (SPHI, ROTI, S4)´
// Controlador para cancelar peticiones fetch activas
let abortController = null; // [A.3] Nueva variable para manejar el AbortController
// Seleccionamos el elemento del mensaje de carga
const loadingMessageRTindex = document.getElementById('loadingMessageRTindex');


// [A.2] Inicialización del Gráfico y Ocultación de Botón
chartDom.style.display = 'none';
closeButton.style.display = 'none';
//---------------------------------------------------------------

// [B] Función para iniciar el polling ------------------------------
function startPolling(station) {
  // Detener cualquier polling existente antes de iniciar uno nuevo
  if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
  }

  // Cancelar cualquier fetch en curso antes de iniciar uno nuevo
  if (abortController) {
      abortController.abort(); // Cancela la solicitud fetch activa
  }

  // Crear un nuevo controlador de abortos para la nueva solicitud
  abortController = new AbortController();

  // Condicional para manejar múltiples índices de datos según activeIndex
  const fetchFunction = activeIndex === 'roti' || activeIndex === 's4' ? fetchRotiData : fetchSphiData;
  const updateFunction = activeIndex === 'roti' ? updateRotiChart : activeIndex === 's4' ? updateS4Chart : updateSphiChart;

  // Iniciar el polling con un intervalo seguro y controlado
  pollingInterval = setInterval(() => {
      fetchFunction(abortController.signal) // Pasar la señal de abort a fetchFunction
          .then(data => updateFunction(data, station))
          .catch(error => {
              if (error.name === 'AbortError') {
                  console.log('Fetch cancelado debido a un cambio de índice o estación.');
              } else {
                  console.error('Error en el polling:', error);
              }
          });
  }, 10000); // Cada 10 segundos
}

// [C] Función para detener el polling ------------------------------
function stopPolling() {
  if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
  }
}
//---------------------------------------------------------------

// [D] Función para cargar los datos desde el backend [sphi.tmp] ---------------
function fetchSphiData() {
  return fetch('http://127.0.0.1:5000/api/read-sphi')
      .then(response => response.json())
      .then(data => {
          allData = data.length ? data : [];
          const availableStations = allData.map(item => item[1]);
          updateStationSelector(availableStations); // Llama a [F] Actualiza el selector
          return allData;
      })
      .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Solicitud fetch de SPHI cancelada.');
        } else {
            console.error('Error al obtener los datos:', error);
            allData = [];
        }
        return allData;
      });
}

// [D.1] Función para cargar los datos desde el backend [roti.tmp], usada también para S4
function fetchRotiData() {
  return fetch('http://127.0.0.1:5000/api/read-roti')
      .then(response => response.json())
      .then(data => {
          allData = data.length ? data : [];
          const availableStations = allData.map(item => item[1]);
          //updateStationSelector(availableStations); // Llama a [F] para actualizar el selector
          return allData;
      })
      .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Solicitud fetch de ROTI cancelada.');
        } else {
            console.error('Error al obtener los datos de roti.tmp:', error);
            allData = [];
            updateStationSelector([]); // Desactiva todas las estaciones en caso de error
        }
        return allData;
      });

}
//---------------------------------------------------------------

// [E] Función para actualizar el gráfico de SPHI ---------------------------
function updateSphiChart(data, station) {
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('Missing station signal');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none';
      return;
  }
  // Asegura que el contenedor esté visible antes de inicializar el gráfico
  document.querySelector('.chartContainer').style.display = 'flex';
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none';

  // Espera un breve momento antes de inicializar y configurar el gráfico
  setTimeout(() => {
      const scatterData = filteredData.map(item => [item[0], item[5]]);
      const myChart = echarts.init(chartDom);

      const option = {
          title: { text: `Sigma_phi L1 for ${station}` },
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: 'Time:(Seconds of the day)', nameLocation: 'center', nameGap: 40 },
          yAxis: { type: 'value', name: 'Sigma_phi L1 (Radians)' },
          series: [{
              name: 'Sigma_phi L1',
              type: 'scatter',
              data: scatterData,
              itemStyle: { color: '#32a852', opacity: 0.5 },
              symbolSize: 4
          }]
      };

      // Configura el gráfico con las opciones y fuerza el ajuste inicial
      myChart.setOption(option);
      myChart.resize(); // Fuerza el tamaño adecuado en la carga inicial

      // Asegura que el gráfico se redimensione en el evento de cambio de tamaño
      window.addEventListener('resize', () => {
          myChart.resize();
      });
  }, 50); // Retraso breve de 50 ms
}

//---------------------------------------------------------------
// [E.1] Función para actualizar el gráfico de ROTI -------------------------
function updateRotiChart(data, station) {
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('No data available for the selected station');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none';
      return;
  }

  // Asegura que el contenedor esté visible antes de inicializar el gráfico
  document.querySelector('.chartContainer').style.display = 'flex';
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none';

  // Espera un breve momento antes de inicializar y configurar el gráfico
  setTimeout(() => {
      const scatterData = filteredData.map(item => [item[0], item[6]]); // ROTI: it0 en X, rotiL1 en Y
      const myChart = echarts.init(chartDom);

      const option = {
          title: { text: `ROTI Index for ${station}` },
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: 'Time:(Seconds of the day)', nameLocation: 'center', nameGap: 40 },
          yAxis: { type: 'value', name: 'ROTI L1 (TECU/min)' },
          series: [{
              name: 'ROTI L1',
              type: 'scatter',
              data: scatterData,
              itemStyle: { color: '#32a852', opacity: 0.5 },
              symbolSize: 4
          }]
      };

      // Configura el gráfico con las opciones y fuerza el ajuste inicial
      myChart.setOption(option);
      myChart.resize(); // Fuerza el tamaño adecuado en la carga inicial

      // Asegura que el gráfico se redimensione en el evento de cambio de tamaño
      window.addEventListener('resize', () => {
          myChart.resize();
      });
  }, 50); // Retraso breve de 50 ms
}


//---------------------------------------------------------------
// [E.2] Función para actualizar el gráfico de S4 ---------------------------
function updateS4Chart(data, station) {
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('No data available for the selected station');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none';
      return;
  }

  // Asegura que el contenedor esté visible antes de inicializar el gráfico
  document.querySelector('.chartContainer').style.display = 'flex';
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none';

  // Espera un breve momento antes de inicializar y configurar el gráfico
  setTimeout(() => {
      const scatterData = filteredData.map(item => [item[0], item[10]]); // S4: it0 en X, S4 en Y
      const myChart = echarts.init(chartDom);

      const option = {
          title: { text: `S4 Index for ${station}` },
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: 'Time:(Seconds of the day)', nameLocation: 'center', nameGap: 40 },
          yAxis: { type: 'value', name: 'S4 (No unit)' },
          series: [{
              name: 'S4',
              type: 'scatter',
              data: scatterData,
              itemStyle: { color: '#32a852', opacity: 0.5 },
              symbolSize: 4
          }]
      };

      // Configura el gráfico con las opciones y fuerza el ajuste inicial
      myChart.setOption(option);
      myChart.resize(); // Fuerza el tamaño adecuado en la carga inicial

      // Asegura que el gráfico se redimensione en el evento de cambio de tamaño
      window.addEventListener('resize', () => {
          myChart.resize();
      });
  }, 50); // Retraso breve de 50 ms
}


// [F] Función para actualizar el estado de las estaciones en el selector ---
function updateStationSelector(availableStations) {
  Array.from(stationSelector.options).forEach(option => {
      //const stationCode = option.value.split('_')[0];
      const stationCode = option.value;
      if (!availableStations.includes(stationCode)) {
          option.style.color = 'red';
          option.style.pointerEvents = 'none';
          option.disabled = true;
      } else {
          option.style.color = '';
          option.style.pointerEvents = '';
          option.disabled = false;
      }
  });
}


// [G] Evento para desplegar el selector y verificar los datos actualizados
stationSelector.addEventListener('focus', () => {
  const defaultOption = stationSelector.querySelector('option');
  defaultOption.textContent = 'Loading Stations...';
  defaultOption.classList.add('loading-text');

  stationSelector.classList.add('station-loading'); // Bloquea la interacción

  fetchSphiData()
    .then(data => {
      allData = data;
      const availableStations = allData.map(item => item[1]);
      updateStationSelector(availableStations);
      defaultOption.textContent = 'Scroll down to select station';
      defaultOption.classList.remove('loading-text');

      stationSelector.classList.remove('station-loading'); // Desbloquea la interacción
    })
    .catch(error => {
      console.error('Error al cargar estaciones:', error);
      defaultOption.textContent = 'Error: Signal lost...';
      defaultOption.classList.remove('loading-text');

      stationSelector.classList.remove('station-loading'); // Desbloquea la interacción en caso de error
    });
});


// [H] Listener para el cambio de estación en el selector --------------------
stationSelector.addEventListener('change', function () {

  resetChart(); // Limpia el gráfico antes de la actualización
    // Muestra el mensaje de carga solo si ya hay un índice activo
    if (activeIndex !== null) {
      loadingMessageRTindex.style.display = 'flex';
    }

  // Mostrar los botones de índice solo si hay una estación seleccionada
  if (stationSelector.value !== "") { // Si hay una estación seleccionada
    sphiButton.style.display = 'inline-block';
    rotiButton.style.display = 'inline-block';
    s4Button.style.display = 'inline-block';
  }

  const selectedStation = this.value;
  //const selectedStation = this.value.split('_')[0];
  if (!selectedStation) return;
  stopPolling();

  // [H.1] Verifica el índice activo y actualiza el gráfico y polling correspondiente
  if (activeIndex === 'sphi') {
      updateSphiChart(allData, selectedStation);
      startPolling(selectedStation);
  } else if (activeIndex === 'roti') {
      fetchRotiData()
          .then(data => {
              updateRotiChart(data, selectedStation);
              startPolling(selectedStation);
          })
          .catch(error => console.error('Error en el polling para ROTI:', error));
  } else if (activeIndex === 's4') {
      fetchRotiData()
          .then(data => {
              updateS4Chart(data, selectedStation); // Llama a la función específica para S4
              startPolling(selectedStation);
          })
          .catch(error => console.error('Error en el polling para S4:', error));
  } else {
      chartDom.style.display = 'none'; // Oculta el gráfico si no hay índice seleccionado
      closeButton.style.display = 'none';
  }
});
//---------------------------------------------------------------

// [I] Listener para el botón de SPHI ---------------------------------------
document.getElementById('sphiButton').addEventListener('click', function () {
  // Deshabilita los botones de índice durante el renderizado
  document.getElementById('sphiButton').disabled = true;
  document.getElementById('s4Button').disabled = true;
  document.getElementById('rotiButton').disabled = true;

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'flex'; // Muestra el mensaje de carga
  //const selectedStation = stationSelector.value.split('_')[0];
  const selectedStation = stationSelector.value;
  if (!selectedStation) return;

  activeIndex = 'sphi'; // Almacena el índice activo
  stopPolling();
  updateSphiChart(allData, selectedStation);

  // Vuelve a habilitar los botones una vez completado el renderizado
  startPolling(selectedStation);
  document.getElementById('sphiButton').disabled = false;
  document.getElementById('s4Button').disabled = false;
  document.getElementById('rotiButton').disabled = false;

  // [I.1] Aplicar la clase "active-button" solo al botón SPHI
  document.getElementById('sphiButton').classList.add('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');
});

//---------------------------------------------------------------

// [I.1] Listener para el botón de ROTI --------------------------------------
document.getElementById('rotiButton').addEventListener('click', function () {
  // Deshabilita los botones de índice durante el renderizado
  document.getElementById('sphiButton').disabled = true;
  document.getElementById('s4Button').disabled = true;
  document.getElementById('rotiButton').disabled = true;

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'flex'; // Muestra el mensaje de carga
  //const selectedStation = stationSelector.value.split('_')[0];
  const selectedStation = stationSelector.value;
  if (!selectedStation) return;

  activeIndex = 'roti'; // Establece el índice activo a ROTI
  stopPolling();
  fetchRotiData()
      .then(data => {
          updateRotiChart(data, selectedStation); // Llama a la función específica para ROTI
          startPolling(selectedStation); // Inicia polling para ROTI

          // Habilita los botones de nuevo al finalizar el renderizado
          document.getElementById('sphiButton').disabled = false;
          document.getElementById('s4Button').disabled = false;
          document.getElementById('rotiButton').disabled = false;
      })
      .catch(error => console.error('Error al actualizar el gráfico ROTI:', error));

  // [I.1.1] Aplicar la clase "active-button" solo al botón ROTI
  document.getElementById('rotiButton').classList.add('active-button');
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
});

//---------------------------------------------------------------

// [I.2] Listener para el botón de S4 ---------------------------------------
document.getElementById('s4Button').addEventListener('click', function () {
  // Deshabilita los botones de índice durante el renderizado
  document.getElementById('sphiButton').disabled = true;
  document.getElementById('rotiButton').disabled = true;
  document.getElementById('s4Button').disabled = true;

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'block'; // Muestra el mensaje de carga
  //const selectedStation = stationSelector.value.split('_')[0];
  const selectedStation = stationSelector.value;
  if (!selectedStation) return;

  activeIndex = 's4'; // Establece el índice activo a S4
  stopPolling();
  fetchRotiData()
      .then(data => {
          updateS4Chart(data, selectedStation); // Llama a la función específica para S4
          startPolling(selectedStation); // Inicia polling para S4

          // Habilita los botones de nuevo al finalizar el renderizado
          document.getElementById('sphiButton').disabled = false;
          document.getElementById('rotiButton').disabled = false;
          document.getElementById('s4Button').disabled = false;
      })
      .catch(error => console.error('Error al actualizar el gráfico S4:', error));

  // [I.2.1] Aplicar la clase "active-button" solo al botón S4
  document.getElementById('s4Button').classList.add('active-button');
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');
});

//---------------------------------------------------------------

// [J] Listener para cerrar el gráfico ---------------------------------------
closeButton.addEventListener('click', () => {
  stopPolling();
  closeButton.style.display = 'none';

  const chartRTContainer = document.getElementById("indexRTContainer");
  chartRTContainer.style.display = "none";

  stationSelector.value = "";
  activeIndex = null; // Reinicia el índice activo al cerrar

  // [J.1] Quitar la clase "active-button" de todos los botones
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');

  // [J.2] Ocultar los botones de índice al cerrar el gráfico
  document.getElementById('sphiButton').style.display = 'none';
  document.getElementById('s4Button').style.display = 'none';
  document.getElementById('rotiButton').style.display = 'none';
});



// [K] Detener el polling al salir de la página -----------------------------
window.addEventListener('beforeunload', stopPolling);

// [L] Función para resetear y vaciar el gráfico --------------------------------
function resetChart() {
  // Si ya hay una instancia de myChart, la destruye antes de crear una nueva
  if (chartDom) {
      echarts.dispose(chartDom); // Esto destruye cualquier gráfico previo
  }
  chartDom = document.getElementById('chart'); // Reinicializa el contenedor del gráfico
  // Muestra el mensaje de carga
  //loadingMessageRTindex.style.display = 'block';
}
*/




/*
import * as echarts from 'echarts';

// [A] Variables Globales -------------------------------------------
let allData = [];
let pollingInterval = null;
let chartDom = document.getElementById('chart');
let closeButton = document.getElementById('closeChartButton');
let stationSelector = document.getElementById('stationSelector');
let activeIndex = null; // [A.1] Nueva variable para almacenar el índice seleccionado (SPHI, ROTI, S4)´
// Controlador para cancelar peticiones fetch activas
let abortController = null; // [A.3] Nueva variable para manejar el AbortController
// Seleccionamos el elemento del mensaje de carga
const loadingMessageRTindex = document.getElementById('loadingMessageRTindex');


// [A.2] Inicialización del Gráfico y Ocultación de Botón
chartDom.style.display = 'none';
closeButton.style.display = 'none';
//---------------------------------------------------------------

// [B] Función para iniciar el polling ------------------------------
function startPolling(station) {
  // Detener cualquier polling existente antes de iniciar uno nuevo
  if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
  }

  // Cancelar cualquier fetch en curso antes de iniciar uno nuevo
  if (abortController) {
      abortController.abort(); // Cancela la solicitud fetch activa
  }

  // Crear un nuevo controlador de abortos para la nueva solicitud
  abortController = new AbortController();

  // Condicional para manejar múltiples índices de datos según activeIndex
  const fetchFunction = activeIndex === 'roti' || activeIndex === 's4' ? fetchRotiData : fetchSphiData;
  const updateFunction = activeIndex === 'roti' ? updateRotiChart : activeIndex === 's4' ? updateS4Chart : updateSphiChart;

  // Iniciar el polling con un intervalo seguro y controlado
  pollingInterval = setInterval(() => {
      fetchFunction(abortController.signal) // Pasar la señal de abort a fetchFunction
          .then(data => updateFunction(data, station))
          .catch(error => {
              if (error.name === 'AbortError') {
                  console.log('Fetch cancelado debido a un cambio de índice o estación.');
              } else {
                  console.error('Error en el polling:', error);
              }
          });
  }, 10000); // Cada 10 segundos
}

/*
// [B] Función para iniciar el polling ------------------------------
function startPolling(station) {
  // Condicional para manejar múltiples índices de datos según activeIndex
  const fetchFunction = activeIndex === 'roti' || activeIndex === 's4' ? fetchRotiData : fetchSphiData;
  const updateFunction = activeIndex === 'roti' ? updateRotiChart : activeIndex === 's4' ? updateS4Chart : updateSphiChart;

  pollingInterval = setInterval(() => {
      fetchFunction()
          .then(data => updateFunction(data, station))
          .catch(error => console.error('Error en el polling:', error));
  }, 10000); // Cada 10 segundos
}
//---------------------------------------------------------------


// [C] Función para detener el polling ------------------------------
function stopPolling() {
  if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
  }
}
//---------------------------------------------------------------

// [D] Función para cargar los datos desde el backend [sphi.tmp] ---------------
function fetchSphiData() {
  return fetch('http://127.0.0.1:5000/api/read-sphi')
      .then(response => response.json())
      .then(data => {
          allData = data.length ? data : [];
          const availableStations = allData.map(item => item[1]);
          updateStationSelector(availableStations); // Llama a [F] Actualiza el selector
          return allData;
      })
      .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Solicitud fetch de SPHI cancelada.');
        } else {
            console.error('Error al obtener los datos:', error);
            allData = [];
        }
        return allData;
      });
}

// [D.1] Función para cargar los datos desde el backend [roti.tmp], usada también para S4
function fetchRotiData() {
  return fetch('http://127.0.0.1:5000/api/read-roti')
      .then(response => response.json())
      .then(data => {
          allData = data.length ? data : [];
          const availableStations = allData.map(item => item[1]);
          //updateStationSelector(availableStations); // Llama a [F] para actualizar el selector
          return allData;
      })
      .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Solicitud fetch de ROTI cancelada.');
        } else {
            console.error('Error al obtener los datos de roti.tmp:', error);
            allData = [];
            updateStationSelector([]); // Desactiva todas las estaciones en caso de error
        }
        return allData;
      });

}
//---------------------------------------------------------------

// [E] Función para actualizar el gráfico de SPHI ---------------------------
function updateSphiChart(data, station) {
  //resetChart(); // Limpia el gráfico antes de la actualización

  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('Missing station signal');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
      return;
  }

  const scatterData = filteredData.map(item => [item[0], item[5]]);
  const myChart = echarts.init(chartDom);

  const option = {
      title: { text: `Sigma_phi L1 for ${station}` },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', name: 'Time (Seconds of the day)' },
      yAxis: { type: 'value', name: 'Sigma_phi L1' },
      series: [{
          name: 'Sigma_phi L1',
          type: 'scatter',
          data: scatterData,
          itemStyle: { color: '#32a852', opacity: 0.5 },
          symbolSize: 4
      }]
  };

  myChart.setOption(option);
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
  //loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje si hay un error
}
//---------------------------------------------------------------
// [E.1] Función para actualizar el gráfico de ROTI -------------------------
function updateRotiChart(data, station) {
  //resetChart(); // Limpia el gráfico antes de la actualización

  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('No data available for the selected station');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
      return;
  }

  const scatterData = filteredData.map(item => [item[0], item[6]]); // ROTI: it0 en X, rotiL1 en Y
  const myChart = echarts.init(chartDom);

  const option = {
      title: { text: `ROTI Index for ${station}` },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', name: 'Time (Seconds of the day)' },
      yAxis: { type: 'value', name: 'ROTI L1 (TECU/min)' },
      series: [{
          type: 'scatter',
          data: scatterData,
          symbolSize: 4,
          itemStyle: { color: '#32a852', opacity: 0.5 }
      }]
  };

  myChart.setOption(option);
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
}

//---------------------------------------------------------------

// [E.2] Función para actualizar el gráfico de S4 ---------------------------
function updateS4Chart(data, station) {
  //resetChart(); // Limpia el gráfico antes de la actualización


  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
      alert('No data available for the selected station');
      chartDom.style.display = 'none';
      closeButton.style.display = 'none';
      stopPolling();
      loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
      return;
  }

  const scatterData = filteredData.map(item => [item[0], item[10]]); // S4: it0 en X, S4 en Y
  const myChart = echarts.init(chartDom);

  const option = {
      title: { text: `S4 Index for ${station}` },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', name: 'Time (Seconds of the day)' },
      yAxis: { type: 'value', name: 'S4 (No unit)' },
      series: [{
          type: 'scatter',
          data: scatterData,
          symbolSize: 4,
          itemStyle: { color: '#32a852', opacity: 0.5 }
      }]
  };

  myChart.setOption(option);
  chartDom.style.display = 'block';
  closeButton.style.display = 'block';
  loadingMessageRTindex.style.display = 'none'; // Oculta el mensaje de carga si hay un error
}

//---------------------------------------------------------------

// [F] Función para actualizar el estado de las estaciones en el selector ---
function updateStationSelector(availableStations) {
  Array.from(stationSelector.options).forEach(option => {
      const stationCode = option.value.split('_')[0];
      if (!availableStations.includes(stationCode)) {
          option.style.color = 'red';
          option.style.pointerEvents = 'none';
          option.disabled = true;
      } else {
          option.style.color = '';
          option.style.pointerEvents = '';
          option.disabled = false;
      }
  });
}


// [G] Evento para desplegar el selector y verificar los datos actualizados
stationSelector.addEventListener('focus', () => {
  const defaultOption = stationSelector.querySelector('option');
  defaultOption.textContent = 'Loading Stations...';
  defaultOption.classList.add('loading-text');

  stationSelector.classList.add('station-loading'); // Bloquea la interacción

  fetchSphiData()
    .then(data => {
      allData = data;
      const availableStations = allData.map(item => item[1]);
      updateStationSelector(availableStations);
      defaultOption.textContent = 'Scroll down to select station';
      defaultOption.classList.remove('loading-text');

      stationSelector.classList.remove('station-loading'); // Desbloquea la interacción
    })
    .catch(error => {
      console.error('Error al cargar estaciones:', error);
      defaultOption.textContent = 'Error: Signal lost...';
      defaultOption.classList.remove('loading-text');

      stationSelector.classList.remove('station-loading'); // Desbloquea la interacción en caso de error
    });
});


// [H] Listener para el cambio de estación en el selector --------------------
stationSelector.addEventListener('change', function () {
  resetChart(); // Limpia el gráfico antes de la actualización
    // Muestra el mensaje de carga solo si ya hay un índice activo
    if (activeIndex !== null) {
      loadingMessageRTindex.style.display = 'flex';
    }

  // Mostrar los botones de índice solo si hay una estación seleccionada
  if (stationSelector.value !== "") { // Si hay una estación seleccionada
    sphiButton.style.display = 'inline-block';
    rotiButton.style.display = 'inline-block';
    s4Button.style.display = 'inline-block';
  }



  const selectedStation = this.value.split('_')[0];
  if (!selectedStation) return;
  stopPolling();

  // [H.1] Verifica el índice activo y actualiza el gráfico y polling correspondiente
  if (activeIndex === 'sphi') {
      updateSphiChart(allData, selectedStation);
      startPolling(selectedStation);
  } else if (activeIndex === 'roti') {
      fetchRotiData()
          .then(data => {
              updateRotiChart(data, selectedStation);
              startPolling(selectedStation);
          })
          .catch(error => console.error('Error en el polling para ROTI:', error));
  } else if (activeIndex === 's4') {
      fetchRotiData()
          .then(data => {
              updateS4Chart(data, selectedStation); // Llama a la función específica para S4
              startPolling(selectedStation);
          })
          .catch(error => console.error('Error en el polling para S4:', error));
  } else {
      chartDom.style.display = 'none'; // Oculta el gráfico si no hay índice seleccionado
      closeButton.style.display = 'none';
  }
});
//---------------------------------------------------------------

// [I] Listener para el botón de SPHI ---------------------------------------
document.getElementById('sphiButton').addEventListener('click', function () {

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'flex'; // Muestra el mensaje de carga
  const selectedStation = stationSelector.value.split('_')[0];
  if (!selectedStation) return;

  activeIndex = 'sphi'; // Almacena el índice activo
  stopPolling();
  updateSphiChart(allData, selectedStation);
  startPolling(selectedStation);

  // [I.1] Aplicar la clase "active-button" solo al botón SPHI
  document.getElementById('sphiButton').classList.add('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');

});
//---------------------------------------------------------------

// [I.1] Listener para el botón de ROTI --------------------------------------
document.getElementById('rotiButton').addEventListener('click', function () {

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'flex'; // Muestra el mensaje de carga
  const selectedStation = stationSelector.value.split('_')[0];
  if (!selectedStation) return;

  activeIndex = 'roti'; // Establece el índice activo a ROTI
  stopPolling();
  fetchRotiData()
      .then(data => {
          updateRotiChart(data, selectedStation); // Llama a la función específica para ROTI
          startPolling(selectedStation); // Inicia polling para ROTI
      })
      .catch(error => console.error('Error al actualizar el gráfico ROTI:', error));

  // [I.1.1] Aplicar la clase "active-button" solo al botón ROTI
  document.getElementById('rotiButton').classList.add('active-button');
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
});
//---------------------------------------------------------------

// [I.2] Listener para el botón de S4 ---------------------------------------
document.getElementById('s4Button').addEventListener('click', function () {

  resetChart(); // Limpia el gráfico antes de la actualización
  loadingMessageRTindex.style.display = 'block'; // Muestra el mensaje de carga
  const selectedStation = stationSelector.value.split('_')[0];
  if (!selectedStation) return;

  activeIndex = 's4'; // Establece el índice activo a S4
  stopPolling();
  fetchRotiData()
      .then(data => {
          updateS4Chart(data, selectedStation); // Llama a la función específica para S4
          startPolling(selectedStation); // Inicia polling para S4
      })
      .catch(error => console.error('Error al actualizar el gráfico S4:', error));

  // [I.2.1] Aplicar la clase "active-button" solo al botón S4
  document.getElementById('s4Button').classList.add('active-button');
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');
});
//---------------------------------------------------------------

// [J] Listener para cerrar el gráfico ---------------------------------------
closeButton.addEventListener('click', () => {
  chartDom.style.display = 'none';
  closeButton.style.display = 'none';
  stopPolling();
  stationSelector.value = "";
  activeIndex = null; // Reinicia el índice activo al cerrar

  // [J.1] Quitar la clase "active-button" de todos los botones
  document.getElementById('sphiButton').classList.remove('active-button');
  document.getElementById('s4Button').classList.remove('active-button');
  document.getElementById('rotiButton').classList.remove('active-button');

  // [J.2] Ocultar los botones de índice al cerrar el gráfico
  document.getElementById('sphiButton').style.display = 'none';
  document.getElementById('s4Button').style.display = 'none';
  document.getElementById('rotiButton').style.display = 'none';
});



// [K] Detener el polling al salir de la página -----------------------------
window.addEventListener('beforeunload', stopPolling);

// [L] Función para resetear y vaciar el gráfico --------------------------------
function resetChart() {
  // Si ya hay una instancia de myChart, la destruye antes de crear una nueva
  if (chartDom) {
      echarts.dispose(chartDom); // Esto destruye cualquier gráfico previo
  }
  chartDom = document.getElementById('chart'); // Reinicializa el contenedor del gráfico
  // Muestra el mensaje de carga
  //loadingMessageRTindex.style.display = 'block';
}

*/
