var Service, Characteristic;
const SIMULATION_FREQUENCY = 60 * 1000;
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
    this._heating_speed = (config['heating_speed'] || 1) / 3600;
    this._cooling_speed = (config['cooling_speed'] || 2) / 3600;
    this.log('Heating speed: ' + this._heating_speed + ' Cooling speed: ' + this._cooling_speed);

    this.service = new Service.Thermostat(this.name);
    this.targetTemperatureCharacteristic = this.service.getCharacteristic(Characteristic.TargetTemperature);
    this.temperatureDisplayUnitsCharacteristic = this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits);
    this.currentTemperatureCharacteristic = this.service.getCharacteristic(Characteristic.CurrentTemperature);
    this.targetHeatingCoolingStateCharacteristic = this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState);
    this.currentHeatingCoolingStateCharacteristic = this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState);

    this.targetTemperatureCharacteristic.on('get', this.getTargetTemperature.bind(this));
    this.targetTemperatureCharacteristic.on('set', this.setTargetTemperature.bind(this));
    this.temperatureDisplayUnitsCharacteristic.on('get', this.getTemperatureDisplayUnits.bind(this));
    this.temperatureDisplayUnitsCharacteristic.on('set', this.setTemperatureDisplayUnits.bind(this));
    this.currentTemperatureCharacteristic.on('get', this.getCurrentTemperature.bind(this));
    this.currentTemperatureCharacteristic.on('set', this.setCurrentTemperature.bind(this));
    this.targetHeatingCoolingStateCharacteristic.on('get', this.getTargetHeatingCoolingState.bind(this));
    this.targetHeatingCoolingStateCharacteristic.on('set', this.setCurrentHeatingCoolingState.bind(this));
    this.currentHeatingCoolingStateCharacteristic.on('get', this.getCurrentHeatingCoolingState.bind(this));
    this.currentHeatingCoolingStateCharacteristic.on('set', this.setCurrentHeatingCoolingState.bind(this));

    this._targetTemperature = 20;
    this._temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
    this._currentTemperature = 17;
    this._targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
    this._currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.AUTO;

    this.log("Starting with currentTemperature: " + this._currentTemperature);
    this.log("target temperature: " + this._targetTemperature);
    this.log("heating speed:" + this._heating_speed);
    this.log("Cooling speed:" + this._cooling_speed);

    this._last_update = new Date();
    // start the monitor loop
    setInterval(this.timerTick.bind(this), SIMULATION_FREQUENCY);
}

Thermocork.prototype.simulateTemperatureChange = function(){
    var delta_seconds = (Date.now() - this._last_update) / 1000;
    this.log("delta_seconds " + delta_seconds);
    var temperature_delta = 0.0;

    if (this._currentHeatingCoolingState === Characteristic.CurrentHeatingCoolingState.OFF){
        this.log("thermostat is OFF, decreasing temperature");
        temperature_delta = -(this._cooling_speed * delta_seconds)
    } else {
        this.log("thermostat is ON, increasing temperature");
        temperature_delta = (this._heating_speed * delta_seconds);
    }

    this.log("temperature delta: " + temperature_delta);
    this._currentTemperature += temperature_delta;
    // do not allow the temperature to go below 15 degrees
    this._currentTemperature = Math.max(this._currentTemperature, 15);
    this.log("Current temperature: " + this._currentTemperature);

    this.currentTemperatureCharacteristic.setValue(this._currentTemperature, null, 'simulateTemperatureChange');

    this._last_update = Date.now();
}

Thermocork.prototype.timerTick = function(){
    this.log('tic');

    // update this._currentTemperature
    this.simulateTemperatureChange();

    // Check if we need to switch off
    if (this._currentHeatingCoolingState !== Characteristic.CurrentHeatingCoolingState.OFF){
        if(this._currentTemperature > this._targetTemperature){
            this.log("Reached terget temperature, switching off");
            this._currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
            this.currentTemperatureCharacteristic.setValue(Characteristic.CurrentHeatingCoolingState.OFF, null, 'timerTick');
        }
    }
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
    callback(null);
}

Thermocork.prototype.getTemperatureDisplayUnits = function(callback){
    callback(null, this._temperatureDisplayUnits);
    this.log("gatting display unit");
}

Thermocork.prototype.getServices = function() {
    return [this.service];
}
