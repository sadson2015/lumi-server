'use strict';

const ModelBase = require('./ModelBase');

class Motion extends ModelBase {

	voltage(...args) {
		return this.readonly('voltage', args);
	}

	report(data, from) {
		this.data = data.data;

		if (data.data.status == 'motion') {
			this.event.emit('motion');
		}

		if (data.data.no_motion) {
			// on emit  120" 180" ...
			let timer = data.data.no_motion;
			this.event.emit('no_motion', timer);
		}
	}
}

module.exports = Motion;