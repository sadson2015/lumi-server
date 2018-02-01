'use strict';

const ModelBase = require('./ModelBase');

class Magnet extends ModelBase {
	report(data, from) {
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