let rawData;
let tempData = [];
let powerData = [];
let timeData = [];
let tempDataMin = [];
let powerDataMin = [];
let avgTempData = [];
let avgPwrData = [];
let avgTimeData = [];
let avgTempChart;
let avgPwrChart;
let tempChart;
let powerChart;
let newPowerPoint;
let newAvTemp;
let newAvPower;

const infoAreaLargeLast = $("#lastReadingBoth");
const infoAreaLargeAvg = $("#avgReadingBoth");
const infoAreaSmallTemp = $("#lastReadingTemp");
const infoAreaSmallPwr = $("#lastReadingPower");
const infoAreaSmallAvgTemp = $("#avgReadingTemp");
const infoAreaSmallAvgPwr = $("#avgReadingPower");
const ctx = $("#tempChart");
const ctx2 = $("#powerChart");
const ctx3 = $("#avgTempChart");
const ctx4 = $("#avgPwrChart");

// Reeds yaml data, puts them in an object, and passes it to a function that creates graphics
$.ajax({
    url: "../data.yml",
    success: (result)=> {
        rawData = jsyaml.load(result);
        makeChart(rawData);
    }
  });


//  Uses the current time to set the initial index for the temperature array 
let setFirstDatum = (newData) => {
    let segment = newData.temp.values;
    const d = new Date();
    const h = (d.getHours()<10?"0":"") + d.getHours();
    const m = (d.getMinutes()<10?"0":"") + d.getMinutes();
    const s = (d.getSeconds()<10?"0":"") + d.getSeconds();
    const initialTime = h+":"+m+":"+s[0];
    for(let t = 0; t < newData.temp.readings.length; t++){
        if(segment[t].time.includes(initialTime)){
            if((parseInt(segment[t].time[7]) <= 4 && parseInt(s[1]) <= 4) || (parseInt(segment[t].time[7]) >= 5 && parseInt(s[1]) >= 5)) {
                return t;
            }
        }
    }
    return t;
}
// Locates and calculates the averages of the 5 minutes prior to app launch,
// to show them as context for the first reading in "real time"
function findPastAvgs(dataSet, position, avgType){
    for(k = 5; k>0; k--){
        let total = 0;
        let avg = 0;
        if(avgType == "temp"){
            for(m = 1; m<=11; m++){
                total += (dataSet.temp.readings[position - (k*12 - m)].reading / 10 - 273.15);
            }
            avgTimeData.push(dataSet.temp.readings[position - (k*12 - m)].readingTime);
            avg = total / 11;
            newAvTemp = avg;
            avgTempData.push(avg);
        }else{
            for(m = 1; m<=11; m++){
                total += (dataSet.pwr.readings[position - (k*12 - m)].reading * 1000);
            }
            avg = total / 11 / 60;
            newAvPower = avg;
            avgPwrData.push(avg);
        }
        
    }
}
// Creates initial graphs
function makeChart(newData){   
    let t = setFirstDatum(newData);

    // Looks for previous data to give context to the first datum read in "real time"
    for(s = t-47; s <= t; s++){
        timeData.push(newData.temp.readings[s].readingTime);
        tempData.push(newData.temp.readings[s].reading);
    }
    for(s = t-11; s <= t; s++){
        tempDataMin.push(newData.temp.readings[s].reading / 10 - 273.15);
    }

    // initializes the temperature, power, and time data 
    let foundTime = newData.temp.readings[t].readingTime;
    let currentTime = foundTime;

    // Assures the temporal data synchronization between weather 
    if(newData.pwr.readings[t].readingTime == currentTime){
        for(r = t -47; r <= t; r++){
            powerData.push(newData.pwr.readings[r].reading);
        }
        for(r = t -11; r <= t; r++){
            powerDataMin.push(parseFloat(newData.pwr.readings[r].reading));
        }
        newPowerPoint = newData.pwr.readings[t].reading;
        findPastAvgs(newData, t, "power");

    }else{
        for(let q = 0; q < newData.pwr.readings.length; q++){
            if(newData.pwr.readings[q].readingTime == currentTime){
                for(r = q -47; r <= q; r++){
                    powerData.push(newData.pwr.readings[r].reading);
                }
                for(r = q -11; r <= q; r++){
                    powerDataMin.push(parseFloat(newData.pwr.readings[r].reading));
                }
                newPowerPoint = newData.pwr.readings[r].reading;
            }
        }
        findPastAvgs(newData, r, "power");
    }
    
    findPastAvgs(newData, t, "temp");
    
    
    // Creates the temperature graph in real time
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Temperature in dK',
                data: tempData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    })
    // Creates the power graph in real time 
    powerChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Power in MW',
                data: powerData,
                backgroundColor:'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    })
    // Creates the average minute temperature graph
    avgTempChart = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: avgTimeData,
            datasets: [{
                label: 'Average Temperature in ºC',
                data: avgTempData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    })
    // Creates the graph of average energy produced per minute
    avgPwrChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: avgTimeData,
            datasets: [{
                label: 'Average Energy Produced in kWh',
                data: avgPwrData,
                backgroundColor:'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    })
    
    // Establishes the explainatory text of each graph, using the last applicable datum
    // The variables that start with infoAreaLarge are for when the screen has a width > 850px.
    // The variables that start with infoAreaSmall are for screens measuring =< 850px.
    infoAreaLargeLast.text(`The last reading at ${rawData.temp.readings[t].readingTime} was of Temperature: ${rawData.temp.readings[t].reading}dK and Power: ${newPowerPoint}MW.`); 
    infoAreaSmallTemp.text(`The last temperature reading at ${rawData.temp.readings[t].readingTime} was of ${rawData.temp.readings[t].reading}dK.`);
    infoAreaSmallPwr.text(`The last power reading at ${rawData.temp.readings[t].readingTime} was of ${newPowerPoint}MW.`);
    infoAreaLargeAvg.text(`Minute averages at ${rawData.temp.readings[t].readingTime} were of Temperature: ${newAvTemp.toFixed(4)}ºC and Energy: ${newAvPower.toFixed(4)}kWh.`); 
    infoAreaSmallAvgTemp.text(`Average minute temperature at ${rawData.temp.readings[t].readingTime} was ${newAvTemp.toFixed(4)}ºC.`);
    infoAreaSmallAvgPwr.text(`Average minute energy produced at ${rawData.temp.readings[t].readingTime} was ${newAvPower.toFixed(4)}kWh.`);

    updateChart(t);

}

// Finds the average of the data from the last minute (the only content in the tempDataMin or powerDataMin arrays)
function getAvgMeasure(type){
    let avg;
    let total = 0;
    for(let j = 0; j < tempDataMin.length; j++){
        if(type == "temp"){
            total += tempDataMin[j];
            avg = total / tempDataMin.length;
        }else{
            total += (powerDataMin[j] * 1000);
            let avgPwr = total / powerDataMin.length;
            avg = avgPwr / 60;
        }
    }
    return avg;
}

// Updates the main graphs every 5 seconds and dds information to the arrays used for
// calculating the minute averages.

function updateChart(t){
    tempDataMin = [];
    powerDataMin = [];
    const updater = async() => {
        let counter = 0;
        for (let item = t+1; item < rawData.temp.readings.length; item++){
            await new Promise(r => setTimeout(r, 5000));
            // This prevents the program from trying to read data in a position outside of the array
            // (It makes a loop to link the last datum in the array with the first)
            if(t == rawData.temp.readings.length - 1){
                item = 0;
            }
            timeData.push(rawData.temp.readings[item].readingTime);
            tempData.push(rawData.temp.readings[item].reading);
            tempDataMin.push(rawData.temperature.values[item].value / 10 - 273.15);
            
            let currentTime = rawData.temp.readings[item].readingTime;
            // This corrects for any missing data over time in the power readings,
            // synchronizing the power and temperature arrays
            if(rawData.pwr.readings[item].readingTime == currentTime){
                powerData.push(rawData.pwr.readings[item].reading);
                powerDataMin.push(parseFloat(rawData.pwr.readings[item].reading));
                newPowerPoint = rawData.pwr.readings[item].reading;
            }else{
                for(let q = 0; q < rawData.pwr.readings.length; q++){
                    if(rawData.pwr.readings[q].readingTime == currentTime){
                        powerData.push(rawData.pwr.readings[q].reading);
                        powerDataMin.push(parseFloat(rawData.pwr.readings[q].reading));
                        newPowerPoint = rawData.pwr.readings[q].reading;
                    }
                }
            }
            tempChart.update();
            powerChart.update();

            // Shifts the real-time data graphs when the array reaches
            // a certain length, in order to not overwhelm them and to facilitate their reading by users
            if(tempData.length > 100){
                timeData.shift();
                tempData.shift();
                powerData.shift();
            }
            
            infoAreaLargeLast.text(`The last reading at ${rawData.temp.readings[item].readingTime} was of Temperature: ${rawData.temp.readings[item].reading}dK and Power: ${newPowerPoint}MW.`); 
            infoAreaSmallTemp.text(`The last temperature reading at ${rawData.temp.readings[item].readingTime} was of ${rawData.temp.readings[item].reading}dK.`);
            infoAreaSmallPwr.text(`The last power reading at ${rawData.temp.readings[item].readingTime} was of ${newPowerPoint}MW.`);
            counter++;

            // Updates the arrays, graphs, and explainatory texts of the minute averages
            if(counter % 12 == 0){
                newAvTemp = getAvgMeasure("temp");
                newAvPower = getAvgMeasure("power");
                avgTempData.push(newAvTemp);
                avgPwrData.push(newAvPower);
                // Shifts the minute average graphs after every new minute calculated,
                // once there are ten minutes of calculated averages present in the graphs
                if(avgTempData.length >= 12){
                    avgTempData.shift();
                    avgPwrData.shift();
                    avgTimeData.shift();
                }
                avgTimeData.push(rawData.temp.readings[item].readingTime);
                avgTempChart.update();
                avgPwrChart.update();
                infoAreaLargeAvg.text(`Minute averages at ${rawData.temp.readings[item].readingTime} were of Temperature: ${newAvTemp.toFixed(4)}ºC and Power: ${newAvPower.toFixed(4)}kWh.`); 
                infoAreaSmallAvgTemp.text(`Average minute temperature at ${rawData.temp.readings[item].readingTime} was ${newAvTemp.toFixed(4)}ºC`);
                infoAreaSmallAvgPwr.text(`Average minute energy produced at ${rawData.temp.readings[item].readingTime} was ${newAvPower.toFixed(4)}kWh`);
                tempDataMin = [];
                powerDataMin = [];
            }
        }
    }
    updater();
}