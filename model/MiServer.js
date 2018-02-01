'use strict';

const ServerBase = require('./ServerBase');

const Gateway = require('./Gateway');
const Plug = require('./Plug');
const Switch = require('./Switch');
const Magnet = require('./Magnet');
const Motion = require('./Motion');

const dgram = require('dgram');
const serverSocket = dgram.createSocket({
	type: 'udp4',
	reuseAddr: true
});
const multicastAddress = '224.0.0.50';
const multicastPort = 4321;
const serverPort = 9898;

// model helper list
let models = {
	plug: Plug,
	switch: Switch,
	magnet: Magnet,
	motion: Motion,
};

let accessorys = {};

// callbacks while sent read and write message
let callbacks = {};

class MiServer extends ServerBase {	
	start() {
		this.accessorys = accessorys;
		this.initServerSocket.apply(this, []);

		this.send({
			cmd: 'whois',
		}, multicastAddress, multicastPort);

		// Test Message
		// this.send({
		// 	cmd: 'iam',
		// 	port: '9898',
		// 	sid: '7811dcb26145',
		// 	model: 'gateway',
		// 	ip: '192.168.188.102'
		// }, '127.0.0.1', serverPort);

		// setTimeout(() => {
		// 	this.send({
		// 		cmd: 'get_id_list_ack',
		// 		sid: '7811dcb26145',
		// 		token: 'NTnN5noiIDi8JnFP',
		// 		data: '["158d000223a9d5","158d00020261a2","158d000202625d","158d0001e65556","158d0001fa67a6"]'
		// 	}, '127.0.0.1', serverPort);
		// }, 1000);
	}
}

MiServer.prototype.initServerSocket = function() {
	// message
	//		cmd: 'heartbeat'
	//		model: 'gateway'
	//		sid: '7811dcb26145',
	//		short_id: '0',
	//		token: '1PW6Mr7msMzACESX'
	//		data: {}
	// from
	//		address: '192.168.188.103'
	//		family: 'IPv4'
	//		port: 4321
	//		size: 138
	serverSocket.on('message', (message, from) => {
		// parse mi message to json object
		let data = {};
		try {
			data = JSON.parse(message);
		} catch(err) {
			this.log.error(`socket message error: ${message}`);
			return;
		}
		this.log('\x1b[34m[recv]\x1b[0m', data, from);

		// get accessory from cache
		let accessory = accessorys[data.sid];

		// create new accessory and inhert unkown model gateway
		if (accessory && accessory.model == 'unkown') {
			if (accessory.gateway) {
				accessory = new models[data.model](data, accessory.gateway);
				accessorys[data.sid] = accessory;
			} else {
				this.log.warn(`${data.model}(${data.sid}) cannot get unkown model gateway`);
			}
		}

		// create new gateway
		if (!accessory && data.model == 'gateway') {
			accessory = new Gateway(data, this);
			accessorys[data.sid] = accessory;
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
		this.log(`server is listening on ${serverSocket.address().address}:${serverSocket.address().port}`);
		serverSocket.addMembership(multicastAddress);
	});

	serverSocket.bind(serverPort);
}

MiServer.prototype.send = function(message, ip, port) {
	this.log('\x1b[31m[send]\x1b[0m', message, ip, port);
	let strMsg = JSON.stringify(message);
	serverSocket.send(strMsg, 0, strMsg.length, port, ip);
}

module.exports = MiServer;