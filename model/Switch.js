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
		this.emit('click');
	}

	async doubleClick() {
		await this.write({
			status: 'double_click',
		});
		this.emit('doubleClick');
	}

	// default realse time 2 second, time limit less then 10 second
	async longClick(releaseTime = 0) {
		releaseTime = Math.min(releaseTime, 10 * 1000);

		await this.write({
			status: 'long_click_press',
		});
		this.emit('longClickPress');

		setTimeout(async () => {
			await this.write({
				status: 'long_click_release',
			});
			this.emit('longClick', releaseTime);
		}, releaseTime);
	}

	report(data, from) {
		let reportType = data.data.status;

		switch(reportType) {
			case 'click':
				this.emit('click');
				break;
			case 'double_click':
				this.emit('doubleClick');
				break;
			case 'long_click_press':
				this.longStartTime = Date.now();
				this.emit('longClickPress');
				break;
			case 'long_click_release':
				// long click start with 2 second
				this.emit('longClick', Date.now() - this.longStartTime + 2000);
				break;
			default:
				this.warn(`status channel_0 ${reportType}`);
		}
	}
}

module.exports = Switch;