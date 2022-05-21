const { SerialPort } = require('serialport')
const fs = require('fs');
const { ReadlineParser } = require('@serialport/parser-readline')
const port = new SerialPort({ path: 'COM5', baudRate: 9600 })

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', (serialData) => {
    const dataJson = serialData + '\n';
    fs.appendFile('./serialPortData.txt', dataJson, (error) => {
        if(error) console.log(error);
        console.log(dataJson);
        console.log('sucessfully written to file.');
    });
});
