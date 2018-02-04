'use strict';

const events = require('events');

class ModelBase {
	constructor(data, gateway) {
		this.sid = data.sid;
		this.model = data.model;
		this.shortId = data.short_id;
		this.gateway = data.model == 'gateway' ? this : gateway;
		this.dataUpdateTime = 0;

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

		// data update over 20 millisecond
		if (Date.now() - this.dataUpdateTime > 20) {
			await new Promise(function (resolve, reject) {
				setTimeout(resolve, 1000);

				this.readBack.push(resolve);

				// if wait for read, then not send read message again
				if (this.readBack.length == 1) {
					this.gateway.send({
						cmd: 'read',
						sid: this.sid,
					});
				}
			}.bind(this));
		}

		this.log.info(`${this.sid} read time ${(Date.now() - start) / 1000} second`);

		return this;
	}

	readAck(data, from) {
		while (	this.readBack instanceof Array
				&& this.readBack.length) {
			let func = this.readBack.pop();
			typeof func == 'function' && func.apply(this);
		}
	}

	async write(data) {
		let start = Date.now();

		await new Promise(function (resolve, reject) {
			setTimeout(resolve, 1000);

			this.writeBack.push(resolve);
			// clear update time to reload
			this.dataUpdateTime = 0;

			this.gateway.send({
				cmd: 'write',
				sid: this.sid,
				model: this.model,
				data: data,
			});
		}.bind(this));

		this.log.info(`${this.sid} write time ${(Date.now() - start) / 1000} second`);

		return this;
	}

	writeAck(data, from) {
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

	async readonly(name, args, setter, getter) {
		return this.attr(name, [], function () {
			this.log.warn(`cannot set ${this.model}(${this.sid}) ${name}`);
			return;
		}, getter);
	}

	async attr(name, args = [], setter = function (value) {
		return value;
	}, getter = function (...args) {
		return args.length == 1 ? args[0] : args;
	}) {
		// args is none, read and return attribute value
		if (!args.length) {
			await this.read();
			return getter.apply(this, [this.data[name]]);
		}

		// args has value, set value
		let value = setter.apply(this, args);

		await this.write({
			[name]: value
		});

		return this;
	}

	setData(data, cmd) {
		this.log.info('setdata ==================', data);
		this.data = data;
		return true;
	}
}

module.exports = ModelBase;