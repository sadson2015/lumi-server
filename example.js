const LumiServer = require('./model/LumiServer');
const Config = require('./config')

let server = new LumiServer(Config.password);

server.on('add', async function(accessory){
	this.info('add..........', accessory.sid, accessory.model);

	switch (accessory.model) {
		// 多功能网关
		case 'gateway':
			// return;
			// event bind
			accessory.on('heartbeat', async function(data) {
				// write attribute
				await this.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
				// read attribute in cache, cannot send read message
				this.info(`rgb from cache ${this.data.rgb}`);
				// read attribute with read message
				this.info(`color from read callback rgb:${JSON.stringify(await this.rgb())}, brightness:${await this.brightness() * 100}%`);
			});
			break;
		// 门窗传感器
		case 'magnet':
			accessory.on('open', async function() {
				this.info(`open...`);
			}).on('close', async function() {
				this.info(`close...`);
			});

			let status = await accessory.status();
			accessory.info(`current status is ${status}...`);

			break;
		// 人体传感器
		case 'motion':
			accessory.on('motion', async function() {
				this.info(`motion...`);
			}).on('no_motion', async function(timer) {
				this.info(`no_motion timer ${timer}...`);
			});

			break;
		// 无线开关
		case 'switch':
			accessory.on('click', async function() {
				this.info(`click...`);
			}).on('doubleClick', async function() {
				this.info(`doubleClick...`);
			}).on('longClick', async function(timer) {
				this.info(`longClick ${timer / 1000} second...`);
			});

			setTimeout(function () {
				// this.longClick(2000);
				// this.click();
			}.bind(accessory), 3000);

			break;
		// 插座
		case 'plug':
			setTimeout(async function () {
				// less then 20 millisecond cannot read again
				this.info('status', await accessory.status());
				this.info('inuse', await accessory.inuse());
				// await accessory.status('on');
				this.info('consumed', await accessory.consumed());
				this.info('power', await accessory.power());
			}.bind(accessory), 1000);
			break;
	}
});

// all server recive message
server.on('message', function(data, from){
	// this.info('[recv message]', data, from);
});

server.start();