'use strict';

const ModelBase = require('./ModelBase');

class Switch extends ModelBase {
	click() {
		this.write({
			status: 'click',
		});
	}

	doubleClick() {
		this.write({
			status: 'double_click',
		});
	}

	// default realse time 1 second, time limit less then 10 second
	longClick(releaseTime) {
		this.write({
			status: 'long_click_press',
		});
		setTimeout(() => {
			this.write({
				status: 'long_click_release',
			});
		}, Math.min(releaseTime || 1000, 10 * 1000));
	}

	report(data, from) {
		let reportType = data.data.channel_0;
		switch(reportType) {
			case 'click':
				this.event.emit('click');
				break;
			case 'double_click':
				this.event.emit('doubleClick');
				break;
			case 'long_click_press':
				this.event.emit('longClickPress');
				break;
			case 'long_click_release':
				this.event.emit('longClickRelease');
				break;
			default:
				this.log.warn(`unkown channel_0 ${reportType}`);
		}
	}
}

module.exports = Switch;