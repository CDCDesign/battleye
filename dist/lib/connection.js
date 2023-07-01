"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const utils = require("./utils");
const events_1 = require("events");
const timers_1 = require("timers");
const errors_1 = require("./errors");
const packet_1 = require("./packet");
/**
 * Connection to battleye rcon server
 *
 * @export
 * @class Connection
 * @extends {emitter}
 * @implements {IConnection}
 */
class Connection extends events_1.EventEmitter {
    /**
     * Creates an instance of Connection.
     *
     * @param {Socket} socket
     * @param {IConnectionDetails} details
     * @param {IConnectionOptions} [options={}]
     * @memberof Connection
     */
    constructor(socket, details, options = {}) {
        super();
        const { name, ip, port, password } = details;
        this.info = {
            name,
            id: utils.hashAddress(ip, port),
            ip,
            password,
            port,
            sent: 0,
            received: 0,
            sequence: -1,
            connected: false
        };
        this.socket = socket;
        this.packets = new Array(255);
        this.multipart = new Array(255);
        for (let i = 0; i < 255; i++) {
            this.multipart[i] = [];
        }
        this.options = Object.assign({ reconnect: true, reconnectTimeout: 500, keepAlive: true, keepAliveInterval: 15000, timeout: true, timeoutInterval: 1000, serverTimeout: 30000, packetTimeout: 1000, packetTimeoutThresholded: 5 }, options);
    }
    /**
     * connect to the connection
     *
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    connect() {
        if (!this.socket.listening) {
            throw new errors_1.NoConnection();
        }
        if (this.connected) {
            this.disconnect();
        }
        this.setup();
        return this.send(new packet_1.Packet(packet_1.PacketType.Login, packet_1.PacketDirection.Request, { password: this.info.password }));
    }
    /**
     * sends a command packet to connection
     *
     * @param {string} command
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    command(command, resolve = true) {
        if (!this.socket.listening || !this.connected) {
            throw new errors_1.NoConnection();
        }
        return this.send(new packet_1.Packet(packet_1.PacketType.Command, packet_1.PacketDirection.Request, { command }), resolve);
    }
    /**
     * sends a packet to connection
     *
     * @param {Packet} packet
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    send(packet, resolve = true) {
        return this.socket.send(this, packet, resolve);
    }
    /**
     * stores command Promise
     *
     * @param {IPacketPromise} store
     * @memberof Connection
     */
    store(store) {
        switch (store.packet.type) {
            case packet_1.PacketType.Login:
                if (this.packets[0] !== undefined) {
                    throw new errors_1.PacketOverflow(store);
                }
                this.packets[0] = store;
                break;
            case packet_1.PacketType.Command:
                if (this.packets[store.packet.sequence] !== undefined) {
                    throw new errors_1.PacketOverflow(store);
                }
                this.packets[store.packet.sequence] = store;
                break;
            default:
                throw new errors_1.UnknownPacketType(store.packet.type);
        }
    }
    recieve(packet) {
        return __awaiter(this, void 0, void 0, function* () {
            this.info.lastPacket = packet;
            if (packet.direction === packet_1.PacketDirection.Split) { // handle multipart packets
                if (this.multipart[packet.sequence].length === 0) {
                    this.multipart[packet.sequence] = new Array(packet.get('total'));
                }
                this.multipart[packet.sequence][packet.get('index')] = packet;
                if ((packet.get('index') + 1) === packet.get('total')) {
                    try {
                        let valid = true;
                        let buff = Buffer.alloc(0);
                        for (const p of this.multipart[packet.sequence]) {
                            if (p instanceof packet_1.Packet) {
                                buff = Buffer.concat([buff, p.get('part')], p.get('part').length + buff.length);
                            }
                            else {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            this.multipart[packet.sequence] = [];
                            return this.resolve(new packet_1.Packet(packet_1.PacketType.Command, packet_1.PacketDirection.Reply, { data: buff.toString(), sequence: packet.sequence }));
                        }
                        const resend = this.packets[packet.sequence];
                        if (resend && resend.packet) { // resend packet
                            if (resend.packet.sent >= 5) {
                                yield this.send(resend.packet, false);
                            }
                            else {
                                return this.resolve(new packet_1.Packet(packet_1.PacketType.Command, packet_1.PacketDirection.Reply, { error: new errors_1.MaxRetries(), sequence: packet.sequence }));
                            }
                        }
                    }
                    catch (err) {
                        return this.resolve(new packet_1.Packet(packet_1.PacketType.Command, packet_1.PacketDirection.Reply, { error: err, sequence: packet.sequence }));
                    }
                }
                return false;
            }
            return this.resolve(packet);
        });
    }
    /**
     * resolves Promise from packet reply
     *
     * @param {Packet} packet
     * @returns {boolean}
     * @memberof Connection
     */
    resolve(packet) {
        let resolved = false;
        let store;
        switch (packet.type) {
            case packet_1.PacketType.Login:
                store = this.packets[0]; // eslint-disable-line
                this.info.connected = packet.get('login');
                if (store !== undefined) {
                    if (this.connected) {
                        store.resolve({
                            connected: true,
                            bytes: store.bytes,
                            sent: store.packet,
                            received: packet,
                            connection: this
                        });
                    }
                    else {
                        store.reject(new errors_1.InvalidPassword());
                    }
                    resolved = true;
                    this.packets[0] = undefined;
                }
                if (this.connected) {
                    this.emit('connected');
                }
                else {
                    this.disconnect(new errors_1.InvalidPassword());
                }
                break;
            case packet_1.PacketType.Command:
                store = this.packets[packet.sequence];
                if (store !== undefined) {
                    if (packet.get('error')) {
                        store.reject(store.packet.get('error'));
                    }
                    else if (packet.get('data') === 'Unknown command') {
                        store.reject(new errors_1.UnknownCommand(store.packet.get('command')));
                    }
                    else {
                        store.resolve({
                            command: store.packet.get('command'),
                            data: packet.get('data'),
                            bytes: store.bytes,
                            sent: store.packet,
                            received: packet,
                            connection: this
                        });
                    }
                    resolved = true;
                    this.packets[packet.sequence] = undefined;
                }
                if (packet.get('data')) {
                    this.emit('command', packet.get('data'), resolved, packet);
                }
                break;
            case packet_1.PacketType.Message:
                this.emit('message', packet.get('message'), packet);
                this
                    .send(new packet_1.Packet(packet_1.PacketType.Message, packet_1.PacketDirection.Reply, { sequence: packet.sequence }), false)
                    .catch((e) => { this.emit('error', e); });
                break;
            default:
                this.emit('error', new errors_1.UnknownPacketType(packet.type));
        }
        return resolved;
    }
    /**
     * returns weather or not connection is active
     *
     * @readonly
     * @type {boolean}
     * @memberof Connection
     */
    get connected() {
        return this.info.connected;
    }
    /**
     * returns connection id
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get id() {
        return this.info.id;
    }
    /**
     * returns connection name
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get name() {
        return this.info.name;
    }
    /**
     * returns connection ip
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get ip() {
        return this.info.ip;
    }
    /**
     * returns connection port
     *
     * @readonly
     * @type {number}
     * @memberof Connection
     */
    get port() {
        return this.info.port;
    }
    /**
     * kill connection
     *
     * @param {Error} reason
     * @memberof Connection
     */
    kill(reason) {
        this.emit('error', reason);
        this.disconnect(reason);
    }
    /**
     * set's up timers for keep alive and timeouts
     *
     * @private
     * @memberof Connection
     */
    setup() {
        const { keepAlive, keepAliveInterval, timeout, timeoutInterval, serverTimeout, packetTimeout, packetTimeoutThresholded } = this.options;
        if (keepAlive === true) {
            this.keepAlive = setInterval(() => {
                if (this.connected) {
                    this
                        .command('')
                        .then(({ sent, received }) => {
                        if (received && received.timestamp && sent.timestamp) {
                            this.emit('debug', `ping: ${this.ip}:${this.port} ${(received.timestamp - sent.timestamp)}ms`);
                        }
                    })
                        .catch((e) => { this.emit('error', e); });
                }
            }, keepAliveInterval);
        }
        if (timeout === true) {
            this.timeout = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const time = new Date().getTime();
                    const { lastPacket } = this.info;
                    if (lastPacket && lastPacket.timestamp) {
                        if (time - lastPacket.timestamp >= serverTimeout) {
                            this.disconnect(new errors_1.ServerTimeout());
                            return;
                        }
                    }
                    for (const p of this.packets) {
                        if (p !== undefined && p.packet instanceof packet_1.Packet) {
                            const { timestamp, sent, type, sequence } = p.packet;
                            if (timestamp && time - timestamp >= sent * packetTimeout) {
                                yield this.send(p.packet, false);
                            }
                            else if (sent >= packetTimeoutThresholded) {
                                this.resolve(new packet_1.Packet(type, packet_1.PacketDirection.Reply, { error: new errors_1.ServerTimeout(), sequence }));
                            }
                        }
                    }
                }
                catch (err) {
                    this.emit('error', err);
                }
            }), timeoutInterval);
        }
    }
    /**
     * returns connection packet sequence
     *
     * @readonly
     * @type {number}
     * @memberof Connection
     */
    get sequence() {
        if (this.info.sequence >= 255) {
            this.info.sequence = -1;
        }
        return this.info.sequence = this.info.sequence + 1;
    }
    /**
     * disconnects from connection
     *
     * @param {Error} [reason=new ServerDisconnect()]
     * @memberof Connection
     */
    disconnect(reason = new errors_1.ServerDisconnect()) {
        this.cleanup(reason);
        this.emit('disconnected', reason);
        const { reconnect, reconnectTimeout } = this.options;
        if (reconnect && (reason instanceof errors_1.ServerTimeout)) {
            const timeout = setTimeout(() => {
                timers_1.clearTimeout(timeout);
                this
                    .connect()
                    .catch((e) => {
                    this.emit('error', e);
                });
            }, reconnectTimeout);
        }
    }
    /**
     * cleans up unresolved promises and resets connection
     *
     * @private
     * @param {Error} error
     * @memberof Connection
     */
    cleanup(error) {
        if (this.timeout) {
            timers_1.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (this.keepAlive) {
            timers_1.clearTimeout(this.keepAlive);
            this.keepAlive = undefined;
        }
        for (const packet of this.packets) {
            if (packet !== undefined) {
                packet.reject(error);
            }
        }
        this.info.sent = 0;
        this.info.received = 0;
        this.info.sequence = -1;
        this.info.connected = false;
        this.packets = new Array(255);
        this.multipart = new Array(255);
        for (let i = 0; i < 255; i++) {
            this.multipart[i] = [];
        }
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map