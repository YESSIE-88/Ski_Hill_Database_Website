let editMode = false;
let skiHillId = 0;
let changeLog = [];

function getSkiHillData(hillId) {
  // Changing the edit button back to edit and discarding any editing that was not saved
  document.getElementById('editButton').textContent = '✏️ Edit';
  editMode = false
  changeLog = [];

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        let data = JSON.parse(xhr.responseText);
        
        // Hide usersInfo section
        document.getElementById('usersInfo').style.display = 'none';

        // Display weather info
        let weatherInfoHTML = `<h2>Weather Info for ${data.name}</h2>`;
        weatherInfoHTML += `<p>${String.fromCodePoint(0x1F321)} Temperature: ${data.weather.temp}°C</p>`;
        weatherInfoHTML += `<p>${String.fromCodePoint(0x1F976)} Feels like: ${data.weather.feels_like}°C</p>`;
        weatherInfoHTML += `<p>${String.fromCodePoint(0x1F4A8)} Wind Speed: ${data.weather.wind_speed} m/s</p>`;
        weatherInfoHTML += `<p>${String.fromCodePoint(0x2600)} Sunrise: ${data.weather.sunrise}</p>`;
        weatherInfoHTML += `<p>${String.fromCodePoint(0x1F319)} Sunset: ${data.weather.sunset}</p>`;
        document.getElementById('weatherInfo').innerHTML = weatherInfoHTML;
        
        // Display runs info
        let runsHTML = `<h2>Run Info for ${data.name}</h2>`;
        if (data.runs && data.runs.length > 0) {
          runsHTML += '<table>';
          runsHTML += '<thead><tr><th>Run Number</th><th>Run Name</th><th>Difficulty</th><th>Terrain Type</th><th>Night Skiing</th><th>Status</th></tr></thead>';
          runsHTML += '<tbody>';
          data.runs.forEach((run, index) => {
            runsHTML += `<tr><td>${index + 1}</td><td>${run.run_name}</td><td>${run.difficulty}</td><td>${run.terrain_type}</td><td>${run.night_skiing}</td><td>${run.status}</td></tr>`;
          });
          runsHTML += '</tbody>';
          runsHTML += '</table>';
        } else {
          runsHTML += '<p>No runs information available</p>';
        }
        document.getElementById('runsInfo').innerHTML = runsHTML;
        document.getElementById('weatherInfo').style.display = 'block';
        document.getElementById('runsInfo').style.display = 'block';
      } else {
        console.error('Error:', xhr.statusText);
      }
    }
  };

  xhr.open('GET', `http://localhost:3000/ski-hill/${hillId}`, true);
  xhr.send();
  skiHillId = hillId;
}



