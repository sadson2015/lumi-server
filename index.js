const LumiServer = require('./model/LumiServer');
const Config = require('./config')

let server = new LumiServer(Config.password);

server.on('add', function(accessory){
	this.log.info('add..........', accessory.sid, accessory.model);

	if (accessory.model == 'gateway') {
		// event bind
		accessory.on('heartbeat', function(data) {
			// read attribute
			console.log(this.rgb());
			// write attribute
			this.rgb(Math.random()*255, Math.random()*255, Math.random()*255);
		});
	}
})

// all server recive message
server.on('message', function(data, from){
	this.log.info('[recv]', data, from);
})

server.start();