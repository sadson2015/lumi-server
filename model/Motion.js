'use strict';

const ModelBase = require('./ModelBase');

class Motion extends ModelBase {

	voltage(...args) {
		return this.readonly('voltage', args);
	}

	report(data, from) {
		if (data.data.status == 'motion') {
			this.emit('motion');
		}

		if (data.data.no_motion) {
			// on emit  120" 180" ...
			let timer = data.data.no_motion;
			this.emit('no_motion', timer);
		}
	}
}

module.exports = Motion;