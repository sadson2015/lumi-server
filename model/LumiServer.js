'use strict';

const Gateway = require('./Gateway');
const Plug = require('./Plug');
const Switch = require('./Switch');
const Magnet = require('./Magnet');
const Motion = require('./Motion');

const dgram = require('dgram');
const events = require('events');

const serverSocket = dgram.createSocket({
	type: 'udp4',
	reuseAddr: true
});
const multicastAddress = '224.0.0.50';
const multicastPort = 4321;
const serverPort = 9898;

// model helper list
const models = {
	plug: Plug,
	switch: Switch,
	magnet: Magnet,
	motion: Motion,
};

// private/protected variables
const __ = {};
const __event = {};

class LumiServer {
	constructor(password = {}) {
		this.__oid = `${Date.now()}`;
		__[this.__oid] = {};
		__[this.__oid].password = password;
		__[this.__oid].accessorys = {};

		__event[this.__oid] = new events.EventEmitter();
	}

	// event
	get event() {
		return __event[this.__oid];
	}

	on(name, callback) {
		this.event.on(name, callback.bind(this));
	}
}

LumiServer.prototype.password = function(sid) {
	return __[this.__oid].password[sid];
}

LumiServer.prototype.start = function() {
	this.initServerSocket.apply(this, []);
	this.log = console;

	this.send({
		cmd: 'whois',
	}, multicastAddress, multicastPort);

	// Test Message
	this.send({
		cmd: 'iam',
		port: '9898',
		sid: '7811dcb26145',
		model: 'gateway',
		ip: '192.168.188.102'
	}, '127.0.0.1', serverPort);

	setTimeout(() => {
		this.send({
			cmd: 'get_id_list_ack',
			sid: '7811dcb26145',
			token: 'NTnN5noiIDi8JnFP',
			data: '["158d000223a9d5","158d00020261a2","158d000202625d","158d0001e65556","158d0001fa67a6"]'
		}, '127.0.0.1', serverPort);
	}, 1000);
}

LumiServer.prototype.initServerSocket = function() {
	serverSocket.on('message', (message, from) => {
		// parse mi message to json object
		let data = {};
		try {
			data = JSON.parse(message);
		} catch(err) {
			this.log.error(`socket message error: ${message}`);
			return;
		}
		this.log.debug('[recv]', data, from);

		this.event.emit('message', data, from);

		// get accessory from cache
		let accessory = this.getAccessory(data.sid);

		// create new accessory and inhert unkown model gateway
		if (accessory && accessory.model == 'unkown') {
			if (accessory.gateway) {
				accessory = new models[data.model](data, accessory.gateway);
				this.addAccessory(accessory);
			} else {
				this.log.warn(`${data.model}(${data.sid}) cannot get unkown model gateway`);
			}
		}

		// create new gateway
		if (!accessory && data.model == 'gateway') {
			accessory = new Gateway(data, this);
			this.addAccessory(accessory);
		}

		if (accessory) {
			// execute accessory cmd function
			let cmd = data.cmd.replace(/_\w/g, i => i.substr(1).toUpperCase());

			if (typeof accessory[cmd] == 'function') {
				accessory[cmd].apply(accessory, [data, from]);
			} else {
				this.log.warn(`${data.model}(${data.sid}) cannot found function ${cmd}`);
			}
		} else {
			this.log.warn(`unkown accessory ${data.model}(${data.sid})`);
		}
	});

	// err - Error object, https://nodejs.org/api/errors.html
	serverSocket.on('error', (err) => {
		this.log.error(`socket error: ${err.stack}`);
	});

	serverSocket.on('listening', () => {
		this.log.info(`server is listening on ${serverSocket.address().address}:${serverSocket.address().port}`);
		serverSocket.addMembership(multicastAddress);
	});

	serverSocket.bind(serverPort);
}

LumiServer.prototype.addAccessory = function(accessory) {
	__[this.__oid].accessorys[accessory.sid] = accessory;
	this.event.emit('add', accessory);
}

LumiServer.prototype.removeAccessory = function(sid) {
	let accessory = this.getAccessory(sid);
	if (accessory &&
		delete __[this.__oid].accessorys[accessory.sid]
	) {	
		this.event.emit('remove', accessory);
	}
}

LumiServer.prototype.getAccessory = function(sid) {
	return __[this.__oid].accessorys[sid];
}

LumiServer.prototype.send = function(message, ip, port) {
	this.log.debug('[send]', message, ip, port);
	let strMsg = JSON.stringify(message);
	serverSocket.send(strMsg, 0, strMsg.length, port, ip);
}

module.exports = LumiServer;