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
		let start = Date.now();

		await new Promise(function (resolve, reject) {
			setTimeout(resolve, 5000);

			this.readBack.push(resolve);

			this.gateway.send({
				cmd: 'read',
				sid: this.sid,
			});
		}.bind(this));

		this.log.info(`${this.sid} read time ${(Date.now() - start) / 1000} second`);

		return this;
	}

	readAck(data, from) {
		this.data = data.data;

		while (	this.readBack instanceof Array
				&& this.readBack.length) {
			let func = this.readBack.pop();
			typeof func == 'function' && func.apply(this);
		}
	}

	async write(data) {
		let start = Date.now();

		await new Promise(function (resolve, reject) {
			let message = {
				cmd: 'write',
				sid: this.sid,
				model: this.model,
				data: data,
			};

			let timer = setTimeout(resolve, 5000);

			this.writeBack.push(resolve);

			this.gateway.send(message);
		}.bind(this));

		this.log.info(`${this.sid} write time ${(Date.now() - start) / 1000} second`);

		return this;
	}

	writeAck(data, from) {
		this.data = data.data;

		while (	this.writeBack instanceof Array
				&& this.writeBack.length) {
			let func = this.writeBack.pop();
			typeof func == 'function' && func.apply(this);
		}
	}

	on(name, callback) {
		this.event.on(
			name,
			callback.bind(this)
		);

		return this;
	}

	async attr(name, args, func = function (...args) {
		return args.length == 1 ? args[0] : args;
	}) {
		// args is none, read and return attribute value
		if (!args.length) {
			let r = await this.read();
			return this.data[name];
		}

		// args has value, set value
		let value = func.apply(this, args);

		await this.write({
			[name]: value
		});

		return this;
	}
}

module.exports = ModelBase;