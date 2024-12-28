import * as echarts from 'echarts';

import { updateSphiChart } from './indexRTChart.js';



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
  return fetch('http://127.0.0.1:5000/api/indexRT/read-sphi')
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
  return fetch('http://127.0.0.1:5000/api/indexRT/read-roti')
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


/*
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
*/

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
