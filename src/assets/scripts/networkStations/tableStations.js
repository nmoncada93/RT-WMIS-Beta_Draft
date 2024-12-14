
function fetchData() {
  // Fetch data from the API
  fetch('http://127.0.0.1:5000/api/network-stations')
      .then(response => {
          if (!response.ok) {
              throw new Error('No data available in the UPC server');
          }
          return response.json();
      })
      .then(data => {
          // Call a function to update station status in the table
          updateStationStatus(data.content);
      })
      .catch(error => {
          console.error('Conection problem', error);
      });

}
// Run fetch
fetchData();

// Set an interval to fetch the data every 10 seconds
setInterval(fetchData, 10000);

// Function to update the status of each station in the table
function updateStationStatus(content) {
    // Regular expression to capture any station with "NOT available" or "available"
    const stationRegex = /INFO\s(\w+)\s(NOT available|available)/g;
    let match;

    // Process each match
    while ((match = stationRegex.exec(content)) !== null) {
        const stationName = match[1]; // Station name
        const status = match[2];      // Status --> ("available" or "NOT available")

        // Construct the id of the <tr> based on the station name
        const rowId = `tr${stationName}`;
        const row = document.getElementById(rowId);

        if (row) {
            // If the status is "NOT available" --> it change the color to red
            if (status === "NOT available") {
                row.style.color = 'red'; //pendiente cambiar a modificar + SASS
            } else {
                // If AVAILABLE --> reset the color
                row.style.color = ''; // empty resets to the default color
            }
        }
    }
}
