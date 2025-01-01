import { renderChart, resetChart } from './indexPRChart.js';
import { getSelectedDate, processIndexData } from './indexPRUnxz.js';

// [A] Variables Globales
let pastRecordsData = {
  sphi: null,  // Almacena el JSON de sphi.tmp
  roti: null   // Almacena el JSON de roti.tmp
};
let activeIndex = null;
let selectedStation = "";
let activeChart = null;

// [B] Obtiene datos de sphi.tmp =====================================
async function fetchSphiData(year, doy) {
  const url = `http://127.0.0.1:5000/api/indexPR/read-sphi/${year}/${doy}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obtaining sphi.tmp for selected date");
    }

    const data = await response.json();
    pastRecordsData.sphi = data;
    console.log("Data from sphi.tmp obtained and stored");

    return data;
  } catch (error) {
    console.error("Error during sphi.tmp request:", error);
    handleNoData("No data available for the selected date. Please try again later or choose another date!");
  }
}

// [C] Obtiene datos de roti.tmp =====================================
async function fetchRotiData(year, doy) {

  const url = `http://127.0.0.1:5000/api/indexPR/read-roti/${year}/${doy}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obtaining roti.tmp for selected date");
    }

    const data = await response.json();
    pastRecordsData.roti = data;
    console.log("Data from roti.tmp obtained and stored");

    const stationSelector = document.getElementById("pastStationSelector");
    stationSelector.style.display = 'block';
    updateStationSelector(data);

    return data;
  } catch (error) {
    console.error("Error during roti.tmp request:", error);
    handleNoData("No data available for the selected date. Please try again later or choose another date!");
  }
}

// [D] Detecta estacion seleccionada =================================================
function detectSelectedStation() {
  const stationSelector = document.getElementById("pastStationSelector");
  selectedStation = stationSelector.value;
  console.log("Estación seleccionada:", selectedStation);
}

// [E] Actualiza estaciones en el selector ===========================================
function updateStationSelector(data) {
  const stationSelector = document.getElementById("pastStationSelector");
  const availableStations = data.map(item => item[1]);  // Extrae estaciones
  handlerSpinner(false);

  Array.from(stationSelector.options).forEach(option => {
    const stationCode = option.value;
    if (!availableStations.includes(stationCode)) {
      option.classList.add('no-data');
      option.disabled = true;
    } else {
      option.classList.remove('no-data');
      option.disabled = false;
    }
  });
}

// [F] Marca boton activo y desactiva el resto ========================================
function setActiveButton(button) {
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => btn.classList.remove("active-button"));
  button.classList.add("active-button");
}

// [G] Resetear el estado de UI al hacer focus en el calendario
function resetUI() {
  const stationSelector = document.getElementById("pastStationSelector");
  document.getElementById("indexPRContainer").style.display = 'none';
  stationSelector.style.display = 'none';

  // Elimina gráfico activo si existe
  if (activeChart) {
    activeChart.dispose();
    activeChart = null;
    console.log("Gráfico eliminado.");
  }
  stationSelector.value = "";

  // Desactiva y oculta todos los botones
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => {
    btn.classList.remove("active-button");
    btn.style.display = 'none';
  });

  // Reinicia Indice activo
  activeIndex = null;
}

// [H] Muestra botones INDEX solo si hay estación seleccionada y datos cargados ============
function showIndexButtons() {
  const buttons = document.querySelectorAll('.primaryPRBtn');

  if (selectedStation && (pastRecordsData.sphi || pastRecordsData.roti)) {
    buttons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  }
}

// [I] Mostrar/ocultar spinner de carga
function handlerSpinner(show) {
  const spinner = document.getElementById('loadingMessagePRindex');
  spinner.style.display = show ? 'flex' : 'none';
  console.log(show ? "Spinner mostrado" : "Spinner oculto");
}

// [J] Función para manejar errores de datos o solicitudes fallidas
function handleNoData(message = "No data available for the selected date.") {
  const noDataMessage = document.getElementById('noDataMessagePRindex');
  handlerSpinner(false);
  noDataMessage.innerHTML = `<p style="color: #ff6600; font-weight: bold;">${message}</p>`;
  noDataMessage.style.display = 'block';
  resetUI();
}


//=======================================================================================
//==============================  LISTENERS =============================================
//=======================================================================================

