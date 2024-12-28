import * as echarts from 'echarts';

//let activeChart = null;  // Variable global para almacenar el gráfico actual
let chartDom = document.getElementById('chart');
let closeButton = document.getElementById('closeChartButton');




// [E] Función para actualizar el gráfico de SPHI ---------------------------
export function updateSphiChart(data, station) {
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
