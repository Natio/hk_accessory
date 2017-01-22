var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-thermocork", "Thermocork", Thermocork);
}

function Thermocork(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];
    this._status = false;

    this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}

Thermocork.prototype.getOn = function(callback) {
    callback(null, this._status);
}

Thermocork.prototype.setOn = function(on, callback) {
    this._status = on;
    callback(null, on);
}

Thermocork.prototype.getServices = function() {
    return [this.service];
}