// [B] Captura estacion renderizasi hay índice activo
document.getElementById("dateInput").addEventListener("change", function () {
  const { year, doy } = getSelectedDate(this.value);
  console.log("Fecha seleccionada:", this.value, "Año:", year, "Día del año (DoY):", doy);

  handlerSpinner(true);
  resetChart();
  document.getElementById('noDataMessagePRindex').style.display = 'none';
  processIndexData(year, doy, fetchSphiData, fetchRotiData);
});

// [G] Reset UI cuando el calendario obtiene foco
document.getElementById("dateInput").addEventListener("change", resetUI);

// [I] Captura estacion y renderiza si hay indice activo
document.getElementById("pastStationSelector").addEventListener("change", function () {
  detectSelectedStation();
  showIndexButtons();
  if (activeIndex) {
    const dataToRender = activeIndex === 's4' ? pastRecordsData['roti'] : pastRecordsData[activeIndex];
    if (dataToRender) {
      renderChart(dataToRender, selectedStation, activeIndex);
    }
  }
});

// [L1] Renderiza SPHI
document.getElementById("sphiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.sphi && selectedStation) {
    activeIndex = 'sphi';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.sphi, selectedStation, 'sphi');
    setActiveButton(this);
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});

// [L2] Renderiza ROTI
document.getElementById("rotiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 'roti';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 'roti');
    setActiveButton(this);
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});

// [L3] Renderiza S4
document.getElementById("s4IndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 's4';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 's4');
    setActiveButton(this);
  } else {
    console.log("Selecciona una estación antes de generar el gráfico.");
  }
});


/*
import { renderChart, resetChart } from './indexPRChart.js';
import { getSelectedDateInfo, processIndexData } from './past_unxz_calendar.js';

// [A] Variables Globales
let pastRecordsData = {
  sphi: null,  // Almacena el JSON de sphi.tmp
  roti: null   // Almacena el JSON de roti.tmp
};
let activeIndex = null;  // Índice activo (sphi, roti)
let selectedStation = ""; // Estación seleccionada
let activeChart = null;  // Referencia global al gráfico activo

// [D] Función para obtener los datos de sphi.tmp desde el backend
async function fetchSphiData(year, doy) {
  const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
    }

    const data = await response.json();
    pastRecordsData.sphi = data;
    console.log("Datos de sphi.tmp obtenidos y almacenados");

    return data;
  } catch (error) {
    console.error("Error durante la solicitud:", error);
    alert("Fallo al obtener los datos");
  }
}

// [D1] Nueva función para obtener los datos de roti.tmp desde el backend
async function fetchRotiData(year, doy) {

  const url = `http://127.0.0.1:5000/api/read-roti/${year}/${doy}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de roti.tmp");
    }

    const data = await response.json();
    pastRecordsData.roti = data;
    console.log("Datos de roti.tmp obtenidos y almacenados");

    const stationSelector = document.getElementById("pastStationSelector");
    stationSelector.style.display = 'block';
    updateStationSelector(data);

    return data;
  } catch (error) {
    console.error("Error durante la solicitud de roti.tmp:", error);
    alert("Fallo al obtener los datos de roti.tmp");
  }
}

// [C] Función para detectar la estación seleccionada
function detectSelectedStation() {
  const stationSelector = document.getElementById("pastStationSelector");
  selectedStation = stationSelector.value;
  console.log("Estación seleccionada:", selectedStation);
}

// [E] Función para actualizar estaciones en el selector
function updateStationSelector(data) {
  const stationSelector = document.getElementById("pastStationSelector");
  const availableStations = data.map(item => item[1]);  // Extraer estaciones
  hideLoadingSpinner();

  Array.from(stationSelector.options).forEach(option => {
    const stationCode = option.value;
    if (!availableStations.includes(stationCode)) {
      option.classList.add('no-data');
      option.disabled = true;
    } else {
      option.classList.remove('no-data');
      option.disabled = false;
    }
  });
}

// [M] Función para marcar el botón activo y desactivar el resto
function setActiveButton(button) {
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => btn.classList.remove("active-button"));
  button.classList.add("active-button");
}

// [H] Función para resetear el estado de UI al hacer focus en el calendario
function resetUI() {
  const stationSelector = document.getElementById("pastStationSelector");
  document.getElementById("indexPRContainer").style.display = 'none';

  // Ocultar selector de estaciones
  stationSelector.style.display = 'none';

  // Eliminar el gráfico activo si existe
  if (activeChart) {
    activeChart.dispose();
    activeChart = null;
    console.log("Gráfico eliminado.");
  }
  // Resetear el selector de estaciones
  stationSelector.value = "";

  // Desactivar y ocultar todos los botones de índice
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => {
    btn.classList.remove("active-button");
    btn.style.display = 'none';  // Oculta los botones nuevamente
  });

  // Reiniciar índice activo
  activeIndex = null;
}

// [K] Función para mostrar botones de índice solo si hay estación seleccionada
function showIndexButtons() {
  const buttons = document.querySelectorAll('.primaryPRBtn');

  // Verifica si hay datos y una estación seleccionada
  if (selectedStation && (pastRecordsData.sphi || pastRecordsData.roti)) {
    buttons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  } else {
    console.log("Los botones no se muestran porque no hay estación seleccionada.");
  }
}

// [J] Mostrar el spinner de carga
function showLoadingSpinner() {
  const spinner = document.getElementById('loadingMessagePRindex');
  spinner.style.display = 'flex';
  console.log("Spinner mostrado");
}

// [F] Ocultar el spinner de carga
function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingMessagePRindex');
  spinner.style.display = 'none';
}

//=======================================================================================
//==============================  LISTENERS =============================================
//=======================================================================================

// [B] Evento para capturar la fecha seleccionada
document.getElementById("dateInput").addEventListener("change", function () {
  const { year, doy } = getSelectedDateInfo(this.value);
  console.log("Fecha seleccionada:", this.value, "Año:", year, "Día del año (DoY):", doy);
  showLoadingSpinner();
  resetChart();
  processIndexData(year, doy, fetchSphiData, fetchRotiData);
});

// [G] Reset UI cuando el calendario obtiene foco
document.getElementById("dateInput").addEventListener("change", resetUI);

// [I] Evento para capturar la estación y renderizar automáticamente si hay índice activo
document.getElementById("pastStationSelector").addEventListener("change", function () {
  detectSelectedStation();
  showIndexButtons();
  if (activeIndex) {
    const dataToRender = activeIndex === 's4' ? pastRecordsData['roti'] : pastRecordsData[activeIndex];
    if (dataToRender) {
      renderChart(dataToRender, selectedStation, activeIndex);
    }
  }
});

// [L1] Renderizar SPHI
document.getElementById("sphiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.sphi && selectedStation) {
    activeIndex = 'sphi';
    // [1] Muestra el contenedor antes de renderizar
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.sphi, selectedStation, 'sphi');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});

// [L2] Renderizar ROTI
document.getElementById("rotiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 'roti';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 'roti');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});

// [L3] Renderizar S4
document.getElementById("s4IndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 's4';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 's4');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});
*/


