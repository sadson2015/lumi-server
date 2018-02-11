'use strict';

const { EventEmitter } = require('events');
const debug = require('debug');

const log = Symbol('log');

module.exports = class extends EventEmitter {
	constructor(logger) {
		super();
		this[log] = logger || console;
	}

	on(...args) {
		super.on.apply(this, args);
		return this;
	}

	emit(...args) {
		super.emit.apply(this, args);
		return this;
	}

	get logPrefix() {
		return ['lumi-server'];
	}

	info(...args) {
		this[log].info.apply(this, ['[INFO]', this.logPrefix.join(':')].concat(args));
		return this;
	}

	log(...args) {
		return this.info(args);
	}

	warn(...args) {
		this[log].warn.apply(this, ['[WARN]', this.logPrefix.join(':')].concat(args));
		return this;
	}

	error(...args) {
		this[log].error.apply(this, ['[ERROR]', this.logPrefix.join(':')].concat(args));
		return this;
	}

	debug(...args) {
		debug(this.logPrefix.join(':')).apply(this, [].concat(args));
		return this;
	}
}