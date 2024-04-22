const API_KEY = 'Replace with your OpenWeather API key';
const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('ski_resort_data.db');

// Create users table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Route to render the login page
app.get('/', (req, res) => {
  res.render('login');
});

// Handle POST request for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Render ski hill homepage upon successful login
    if (row) {
      if (username == 'admin' && password == 'jessie') {
        res.render('admin');  
      }
      else{
        res.render('ski-hills');
      }
    } else {
      res.send('Invalid username or password');
    }
  });
});

// Handle POST request for registration
app.post('/register', (req, res) => {
  const { newUsername, newPassword } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [newUsername, newPassword], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('ski-hills');
  });
});


// Handle GET requests for ski hill data
app.get('/ski-hill/:id', (req, res) => {
  const hillId = req.params.id;
  fetchSkiHillData(hillId, (err, data) => {
    if (err) {
      res.status(500).send(err.message || 'Internal Server Error');
      return;
    }
    sendJSONResponse(res, data);
  });
});

// Handle POST requests to save changes
app.post('/save-changes', (req, res) => {
  const changeLog = req.body;
  

  //console.log('Received changes:', changeLog);

  //Itterates through the array of changes and updates the database
  changeLog.forEach(change => {
    const [newValue, rowIndex, columnHeader] = change;
    
    const sql = `UPDATE runs SET ${columnHeader} = ? WHERE id = ?`;
    db.run(sql, [newValue, rowIndex], function(err) {
      if (err) {console.error('Error applying change:', err.message);} 
    });
  });

  res.status(200).send('Changes applied successfully');
});

// Handle GET request for user data
app.get('/users', (req, res) => {
  fetchUserData((err, data) => {
    if (err) {
      res.status(500).send(err.message || 'Internal Server Error');
      return;
    }
    sendJSONResponse(res, data);
  });
});

// Close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit();
  });
});

// Create HTTP server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}. Press CNTL-C to quit.`);
  console.log(`To Test:`);
  console.log(`http://localhost:3000/`);
});

// Function to fetch ski hill data from the database
function fetchSkiHillData(hillId, callback) {
  let skiHillData = {};
  db.serialize(() => {
    db.get(`SELECT * FROM ski_hills WHERE id = ${hillId}`, (err, row) => {
      if (err) {
        console.error(err.message);
        callback(err);
        return;
      }
      if (!row) {
        callback({ message: `Ski hill with id ${hillId} not found` });
        return;
      }
      skiHillData = row;

      let options = {
        host: 'api.openweathermap.org',
        path: '/data/2.5/weather?q=' + row.weather_region +
      '&appid=' + API_KEY
      };
      
      // Make HTTP request to fetch weather data
      http.request(options, function(apiResponse){
        let weatherData = '';
        apiResponse.on('data', function (chunk) {
          weatherData += chunk;
        });
        apiResponse.on('end', function () {
          // Parsing weatherData into a JavaScript object
          let weatherObject = JSON.parse(weatherData);
  
          // Converting temperatures to Celsius and formatting to one decimal point
          let tempCelsius = (weatherObject.main.temp - 273.15).toFixed(1);
          let feelsLikeCelsius = (weatherObject.main.feels_like - 273.15).toFixed(1);
  
          // Function to convert Unix timestamp to time on a 24-hour clock
          function unixTimestampToTime(unixTimestamp) {
              let date = new Date(unixTimestamp * 1000);
              let hours = date.getHours().toString().padStart(2, '0');
              let minutes = date.getMinutes().toString().padStart(2, '0');
              return `${hours}:${minutes}`;
          }
  
          // Extracting the specific properties of the data that we want
          let desiredData = {
              temp: tempCelsius,
              feels_like: feelsLikeCelsius,
              wind_speed: weatherObject.wind.speed,
              sunrise: unixTimestampToTime(weatherObject.sys.sunrise),
              sunset: unixTimestampToTime(weatherObject.sys.sunset)
          };
  
          // Assigning weather data to skiHillData
          skiHillData.weather = desiredData;

          // Fetch runs data from the database
          db.all(`SELECT * FROM runs WHERE hill_id = ${hillId}`, (err, rows) => {
            if (err) {
              console.error(err.message);
              callback(err);
              return;
            }
            skiHillData.runs = rows;

            // Send ski hill data with weather information to the client
            callback(null, skiHillData);
          });
        });
      }).end();
    });
  });
}

function fetchUserData(callback) {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    callback(null, rows);
  });
}

// Function to send JSON response to the client
function sendJSONResponse(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}
