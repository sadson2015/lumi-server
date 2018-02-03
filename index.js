const LumiServer = require('./model/LumiServer');
const Config = require('./config')

let server = new LumiServer(Config.password);

server.on('add', async function(accessory){
	this.log.info('add..........', accessory.sid, accessory.model);

	switch (accessory.model) {
		// 多功能网关
		case 'gateway':
			// event bind
			accessory.on('heartbeat', async function(data) {
				// write attribute
				await this.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255)
				// await this.brightness(.5);
				// read attribute in cache, cannot send read message
				this.log.info(`rgb from cache ${this.data.rgb}`);
				// read attribute with read message
				this.log.info(`color from read callback rgb:${JSON.stringify(await this.rgb())}, brightness:${await this.brightness() * 100}%`);
			});
			break;
		// 门窗传感器
		case 'magnet':
			accessory.on('open', async function() {
				this.log.info(`magnet(${this.sid}) open...`);
			}).on('close', async function() {
				this.log.info(`magnet(${this.sid}) close...`);
			});

			let status = await accessory.status();
			this.log.info(`magnet(${accessory.sid}) current status is ${status}...`);

			break;
		// 人体传感器
		case 'motion':
			accessory.on('motion', async function() {
				this.log.info(`motion(${this.sid}) motion...`);
			}).on('no_motion', async function(timer) {
				this.log.info(`motion(${this.sid}) no_motion timer ${timer}...`);
			});

			break;
		// 无线开关
		case 'switch':
			accessory.on('click', async function() {
				this.log.info(`switch(${this.sid}) click...`);
			}).on('doubleClick', async function() {
				this.log.info(`switch(${this.sid}) doubleClick...`);
			}).on('longClick', async function(timer) {
				this.log.info(`switch(${this.sid}) longClick ${timer / 1000} second...`);
			});

			setTimeout(() => {
				// accessory.longClick(2000);
				accessory.doubleClick(2000);
			}, 3000);

			break;
	}
})

// all server recive message
server.on('message', function(data, from){
	// this.log.info('[recv message]', data, from);
})

server.start();