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
		let status = data.data.status;

		switch(status) {
			case 'open':
				this.emit('open');
				break;
			case 'close':
				this.emit('close');
				break;
			default:
				this.warn(`unkown status ${status}`);
		}
	}
}

module.exports = Magnet;