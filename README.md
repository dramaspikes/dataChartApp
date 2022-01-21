# DataChartApp

DataChartApp is a program that extracts data from a yaml file with a specific structure and displays it in "real time". The idea is to simulate constantly-updating readings (in this case of temperature and power produced), represented every five minutes, as well as the average of these readings (in relevant units) each minute, beginning from the time the user launches the app. This program can be used with any yaml file with the following general structure: 
<pre>
temp
    readings
        readingTime
        reading
pwr
    readings
        readingTime
        reading
</pre>
where reading time is presented in hh:mm:ss format (ideally in 5 second intervals), temp readings are in dK, and pwr readings in MW. The data used were from ~24 hours of readings.

## Installation

Clone repository to local machine

## Usage
Add in a yaml data file named "data.yml" with sufficient data (at least 10 minutes'-worth, 5 on either side of the time of launch) to the app folder, and open index.html using a local server.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)