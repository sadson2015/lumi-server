'use strict';

const ModelBase = require('./ModelBase');

class Magnet extends ModelBase {

	status(...args) {
		return this.readonly('status', args);
	}

	voltage(...args) {
		return this.readonly('voltage', args);
	}

	report(data, from) {
		this.data = data.data;

		let status = data.data.status;

		switch(status) {
			case 'open':
				this.event.emit('open');
				break;
			case 'close':
				this.event.emit('close');
				break;
			default:
				this.log.warn(`unkown status ${status}`);
		}
	}
}

module.exports = Magnet;