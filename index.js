const LumiServer = require('./model/LumiServer');
const Config = require('./config')

let server = new LumiServer(Config.password);

server.on('add', function(accessory){
	this.log.info('add..........', accessory.sid, accessory.model);

	if (accessory.model == 'gateway') {
		// event bind
		accessory.on('heartbeat', async function(data) {
			// write attribute
			this.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
			// read attribute in cache, cannot send read message
			this.log.info(`rgb from cache ${this.data.rgb}`);
			// read attribute with read message
			this.log.info(`rgb from read callback ${await this.rgb()}`);
		});
	}
})

// all server recive message
server.on('message', function(data, from){
	// this.log.info('[recv message]', data, from);
})

server.start();