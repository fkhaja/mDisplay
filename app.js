const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const ipAddress = '127.0.0.1';
const port = 3000;
const axios = require('axios');

// Side loaded data to serve
var config_details = require('./public/data/config.json');
var iqama_times = require('./public/data/iqamas.json');

// In order to reload the json files after changing them
require.reload = function reload(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
};

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/slides', function (req, res) {
  var names = fs.readdirSync('public/imgs/slides');
  res.send(names);
});

app.get('/config-detail', function (req, res) {
  config_details = require.reload('./public/data/config.json');
  res.send(config_details);
});

app.get('/iqamas', function (req, res) {
  iqama_times = require.reload('./public/data/iqamas.json');
  res.send(JSON.stringify(iqama_times));
});

app.get('/iqamas-url', async (req, res, next) => {
  try {
    let data = await getPrayerTimes()
    res.send(data)
  } catch (error) {
    next(error)
  }
});

app.post('/config', function (req, res) {
  fs.writeFile("./public/data/config.json", JSON.stringify(req.body, null, 2),
      function (err) {
        if (err) {
          res.json(
              {"response": {"status": "ERROR", "code": 500, "message": err}});
        } else {
          res.json({"response": {"status": "OK", "code": 200}});
        }
      });
});

app.post('/iqama-update', function (req, res) {
  fs.writeFile("./public/data/iqamas.json", JSON.stringify(req.body, null, 2),
      function (err) {
        if (err) {
          res.json(
              {"response": {"status": "ERROR", "code": 500, "message": err}});
        } else {
          res.json({"response": {"status": "OK", "code": 200}});
        }
      });
});

app.get('/config', function (req, res) {
  res.sendFile(__dirname + '/public/config.html');
});

app.listen(port, ipAddress);

const getPrayerTimes = async () => {
  let today = new Date()
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let url = config_details.prayer_time_url;

  return await axios.get('https://isdonline.org/home/get_Payer_Time',
      {
        params: {
          dd: String(today.getDate()).padStart(2, '0'),
          mm: String(today.getMonth() + 1).padStart(2, '0')
        }
      }).catch((error) => {
    console.log(error);
    return error;
  }).then((response) => {
    let data = response.data[0];
    let res = {}
    res.fajr_a = data.FajarAdhan
    res.fajr_i = data.Fajar
    res.dhuhr_a = data.ZuharAdhan
    res.dhuhr_i = data.Zuhar
    res.asr_a = data.AsrAdhan
    res.asr_i = data.Asr
    res.magrib_a = data.MaghribAdhan
    res.magrib_i = data.Maghrib
    res.isha_a = data.IshaAdhan
    res.isha_i = data.Isha
    res.jumma1_a = data.Jumma1Adhan
    res.jumma1_i = data.Jumma1
    res.jumma2_a = data.Jumma2Adhan
    res.jumma2_i = data.Jumma2

    return res
  });
}
