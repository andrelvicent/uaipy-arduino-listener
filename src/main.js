const { SerialPort } = require('serialport');
const fs = require('fs');
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
const storageName = './serialPortData.txt';

parser.on('data', (arduinoSerialPortData) => {
    const newRecord = adaptToStorage(arduinoSerialPortData);
    addToStorage(newRecord);
    print(newRecord);
});

function adaptToStorage (arduinoSerialPortData) { 
    const dataParser = JSON.parse(arduinoSerialPortData);
    let clock = new Date();
    dataParser.dia = "" + clock.getDate() + "/" + (clock.getMonth()+1) + "/" + clock.getFullYear();
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