'use strict';

const ModelBase = require('./ModelBase');

class Plug extends ModelBase {

	voltage(...args) {
		return this.readonly('voltage', args);
	}

	status(...args) {
		return this.attr('status', args);
	}

	inuse(...args) {
		return this.readonly('inuse', args);
	}

	consumed(...args) {
		return this.readonly('power_consumed', args);
	}

	power(...args) {
		return this.readonly('load_power', args);
	}

	report(data, from) {
		let status = data.data.status;

		switch(status) {
			case 'on':
				this.emit('on');
				break;
			case 'off':
				this.emit('off');
				break;
			default:
				this.warn(`unkown status ${status}`);
		}
	}
}

module.exports = Plug;