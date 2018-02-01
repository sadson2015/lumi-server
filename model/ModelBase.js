'use strict';

const events = require('events');

class ModelBase {
	constructor(data, gateway) {
		this.sid = data.sid;
		this.model = data.model;
		this.shortId = data.short_id;
		this.gateway = data.model == 'gateway' ? this : gateway;

		// init events
		this.event = new events.EventEmitter();

		this.log = gateway && gateway.log || console;
		this.data = {};

		if (typeof this.init == 'function') {
			this.init();
		}
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

	attr(name, args, func = function (...args) {
		return args.length == 1 ? args[0] : args;
	}) {
		if (!args.length) {
			return this.data[name];
		}

		let value = func.apply(this, args);

		this.write({
			[name]: value
		});

		return this;
	}
}

module.exports = ModelBase;