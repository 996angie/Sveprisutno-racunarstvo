const http = require('http');
const request = require('request');
const rxjs = require('rxjs');
const readLine = require('readline');
const f = require('fs');
const { send } = require('process');



const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


const serverApiUrl = 'https://demo.thingsboard.io/api/v1/${sensor}/telemetry';
const sensors = {
  'pressure': 'OIhEJnM8VwlsTvfzpy3y',
  'tempAndHumidity': '3aj5drqUOB3s2YqQn0LX',
  'noise': '4b9fc8UZlDEfQtC3RRzA',
  'airQuality': '53k3nCjSog85NZfCtkW9',
  'light': 'BD8CwBWpOrQwMmS6VXFO'
};

readFromFile();

function readFromFile() {
  var data = [];
  var file = './office.csv';
  var rl = readLine.createInterface({
    input: f.createReadStream(file),
    output: process.stdout,
    terminal: false
  });
  rl.on('line', function (text) {
    data.push(text);
  });

  var count = 1;
  const timer = rxjs.interval(4000);
  timer.subscribe(() => {
    try {
      let line = data[count++].split(",");
      console.log(line);
      sendData(sensors.noise, 'noise', line[1]);
      sendData(sensors.light, 'illumination', line[2] / 1000000);
      sendData(sensors.tempAndHumidity, 'temperature', line[3]);
      sendData(sensors.pressure, 'pressure', line[4]);
      sendData(sensors.tempAndHumidity, 'humidity', line[6]);
      sendData(sensors.airQuality, 'air_quality', line[7]);
      sendData(sensors.airQuality, 'carbon_monoxide', line[8]);
      sendData(sensors.airQuality, 'nitrogen_dioxide', line[9])

    } catch {

    }
  });
}

function sendData(sensor, type, value) {
  let data = { [type]: value };
  const options = {
    url: serverApiUrl.replace('${sensor}', sensor),
    json: true,
    body: data
  };

  request.post(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(type, value);
  });
}