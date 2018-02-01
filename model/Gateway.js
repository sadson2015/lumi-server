'use strict';

const ModelBase = require('./ModelBase');

const crypto = require('crypto');
const iv = Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);

// private variables
const __ = {};

class Gateway extends ModelBase {
	constructor(data, server) {
		super(data);
		__[this.__oid] = {};
		__[this.__oid].server = server;
	}

	get gateway() {
		return this;
	}

	get data() {
		return __[this.__oid].data || {};
	}

	get children() {
		return __[this.__oid].children;
	}

	send(message) {
		if (message.cmd == 'write') {
			message.data.key = signKey(
				this.sid,
				this.token,
				this.server.password(this.sid)
			);
		}

		__[this.__oid].server.send(
			message,
			__[this.__oid].ip,
			__[this.__oid].port
		);
	}

	rgb(red, green, blue, brightness) {
		// get brightness, inherit current brightness, default 100%(255)
		brightness = brightness || this.data.rgb >> 24 || 255;

		this.write({
			rgb:	brightness * Math.pow(16, 6)	+
					red * Math.pow(16, 4) 			+
					green * Math.pow(16, 2) 		+
					blue,
		});
	}

	getIdList() {
		this.send({
			cmd: 'get_id_list'
		});
	}

	// recv cmd handlers
	iam(data, from) {
		__[this.__oid].ip = data.ip;
		__[this.__oid].port = data.port;
		this.getIdList();
	}

	heartbeat(data, from) {
		this.token = data.token;

		// this.rgb(Math.random()*255, Math.random()*255, Math.random()*255);
	}

	getIdListAck(data, from) {
		this.token = data.token;

		// gateway and sub accessorys
		let ids = JSON.parse(data.data);
		__[this.__oid].children = ids;

		this.read();

		for (let i=0; i < ids.length; i++) {
			let model = new UnkownModel({
				sid: ids[i],
				model: 'unkown',
			}, this);

			__[this.__oid].server.addAccessory(model);
			model.read();
		}
	}

	readAck(data, from) {
		__[this.__oid].data = data;
	}

	writeAck(data, from) {
		__[this.__oid].data = data;
	}

	report(data, from) {
		__[this.__oid].data = data;
	}
}

let signKey = function(sid, token, password) {
	let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(password), iv);
    let key = cipher.update(token, 'ascii', 'hex');
    cipher.final('hex');
    
    return key;
}

class UnkownModel extends ModelBase {

}

module.exports = Gateway;