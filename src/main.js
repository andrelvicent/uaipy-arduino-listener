const { SerialPort } = require('serialport');
const fs = require('fs');
const { ReadlineParser } = require('@serialport/parser-readline');

const storageName = './storage/dataStorage.txt';
const pathToSerialPort = 'COM5';
const serialPortBaudRate = 9600;
const delimiterType = '\r\n';

const serial = new SerialPort({ path: pathToSerialPort, baudRate: serialPortBaudRate });
const serialParser = serial.pipe(new ReadlineParser({ delimiter: delimiterType }));

serialParser.on('data', (arduinoSerialPortData) => {
    const newRecord = adaptToStorage(arduinoSerialPortData);
    addToStorage(newRecord);
    print(newRecord);
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