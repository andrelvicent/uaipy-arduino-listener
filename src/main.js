const { SerialPort } = require('serialport');
const fs = require('fs');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios').default;

const dataLake = './src/infra/dataLake.txt';
const storageName = './src/infra/dataStorage.txt';
const pathToSerialPort = 'COM5';
const serialPortBaudRate = 9600;
const delimiterType = '\r\n';
let cont = 0;

const serial = new SerialPort({ path: pathToSerialPort, baudRate: serialPortBaudRate });
const serialParser = serial.pipe(new ReadlineParser({ delimiter: delimiterType }));

serialParser.on('data', (arduinoSerialPortData) => {
    const newRecord = adaptToStorage(arduinoSerialPortData);
    addToStorage(newRecord);
    if(cont == 10){
        print(sendToServer(adaptToCloud(getAll())));
        cont = 0;
    }
    print(cont);
    cont = cont + 1;
});

function adaptToStorage (arduinoSerialPortData) { 
    const dataParser = JSON.parse(arduinoSerialPortData);
    let clock = new Date();
    dataParser.dia = "" + clock.getDate() + "/" + (clock.getMonth()+1);
    dataParser.horario = "" + clock.getHours() + ":" + clock.getMinutes() + ":" + clock.getMilliseconds();
    return JSON.stringify(dataParser) + ",";
}

function print(data) { 
    console.log("--------------------------");
    console.log(data);
    console.log("--------------------------");
}

function addToStorage (newRecord) {
    fs.appendFile(storageName, newRecord, (error) => {
        if(error) print(error);
    });
    fs.appendFile(dataLake, newRecord, (error) => {
        if(error) print(error);
    });
}

function getAll () {
    const iftmData = fs.readFileSync(storageName, 'utf8');
    return iftmData;
}

function clearArray () {
    fs.writeFile(storageName, '', (error) => {
        if(error) print(error);
    });
}

function adaptToCloud (dataSet) { 
    const response = dataSet;
    return response;
}

function sendToServer (dataSet) {
    axios.post('https://trem-do-mundo-core.herokuapp.com/api/iftm/', 
        dataSet,
        { 
            headers: {
                Authorization:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYTNlYmI4ODYtYjg1MS00MTc2LTkyZTAtMGExZDhlM2FhOTRiIiwiaWF0IjoxNjU2OTg0MTE4LCJleHAiOjE2NTY5ODc3MTh9.cNTzRpB-j_Ze0BzYZslY4a3YviryHhek5BBuZeT6Ho4'
            }
        })
      .then(function (response) {
        clearArray();
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}