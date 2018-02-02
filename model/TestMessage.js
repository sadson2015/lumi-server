'use strict';

class TestMessage {
	constructor(server, serverPort) {
		// Test Message
		server.send({
			cmd: 'iam',
			port: '9898',
			sid: '7811dcb26145',
			model: 'gateway',
			ip: '192.168.188.102'
		}, '127.0.0.1', serverPort);

		setTimeout(() => {
			server.send({
				cmd: 'get_id_list_ack',
				sid: '7811dcb26145',
				token: 'NTnN5noiIDi8JnFP',
				data: '["158d000223a9d5","158d00020261a2","158d000202625d","158d0001e65556","158d0001fa67a6"]'
			}, '127.0.0.1', serverPort);
		}, 1000);

		setTimeout(() => {
			server.send({ cmd: 'read_ack',
				model: 'motion',
				sid: '158d000223a9d5',
				short_id: 14674,
				data: '{"voltage":3025}'
			}, '127.0.0.1', serverPort);

			server.send({ cmd: 'read_ack',
				model: 'magnet',
				sid: '158d00020261a2',
				short_id: 9370,
				data: '{"voltage":3025,"status":"close"}'
			}, '127.0.0.1', serverPort);

			server.send({ cmd: 'read_ack',
				model: 'magnet',
				sid: '158d000202625d',
				short_id: 55256,
				data: '{"voltage":2995,"status":"close"}'
			}, '127.0.0.1', serverPort);

			server.send({ cmd: 'read_ack',
				model: 'switch',
				sid: '158d0001e65556',
				short_id: 39401,
				data: '{"voltage":3032}'
			}, '127.0.0.1', serverPort);

			server.send({ cmd: 'read_ack',
				model: 'plug',
				sid: '158d0001fa67a6',
				short_id: 13137,
				data: '{"voltage":3600,"status":"on","inuse":"1","power_consumed":"13217","load_power":"14.00"}'
			}, '127.0.0.1', serverPort);
		}, 2000);

		setInterval(() => {
			server.send({ cmd: 'heartbeat',
				model: 'gateway',
				sid: '7811dcb26145',
				short_id: '0',
				token: 'bYYm5bS8baEspJVx',
				data: '{"ip":"127.0.0.1"}'
			}, '127.0.0.1', serverPort);
		}, 5000);
	}
}

module.exports = TestMessage;