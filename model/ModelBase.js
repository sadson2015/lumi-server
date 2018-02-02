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

		this.readBack = [];
		this.writeBack = [];

		if (typeof this.init == 'function') {
			this.init();
		}
	}

	async read() {
		await new Promise(function (resolve, reject) {
			this.readBack.push(resolve);

			this.gateway.send({
				cmd: 'read',
				sid: this.sid,
			});
		}.bind(this));

		return this;
	}

	readAck(data, from) {
		this.data = data.data;

		while (	this.readBack instanceof Array
				&& this.readBack.length) {
			this.readBack.pop().apply(this);
		}
	}

	async write(data) {
		await new Promise(function (resolve, reject) {
			let message = {
				cmd: 'write',
				sid: this.sid,
				model: this.model,
				data: data,
			};

			this.writeBack.push(resolve);

			this.gateway.send(message);
		}.bind(this));

		return this;
	}

	writeAck(data, from) {
		this.data = data.data;

		while (	this.writeBack instanceof Array
				&& this.writeBack.length) {
			this.writeBack.pop().apply(this);
		}
	}

	on(name, callback) {
		this.event.on(
			name,
			callback.bind(this)
		);

		return this;
	}

	attr(name, args, func = function (...args) {
		return args.length == 1 ? args[0] : args;
	}) {
		if (!args.length) {
			this.read();
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