/*
import { renderChart, resetChart } from './indexPRChart.js';
import { getSelectedDateInfo, processIndexData } from './past_unxz_calendar.js';

// [A] Variables Globales
let pastRecordsData = {
  sphi: null,  // Almacena el JSON de sphi.tmp
  roti: null   // Almacena el JSON de roti.tmp
};
let activeIndex = null;  // Índice activo (sphi, roti)
let selectedStation = ""; // Estación seleccionada
let activeChart = null;  // Referencia global al gráfico activo

// [B] Función para obtener los datos de sphi.tmp desde el backend
async function fetchSphiData(year, doy) {
  const url = `http://127.0.0.1:5000/api/read-sphi/${year}/${doy}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de sphi.tmp para la fecha seleccionada");
    }

    const data = await response.json();
    pastRecordsData.sphi = data;
    console.log("Datos de sphi.tmp obtenidos y almacenados");

    return data;
  } catch (error) {
    console.error("Error durante la solicitud:", error);
    alert("Fallo al obtener los datos");
  }
}

// [B.1] Nueva función para obtener los datos de roti.tmp desde el backend
async function fetchRotiData(year, doy) {

  const url = `http://127.0.0.1:5000/api/read-roti/${year}/${doy}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de roti.tmp");
    }

    const data = await response.json();
    pastRecordsData.roti = data;
    console.log("Datos de roti.tmp obtenidos y almacenados");

    const stationSelector = document.getElementById("pastStationSelector");
    stationSelector.style.display = 'block';
    updateStationSelector(data);

    return data;
  } catch (error) {
    console.error("Error durante la solicitud de roti.tmp:", error);
    alert("Fallo al obtener los datos de roti.tmp");
  }
}

// [C] Función para detectar la estación seleccionada
function detectSelectedStation() {
  const stationSelector = document.getElementById("pastStationSelector");
  selectedStation = stationSelector.value;
  console.log("Estación seleccionada:", selectedStation);
}

// [D] Evento para capturar la fecha seleccionada
document.getElementById("dateInput").addEventListener("change", function () {
  const { year, doy } = getSelectedDateInfo(this.value);
  console.log("Fecha seleccionada:", this.value, "Año:", year, "Día del año (DoY):", doy);
  showLoadingSpinner();
  resetChart();
  processIndexData(year, doy, fetchSphiData, fetchRotiData);
});

// [E] Reset UI cuando el calendario obtiene foco
document.getElementById("dateInput").addEventListener("change", resetUI);

// [F] Evento para capturar la estación y renderizar automáticamente si hay índice activo
document.getElementById("pastStationSelector").addEventListener("change", function () {
  detectSelectedStation();
  showIndexButtons();
  if (activeIndex) {
    const dataToRender = activeIndex === 's4' ? pastRecordsData['roti'] : pastRecordsData[activeIndex];
    if (dataToRender) {
      renderChart(dataToRender, selectedStation, activeIndex);
    }
  }
});

// [G] Función para actualizar estaciones en el selector
function updateStationSelector(data) {
  const stationSelector = document.getElementById("pastStationSelector");
  const availableStations = data.map(item => item[1]);  // Extraer estaciones
  hideLoadingSpinner();

  Array.from(stationSelector.options).forEach(option => {
    const stationCode = option.value;
    if (!availableStations.includes(stationCode)) {
      option.classList.add('no-data');
      option.disabled = true;
    } else {
      option.classList.remove('no-data');
      option.disabled = false;
    }
  });
}

// [H] Renderizar SPHI
document.getElementById("sphiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.sphi && selectedStation) {
    activeIndex = 'sphi';
    // [1] Muestra el contenedor antes de renderizar
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.sphi, selectedStation, 'sphi');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});

// [I] Renderizar ROTI
document.getElementById("rotiIndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 'roti';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 'roti');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});

// [J] Renderizar S4
document.getElementById("s4IndexPRBtn").addEventListener("click", function () {
  if (pastRecordsData.roti && selectedStation) {
    activeIndex = 's4';
    document.getElementById("indexPRContainer").style.display = 'flex';
    renderChart(pastRecordsData.roti, selectedStation, 's4');
    chartRendered = true;  // MARCAR COMO RENDERIZADO
    setActiveButton(this);
  } else {
    alert("Selecciona una estación antes de generar el gráfico.");
  }
});

// [K] Función para marcar el botón activo y desactivar el resto
function setActiveButton(button) {
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => btn.classList.remove("active-button"));
  button.classList.add("active-button");
}

// [L] Función para resetear el estado de UI al hacer focus en el calendario
function resetUI() {
  const stationSelector = document.getElementById("pastStationSelector");
  document.getElementById("indexPRContainer").style.display = 'none';

  // Ocultar selector de estaciones
  stationSelector.style.display = 'none';

  // Eliminar el gráfico activo si existe
  if (activeChart) {
    activeChart.dispose();
    activeChart = null;
    console.log("Gráfico eliminado.");
  }
  // Resetear el selector de estaciones
  stationSelector.value = "";

  // Desactivar y ocultar todos los botones de índice
  const buttons = document.querySelectorAll(".primaryPRBtn");
  buttons.forEach(btn => {
    btn.classList.remove("active-button");
    btn.style.display = 'none';  // Oculta los botones nuevamente
  });

  // Reiniciar índice activo
  activeIndex = null;
}

// [M] Modificación: Evento para resetear UI al hacer foco en el calendario
document.getElementById("dateInput").addEventListener("change", resetUI);


// [N] Función para mostrar botones de índice solo si hay estación seleccionada
function showIndexButtons() {
  const buttons = document.querySelectorAll('.primaryPRBtn');

  // Verifica si hay datos y una estación seleccionada
  if (selectedStation && (pastRecordsData.sphi || pastRecordsData.roti)) {
    buttons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  } else {
    console.log("Los botones no se muestran porque no hay estación seleccionada.");
  }
}

// [O] Mostrar el spinner de carga
function showLoadingSpinner() {
  const spinner = document.getElementById('loadingMessagePRindex');
  spinner.style.display = 'flex';
  console.log("Spinner mostrado");
}

// [P] Ocultar el spinner de carga
function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingMessagePRindex');
  spinner.style.display = 'none';
}
*/
