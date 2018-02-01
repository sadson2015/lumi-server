'use strict';

// private/protected variables
const __ = {};
const __event = {};

const events = require('events');

class ModelBase {
	constructor(data, gateway) {
		this.__oid = `${data.sid}-${Date.now()}`;
		__[this.__oid] = {};
		__[this.__oid].sid = data.sid;
		__[this.__oid].model = data.model;
		__[this.__oid].gateway = data.model == 'gateway' ? this : gateway;

		// init events
		__event[this] = new events.EventEmitter();

		this.log = gateway && gateway.log || console;

		if (typeof this.init == 'function') {
			this.init();
		}
	}

	// accessory sid
	get sid() {
		return __[this.__oid].sid;
	}

	// accessory model type
	get model() {
		return __[this.__oid].model;
	}

	// gateway
	get gateway() {
		return __[this.__oid].gateway;
	}

	// event
	get event() {
		return __event[this.__oid];
	}

	read() {
		this.gateway.send({
			cmd: 'read',
			sid: this.sid,
		});
	}

	write(data) {
		let message = {
			cmd: 'write',
			sid: this.sid,
			model: this.model,
			data: data,
		};
		this.gateway.send(message);
	}

	on(name, callback) {
		this.event.on(
			name,
			callback.bind(this)
		);
	}
}

module.exports = ModelBase;