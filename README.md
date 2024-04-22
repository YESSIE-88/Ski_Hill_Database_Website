# Ski_Hill_Database_Website
To run this code you will need your own OpenWeatherMap API key you can aquire one [Here](https://openweathermap.org/api)
To install the required modules launch a terminal window in the directory where the server is located and run: npm install
To acces the website locally run: node server.js
In your browser go to the url: http://localhost:3000/

To login as admin the credentials are:
username: admin
password: jessie

You can register a new guest account with the register button or use the existing credentials:
username: guest
password: secret

If you register a new user their information will be localy stored in the SQ Lite database

Once logged in you can click on any of the ski hills to view their information such as the weather data obtained from OpenWeatherMap and some information abouts the runs of the ski hill which are stored in the SQ Lite database

As a guest user you can use the edit and save buttons to make changes to the information stored in the databse for each run, (ex change from open to closed)

If you are logged in as the admin you can also see all the users and passwords stored in the SQ Lite database
