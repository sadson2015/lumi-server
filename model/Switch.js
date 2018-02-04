'use strict';

const ModelBase = require('./ModelBase');

class Switch extends ModelBase {
	voltage(...args) {
		return this.readonly('voltage', args);
	}

	async click() {
		await this.write({
			status: 'click',
		});
		this.event.emit('click');
	}

	async doubleClick() {
		await this.write({
			status: 'double_click',
		});
		this.event.emit('doubleClick');
	}

	// default realse time 2 second, time limit less then 10 second
	async longClick(releaseTime = 0) {
		releaseTime = Math.min(releaseTime, 10 * 1000);

		await this.write({
			status: 'long_click_press',
		});
		this.event.emit('longClickPress');

		setTimeout(async () => {
			await this.write({
				status: 'long_click_release',
			});
			this.event.emit('longClick', releaseTime);
		}, releaseTime);
	}

	report(data, from) {
		let reportType = data.data.status;

		switch(reportType) {
			case 'click':
				this.event.emit('click');
				break;
			case 'double_click':
				this.event.emit('doubleClick');
				break;
			case 'long_click_press':
				this.longStartTime = Date.now();
				this.event.emit('longClickPress');
				break;
			case 'long_click_release':
				// long click start with 2 second
				this.event.emit('longClick', Date.now() - this.longStartTime + 2000);
				break;
			default:
				this.log.warn(`status channel_0 ${reportType}`);
		}
	}
}

module.exports = Switch;