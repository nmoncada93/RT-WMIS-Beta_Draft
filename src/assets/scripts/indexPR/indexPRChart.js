//import * as echarts from 'echarts/types/dist/echarts';
import * as echarts from 'echarts';

// [A] Variable global para almacenar el gráfico activo
let activeChart = null;

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

// [D] Función para renderizar el gráfico según el índice seleccionado
export function renderChart(data, station, index) {
  const chartDom = document.getElementById('pastChart');

  // [D.1] Verifica si el contenedor del gráfico está visible y tiene dimensiones
  if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
    console.warn("No es posible renderizar gráfico: el contenedor no tiene dimensiones.");
    return;
  }

  // [D.2] Filtra los datos según la estación seleccionada
  const filteredData = data.filter(item => item[1] === station);
  if (filteredData.length === 0) {
    console.warn("No se encontraron datos para la estación seleccionada.");
    return;
  }

  // [D.3] Resetear el gráfico existente antes de crear uno nuevo
  resetChart();

  // [D.4] Inicializa el gráfico Echarts
  const myChart = echarts.init(chartDom);

  // [D.5] Guarda el gráfico activo en la variable global
  activeChart = myChart;

  // [D.6] Mapea los datos filtrados para obtener los valores correctos según el índice
  const scatterData = filteredData.map(item => [item[0], getIndexColumn(item, index)]);

  // [D.7] Configuración del gráfico
  const option = {
    title: { text: `Index: ${index.toUpperCase()} for station: ${station}` },
    tooltip: {  //Provide information when mouse cursor points to any point-data over the chart
      trigger: 'item',
      formatter: function (params) {
          return `Time: ${params.data[0]}<br>Value: ${params.data[1]}`;
      }
    },

    grid: {
      top: '15%',
      bottom: '20%'  // Añade espacio debajo del gráfico para el slider
    },

    xAxis: {
      type: 'value',
      name: 'Time (Seconds of the day)',
      nameLocation: 'center',
      nameGap: 40,
      min: 0,
      max: 90000,
      interval: 10000,
      axisLabel: {
        hideOverlap: true // Oculta etiquetas que se montan unas con otras
      }
    },
    yAxis: { type: 'value',  name: getYAxisLabel(index) /*name: `${index.toUpperCase()} (units)`*/ },
    series: [{
      type: 'scatter',
      data: scatterData,
      itemStyle: { color: '#002366', opacity: 0.5 },
      symbolSize: 4
    }],

        // [1] Añadir zoom y paneo
        dataZoom: [
          { type: 'slider', start: 0, end: 100},  // Zoom con barra deslizante
          { type: 'inside', start: 0, end: 100, zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnTouch: true  }   // Zoom con scroll del ratón
      ],
      // [2] Añadir botón de exportación
      toolbox: {
        show: true,
        //iconSize: 40, // Ajusta el tamaño del icono

        feature: {
          saveAsImage: {
            //show: true,
            name: 'Past_Records_Index_Chart',
            title: 'Export Chart as PNG',
            type: 'png',
            iconStyle: {
              normal: {
                color: '#002366',        // Color del icono
                borderColor: '#000000',  // Color del borde
                borderWidth: 0.5,
              },
              emphasis: {
                color: '#ff6600'         // Color al pasar el mouse
              }
            }
          }
        }
      }
  };
  // [D.8] Renderiza el gráfico

  // Configura el gráfico con las opciones y fuerza el ajuste inicial
  myChart.setOption(option);
  myChart.resize(); // Fuerza el tamaño adecuado en la carga inicial

  // Asegura que el gráfico se redimensione en el evento de cambio de tamaño
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}
















/*
//FUNCIONAL Y PERFECTO
//import * as echarts from 'echarts/types/dist/echarts';
import * as echarts from 'echarts';

// [D] Función para actualizar el gráfico de SPHI sin ajustes responsivos -----
export function renderChart(data, station) {
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
*/
