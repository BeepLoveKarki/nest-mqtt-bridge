#!/usr/bin/env node
process.umask(0);

//npm install cylon cylon-nest cylon-mqtt
//curl -L https://developer-api.nest.com/devices/thermostats\?auth\=%YOUR_ACCESS_TOKEN%
var Cylon = require('cylon');

Cylon.robot({
  connections: {
    nest: { adaptor: 'nest', accessToken: 'c.BLUB' },
    server: { adaptor: 'mqtt', host: 'mqtt://192.168.2.35:1883' }
  },

  devices: {
    thermostat: { driver: 'nest-thermostat', connection:'nest',  deviceId: 'BLUB2-_JrKVwYwfz7' },
    nestmqtt: { driver: 'mqtt', connection:'server', topic: '/nest/set/thermostat/targetTemperatureC', adaptor: 'mqtt' },
  },

  work: function(my) {
        my.thermostat.on('status', function(data) {
          my.server.publish('/nest/get/thermostat/ambientTemperatureC', String(data["ambient_temperature_c"]));
          my.server.publish('/nest/get/thermostat/humidity', String(data["humidity"]));
          my.server.publish('/nest/get/thermostat/hvacState', String(data["hvac_state"]));
          my.server.publish('/nest/get/thermostat/targetTemperatureC', String(data["target_temperature_c"]));
          my.server.publish('/nest/get/thermostat/hvacMode', String(data["hvac_mode"]));
    });

   my.nestmqtt.on('message', function (data) {
       my.thermostat.targetTemperatureC(parseFloat(data));
    });

  }
}).start();
