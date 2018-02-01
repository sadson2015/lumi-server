'use strict';

const ModelBase = require('./ModelBase');

class Motion extends ModelBase {
	report(data, from) {
		if (data.data.status == 'motion') {
			this.event.emit('motion');
		}

		if (data.data.no_motion) {
			// on emit  120" 180" ...
			this.event.emit('no_motion')
		}
	}
}

module.exports = Motion;