const { SerialPort } = require('serialport');
const fs = require('fs');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios').default;

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
}

function getAll () {
    const iftmData = fs.readFileSync(storageName, 'utf8');
    return iftmData;
}

function adaptToCloud (dataSet) { 
    const newArray = "{\"data\": [" + dataSet + "{}" + "]}";
    console.log(newArray);
    let response = [];
    const dataParser = JSON.parse(newArray);
    const vetor = dataParser.data;
    const lastPosition = vetor.length - 1;
    for (var i = lastPosition; i <= (lastPosition - 10); i--) {
        console.log("****"+lastPosition+"****");
        response.push(vetor[i]);
     }
    return newArray;
}

function sendToServer (dataSet) {
    axios.post('http://localhost:3000/api/iftm/', dataSet)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}