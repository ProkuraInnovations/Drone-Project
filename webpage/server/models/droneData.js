const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({}, {
  strict: false
});

const PulchowkDroneSchema = new mongoose.Schema({}, {
  strict: false
});

const NangiDroneSchema = new mongoose.Schema({},{
  strict: false
});

const DroneData = mongoose.model("DroneData", DroneSchema);
const PulchowkDroneData = mongoose.model("PulchowkDroneData",PulchowkDroneSchema);
const NangiDroneData = mongoose.model("NangiDroneData",NangiDroneSchema);

module.exports = {
  DroneData,
  PulchowkDroneData,
  NangiDroneData
};
