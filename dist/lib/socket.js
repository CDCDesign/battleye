"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const dgram = require("dgram");
const events_1 = require("events");
const utils = require("./utils");
const connection_1 = require("./connection");
const errors_1 = require("./errors");
const packet_1 = require("./packet");
/**
 * UDP Socket for battleye rcon server to communicate with
 *
 * @export
 * @class Socket
 * @extends {emitter}
 * @implements {ISocket}
 */
class Socket extends events_1.EventEmitter {
    /**
     * Creates an instance of Socket.
     * @param {ISocketOptions} [options={}]
     * @memberof Socket
     */
    constructor(options = {}) {
        super();
        this.options = Object.assign({ port: 2310, ip: '0.0.0.0' }, options);
        const { port, ip } = this.options;
        this.connections = {};
        this.info = {
            listening: false
        };
        this.socket = dgram.createSocket({
            type: 'udp4'
        }, this.receive.bind(this)); // tslint:disable-line:no-unsafe-any
        this.socket.on('error', (err) => {
            this.emit('error', err);
            this.socket.close(() => {
                for (const id of Object.keys(this.connections)) {
                    const connection = this.connections[id];
                    if (connection instanceof connection_1.Connection) {
                        connection.kill(err);
                    }
                }
            });
        });
        this.socket.on('listening', () => {
            this.info.listening = true;
            this.emit('listening', this.socket);
        });
        this.socket.bind({
            address: ip,
            port,
            exclusive: true
        });
    }
    /**
     * creates a new connection
     *
     * @param {IConnectionDetails} details
     * @param {IConnectionOptions} [options={}]
     * @param {boolean} [connect=true]
     * @returns {Connection}
     * @memberof Socket
     */
    connection(details, options = {}, connect = true) {
        const conn = new connection_1.Connection(this, details, options);
        if (this.connections[conn.id] !== undefined) {
            throw new errors_1.ConnectionExists();
        }
        if (connect) {
            if (this.listening) {
                conn.connect().catch((e) => {
                    this.emit('error', e);
                });
            }
            else {
                this.socket.once('listening', () => {
                    conn.connect().catch((e) => {
                        this.emit('error', e);
                    });
                });
            }
        }
        this.connections[conn.id] = conn;
        return conn;
    }
    /**
     * receive packet from a connection and route packet to appropriate connection
     *
     * @param {Buffer} buffer
     * @param {dgram.RemoteInfo} info
     * @memberof Socket
     */
    receive(buffer, info) {
        const id = utils.hashAddress(info.address, info.port);
        const connection = this.connections[id];
        if (!(connection instanceof connection_1.Connection)) {
            this.emit('error', new errors_1.UnknownConnection(id, info.address, info.port));
            return;
        }
        let packet;
        try {
            packet = packet_1.Packet.FROM(buffer);
        }
        catch (e) {
            this.emit('error', e);
            connection.emit('error', e);
            return;
        }
        if (!packet.valid) {
            this.emit('error', new errors_1.InvalidPacket());
            connection.emit('error', new errors_1.InvalidPacket());
            return;
        }
        const resolved = connection.recieve(packet);
        this.emit('received', resolved, packet, buffer, connection, info);
        connection.emit('received', resolved, packet, buffer, info);
    }
    /**
     * send packet to connection
     *
     * @param {Connection} connection
     * @param {Packet} packet
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Socket
     */
    send(connection, packet, resolve = true) {
        return new Promise((res, rej) => {
            if (!(packet instanceof packet_1.Packet)) {
                return rej(new TypeError('packet must be an instance of BEPacket'));
            }
            if (!packet.valid) {
                return rej(new errors_1.InvalidPacket());
            }
            if (!(connection instanceof connection_1.Connection)) {
                return rej(new TypeError('connection must be an instance of Connection'));
            }
            if (packet.type === packet_1.PacketType.Command && packet.sequence < 0) {
                packet.sequence = connection.sequence;
            }
            let buffer;
            try {
                buffer = packet.serialize();
            }
            catch (e) {
                return rej(e); // tslint:disable-line:no-unsafe-any
            }
            this.socket.send(buffer, 0, buffer.length, connection.port, connection.ip, (err, bytes) => {
                if (err !== null) {
                    return rej(err);
                }
                this.emit('sent', packet, buffer, bytes, connection);
                if (resolve) {
                    try {
                        connection.store({
                            packet,
                            bytes,
                            resolve: res,
                            reject: rej
                        });
                    }
                    catch (e) {
                        return rej(e); // tslint:disable-line:no-unsafe-any
                    }
                }
                else {
                    return res({
                        bytes,
                        sent: packet,
                        received: undefined,
                        connection
                    });
                }
            });
        });
    }
    /**
     * UDP socket is listening
     *
     * @readonly
     * @type {boolean}
     * @memberof Socket
     */
    get listening() {
        return this.info.listening;
    }
}
exports.Socket = Socket;
//# sourceMappingURL=socket.js.map