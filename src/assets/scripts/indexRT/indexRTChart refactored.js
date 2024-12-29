import * as echarts from 'echarts';

// [A] Variable global para almacenar el gráfico activo
let activeChart = null;
let chartDom = document.getElementById('chart');
let closeButton = document.getElementById('closeChartButton');

// [B] Función para resetear el gráfico actual
export function resetChart() {
  if (activeChart) {
    activeChart.dispose();  // Elimina el gráfico de Echarts
    activeChart = null;     // Resetea la referencia global
    console.log("Gráfico reseteado correctamente.");
  }
}

// [C] Función auxiliar para seleccionar la columna correcta según el índice
function getIndexColumn(item, index) {
  switch (index) {
    case 'sphi': return item[5];  // SPHI L1 (columna 6)
    case 'roti': return item[6];  // ROTI L1 (columna 7)
    case 's4':   return item[10]; // S4 (columna 11)
    default:
      console.warn(`Índice desconocido: ${index}. Se usa SPHI por defecto.`);
      return item[5];  // Por defecto SPHI
  }
}

// [C.1] Función para determinar la etiqueta del eje Y según el índice
function getYAxisLabel(index) {
  switch (index) {
    case 'sphi':
      return 'SigmaPhi (Radians)';
    case 'roti':
      return 'ROTI L1 (TECU/min)';
    case 's4':
      return 'S4 (No units)';
    default:
      return `${index.toUpperCase()} (units)`;
  }
}

// [D] Función para renderizar el gráfico en tiempo real según el índice seleccionado
export function renderRTChart(data, station, index) {
  if (!chartDom) {
    chartDom = document.getElementById('chart');
  }

  // [D.1] Verifica si el contenedor tiene dimensiones
  if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
    console.warn("No es posible renderizar gráfico: el contenedor no tiene dimensiones.");
    return;
  }

  // [D.0] Forzar visualización y dimensiones del contenedor
  const chartContainer = document.querySelector('.chartContainer');
  chartContainer.style.display = 'flex';  // Asegura que el contenedor principal sea visible
  chartDom.style.display = 'block';       // Asegura que el gráfico se muestre
  chartDom.style.width = '100%';          // Forzar ancho
  chartDom.style.height = '40vh';        // Forzar altura (ajustar si es necesario)



  // [D.2] Filtra los datos según la estación seleccionada
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
    alert('No data available for the selected station');
    chartDom.style.display = 'none';
    closeButton.style.display = 'none';
    //stopPolling();
    loadingMessageRTindex.style.display = 'none';
    return;
  }

  // [D.3] Resetear el gráfico existente antes de crear uno nuevo
  resetChart();

  // [D.4] Inicializa el gráfico Echarts
  const myChart = echarts.init(chartDom);
  activeChart = myChart;  // Guarda el gráfico activo

  // [D.5] Mapea los datos filtrados para obtener los valores correctos según el índice
  const scatterData = filteredData.map(item => [item[0], getIndexColumn(item, index)]);

  // [D.6] Configuración del gráfico
  const option = {
    title: { text: `${index.toUpperCase()} Index for ${station}` },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', name: 'Time:(Seconds of the day)', nameLocation: 'center', nameGap: 40 },
    yAxis: { type: 'value', name: getYAxisLabel(index) },
    series: [{
      name: index.toUpperCase(),
      type: 'scatter',
      data: scatterData,
      itemStyle: { color: '#32a852', opacity: 0.5 },
      symbolSize: 4
    }]
  };

  // Renderizar gráfico y ocultar spinner
  myChart.setOption(option);
  myChart.resize();
  loadingMessageRTindex.style.display = 'none';  // Oculta el spinner aquí
  // Asegura que el botón RESET se muestre después de dibujar el gráfico
closeButton.style.display = 'block';


  myChart.setOption(option);
  myChart.resize();

  window.addEventListener('resize', () => {
    myChart.resize();
  });
}



// [D.7] Ajuste del tamaño del contenedor del gráfico
//chartDom.style.width = '100%';
//chartDom.style.height = '500px';  // Ajusta según el diseño
//chartDom.style.maxWidth = '900px';  // Limita el ancho máximo
//chartDom.style.margin = '0 auto';  // Centra el gráfico