function editDetails() {
  //Exit if the user is not viewing a hill
  if(skiHillId == 0){return;}
  
  // Save mode
  else if (editMode) {
    // Get all the text input elements within the runsInfo section
    const inputElements = document.querySelectorAll('#runsInfo input[type="text"]');
    let columnIndex = -1;
    inputElements.forEach(input => {
      const newValue = input.value;
      let rowIndex = input.parentNode.parentNode.rowIndex;

      //Increment the column index and reset it if we have changed rows
      columnIndex++;
      if(columnIndex === 4){columnIndex = 0}

      // Determine the column header based on the column index
      let columnHeader;
      if (columnIndex === 0) {columnHeader = 'difficulty';}
      else if (columnIndex === 1) {columnHeader = 'terrain_type';}
      else if (columnIndex === 2) {columnHeader = 'night_skiing';}
      else if (columnIndex === 3) {columnHeader = 'status';}

      //Adjust rowIndex
      if(skiHillId === 2){rowIndex += 27;}
      else if(skiHillId === 3){rowIndex += 59;}

      // Add the changes to the changeLog array
      changeLog.push([newValue, rowIndex, columnHeader]);

    });

    // Send the changeLog array to the server
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('Changes successfully sent to the server');
        } else {
          console.error('Error sending changes to the server:', xhr.statusText);
        }
      }
    };
    xhr.open('POST', 'http://localhost:3000/save-changes', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(changeLog));
    
    // Displaying the ski hill data and passing true to stay in editing mode
    getSkiHillData(skiHillId);
  }

  // Edit mode
  else {
    
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let data = JSON.parse(xhr.responseText);
          
          // Hide usersInfo section
          document.getElementById('usersInfo').style.display = 'none';
    
          // Display weather info
          let weatherInfoHTML = `<h2>Weather Info for ${data.name}</h2>`;
          weatherInfoHTML += `<p>${String.fromCodePoint(0x1F321)} Temperature: ${data.weather.temp}°C</p>`;
          weatherInfoHTML += `<p>${String.fromCodePoint(0x1F976)} Feels like: ${data.weather.feels_like}°C</p>`;
          weatherInfoHTML += `<p>${String.fromCodePoint(0x1F4A8)} Wind Speed: ${data.weather.wind_speed} m/s</p>`;
          weatherInfoHTML += `<p>${String.fromCodePoint(0x2600)} Sunrise: ${data.weather.sunrise}</p>`;
          weatherInfoHTML += `<p>${String.fromCodePoint(0x1F319)} Sunset: ${data.weather.sunset}</p>`;
          document.getElementById('weatherInfo').innerHTML = weatherInfoHTML;
          
          // Display runs info
          let runsHTML = `<h2>Run Info for ${data.name}</h2>`;
          if (data.runs && data.runs.length > 0) {
            runsHTML += '<table>';
            runsHTML += '<thead><tr><th>Run Number</th><th>Run Name</th><th>Difficulty</th><th>Terrain Type</th><th>Night Skiing</th><th>Status</th></tr></thead>';
            runsHTML += '<tbody>';
            data.runs.forEach((run, index) => {
              runsHTML += `<tr><td>${index + 1}</td><td>${run.run_name}</td>`;
              runsHTML += `<td><input type="text" id="difficulty_${index}" value="${run.difficulty}"></td>`;
              runsHTML += `<td><input type="text" id="terrain_${index}" value="${run.terrain_type}"></td>`;
              runsHTML += `<td><input type="text" id="night_${index}" value="${run.night_skiing}"></td>`;
              runsHTML += `<td><input type="text" id="status_${index}" value="${run.status}"></td>`;
              runsHTML += `</tr>`;
            });
            runsHTML += '</tbody>';
            runsHTML += '</table>';
          } else {
            runsHTML += '<p>No runs information available</p>';
          }
          document.getElementById('runsInfo').innerHTML = runsHTML;
          document.getElementById('weatherInfo').style.display = 'block';
          document.getElementById('runsInfo').style.display = 'block';
        } else {
          console.error('Error:', xhr.statusText);
        }
      }
    };
    
    xhr.open('GET', `http://localhost:3000/ski-hill/${skiHillId}`, true);
    xhr.send();

    document.getElementById('editButton').textContent = '✅ Save';
    editMode = true;
  }
}




function displayUsers() {
  
  // Discard any editing
  document.getElementById('editButton').textContent = '✏️ Edit';
  editMode = false
  skiHillId = 0;

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        let users = JSON.parse(xhr.responseText);
        
        // Hide weather and runs info sections
        document.getElementById('weatherInfo').style.display = 'none';
        document.getElementById('runsInfo').style.display = 'none';

        // Display user info
        let usersHTML = '<h2>User Information</h2>';
        if (users && users.length > 0) {
          usersHTML += '<table>';
          usersHTML += '<thead><tr><th>Username</th><th>Password</th></tr></thead>';
          usersHTML += '<tbody>';
          users.forEach((user, index) => {
            usersHTML += `<tr><td>${user.username}</td><td>${user.password}</td></tr>`;
          });
          usersHTML += '</tbody>';
          usersHTML += '</table>';
        } else {
          usersHTML += '<p>No user information available</p>';
        }
        document.getElementById('usersInfo').innerHTML = usersHTML;
        document.getElementById('usersInfo').style.display = 'block'; // Display usersInfo section
      } else {
        console.error('Error:', xhr.statusText);
      }
    }
  };
  xhr.open('GET', 'http://localhost:3000/users', true);
  xhr.send();
}