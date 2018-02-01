const LumiServer = require('./model/LumiServer');
const Config = require('./config')

let server = new LumiServer(Config.password);

server.on('add', function(accessory){
	this.log.info('add..........', accessory.sid, accessory.model);

	if (accessory.model == 'gateway') {
		accessory.on('heartbeat', function(data) {
			this.rgb(	Math.random()*255,
						Math.random()*255,
						Math.random()*255);
		});
	}
})

server.on('message', function(data, from){
	this.log.info(data, from);
})

server.start();