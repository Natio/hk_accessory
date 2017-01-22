var Service, Characteristic;

// https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-thermocork", "Thermocork", Thermocork);
}

function Thermocork(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];
    this._heating_speed = config['heating_speed'] || 1;
    this._cooling_speed = config['cooling_speed'] || 2;
    this.log('Heating speed: ' + this._heating_speed + ' Cooling speed: ' + this._cooling_speed);

    this.service = new Service.Thermostat(this.name);
    var targetTemperature = this.service.getCharacteristic(Characteristic.TargetTemperature);
    var temperatureDisplayUnits = this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits);
    var currentTemperature = this.service.getCharacteristic(Characteristic.CurrentTemperature);
    var targetHeatingCoolingState = this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    var currentHeatingCoolingState = this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState);

    targetTemperature.on('get', this.getTargetTemperature.bind(this));
    targetTemperature.on('set', this.setTargetTemperature.bind(this));
    temperatureDisplayUnits.on('get', this.getTemperatureDisplayUnits.bind(this));
    temperatureDisplayUnits.on('set', this.setTemperatureDisplayUnits.bind(this));
    currentTemperature.on('get', this.getCurrentTemperature.bind(this));
    currentTemperature.on('set', this.setCurrentTemperature.bind(this));
    targetHeatingCoolingState.on('get', this.getTargetHeatingCoolingState.bind(this));
    targetHeatingCoolingState.on('set', this.setCurrentHeatingCoolingState.bind(this));
    currentHeatingCoolingState.on('get', this.getCurrentHeatingCoolingState.bind(this));
    currentHeatingCoolingState.on('set', this.setCurrentHeatingCoolingState.bind(this));

    this._targetTemperature = 20;
    this._temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
    this._currentTemperature = 17;
    this._targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
    this._currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.AUTO;
}

Thermocork.prototype.setCurrentHeatingCoolingState = function(value, callback){
    this.log("setting chc state");
    this._currentHeatingCoolingState = value;
    callback(null);
}

Thermocork.prototype.getCurrentHeatingCoolingState = function(callback){
    this.log("getting chc state");
    callback(null, this._currentHeatingCoolingState);
}

Thermocork.prototype.setTargetHeatingCoolingState = function(value, callback){
    this.log("setting thc state");
    this._targetHeatingCoolingState = value;
    callback(null);
}

Thermocork.prototype.getTargetHeatingCoolingState = function(callback){
    this.log("getting thc state");
    callback(null, this._targetHeatingCoolingState);
}

Thermocork.prototype.setCurrentTemperature = function(value, callback){
    this.log("setting current temperature");
    this._currentTemperature = value;
    callback(null);
}

Thermocork.prototype.getCurrentTemperature = function(callback){
    this.log("getting current temperature");
    callback(null, this._currentTemperature);
}

Thermocork.prototype.setTargetTemperature = function(value, callback){
    this.log("setting target temperature");
    this._targetTemperature = value;
    callback(null);
}

Thermocork.prototype.getTargetTemperature = function(callback){
    this.log("getting target temperature");
    callback(null, this._targetTemperature);
}

Thermocork.prototype.setTemperatureDisplayUnits = function(value, callback){
    this._temperatureDisplayUnits = value;
    this.log("setting display unit " + value);
    if(callback){
        this.log(callback);
        callback(null);
    }
}

Thermocork.prototype.getTemperatureDisplayUnits = function(callback){
    callback(null, this._temperatureDisplayUnits);
    this.log("gatting display unit");
}

Thermocork.prototype.getServices = function() {
    return [this.service];
}
