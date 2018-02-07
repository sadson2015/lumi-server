'use strict';

const ModelBase = require('./ModelBase');

const crypto = require('crypto');
const iv = Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);

class Gateway extends ModelBase {
	constructor(data, server) {
		super(data);
		this.server = server;
		this.children = [];
	}

	send(message) {
		if (message.cmd == 'write') {
			message.data.key = signKey(
				this.sid,
				this.token,
				this.server.password[this.sid],
			);
		}

		this.server.send(
			message,
			this.ip,
			this.port
		);
	}

	// attributes
	async rgbb(...args) {
		let result = await this.attr('rgb', args,
			function (red, green, blue, brightness) {
				// get brightness, inherit current brightness, default 100%(255)
				brightness = brightness || this.data.rgb >> 24 || 255;

				return	brightness * Math.pow(16, 6)	+
						red * Math.pow(16, 4) 			+
						green * Math.pow(16, 2) 		+
						blue
			});

		if (args.length) {
			return result;
		} else {
			return {
				red: result % 256,
				green: (result >> 8) % 256,
				blue: (result >> 16) % 256,
				brightness: Math.round((result >> 24) % 256 / 255 * 100) / 100,
			};
		}
	}

	async rgb(...args) {
		let result;
		if (!args.length) {
			result = await this.rgbb();
			delete result.brightness;
			return result;
		} else {
			result = await this.rgbb.apply(this, args);

			return result;
		}
	}

	async brightness(...args) {
		let result;

		if (!args.length) {
			result = await this.rgbb();
			return result.brightness;
		} else {
			let rgb = [	this.data.rgb % 256,
						this.data.rgb >> 8 % 256,
						this.data.rgb >> 16 %256];
			result = await this.rgbb.apply(this, rgb.concat(args[0]));

			return result;
		}
	}

	getIdList() {
		this.send({
			cmd: 'get_id_list'
		});
	}

	// recv cmd handlers
	iam(data, from) {
		this.ip = data.ip;
		this.port = data.port;
		this.getIdList();
	}

	heartbeat(data, from) {
		this.token = data.token;
		this.emit('heartbeat', data);
	}

	getIdListAck(data, from) {
		this.token = data.token;

		// gateway and sub accessorys
		let ids = data.data;
		this.children = ids;

		this.read();

		for (let i=0; i < ids.length; i++) {
			let model = new UnkownModel({
				sid: ids[i],
				model: 'unkown',
			}, this);

			this.server.addAccessory(model);
			model.read();
		}
	}

	setData(data, cmd) {
		if (cmd != 'heartbeat') {
			this.data = data;
			return true;
		} else {
			return false;
		}
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