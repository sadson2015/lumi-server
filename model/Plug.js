'use strict';

const ModelBase = require('./ModelBase');

class Plug extends ModelBase {

	report(data, from) {
		let status = data.data.status;

		switch(status) {
			case 'on':
				this.event.emit('on');
				break;
			case 'off':
				this.event.emit('off');
				break;
			default:
				this.log.warn(`unkown status ${status}`);
		}
	}
}

module.exports = Plug;