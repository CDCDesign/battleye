"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = exports.PacketDirection = exports.PacketType = void 0;
const crc32_1 = require("./crc32");
const errors_1 = require("./errors");
var PacketType;
(function (PacketType) {
    PacketType[PacketType["Login"] = 0] = "Login";
    PacketType[PacketType["Command"] = 1] = "Command";
    PacketType[PacketType["Message"] = 2] = "Message";
})(PacketType = exports.PacketType || (exports.PacketType = {}));
var PacketDirection;
(function (PacketDirection) {
    PacketDirection[PacketDirection["Request"] = 0] = "Request";
    PacketDirection[PacketDirection["Reply"] = 1] = "Reply";
    PacketDirection[PacketDirection["Split"] = 2] = "Split";
})(PacketDirection = exports.PacketDirection || (exports.PacketDirection = {}));
/**
 * Packet class
 *
 * @export
 * @class Packet
 */
class Packet {
    /**
     * Creates an instance of Packet.
     *
     * @param {PacketType} type
     * @param {PacketDirection} direction
     * @param {IPacketAttributes} [attributes={}]
     * @memberof Packet
     */
    constructor(type, direction, attributes = {}) {
        this.info = {
            type,
            direction
        };
        this.clear();
        this.attributes = Object.assign({}, attributes);
    }
    /**
     * copies packet from another packet
     *
     * @static
     * @param {Packet} packet
     * @returns {Packet}
     * @memberof Packet
     */
    static COPY(packet) {
        return new Packet(packet.type, packet.direction, Object.assign({}, packet.attributes));
    }
    /**
     * creates packet from buffer
     *
     * @static
     * @param {Buffer} buffer
     * @returns {Packet}
     * @memberof Packet
     */
    static FROM(buffer) {
        const { length } = buffer;
        if (length < 9) {
            throw new errors_1.PacketError('Packet must contain at least 9 bytes');
        }
        const header = buffer.toString('utf8', 0, 2);
        if (header !== 'BE') {
            throw new errors_1.PacketError('Invalid header text');
        }
        const payload = buffer.slice(6, length);
        const checksum = buffer.readInt32BE(2);
        const crc = crc32_1.crc32(payload).readInt32LE(0);
        if (checksum !== crc) {
            throw new errors_1.PacketError('Packet checksum verification failed.');
        }
        if (payload.readUInt8(0) !== 0xFF) {
            throw new errors_1.PacketError('Packet missing 0xFF flag after checksum.');
        }
        const type = payload.readUInt8(1);
        const attributes = {};
        let direction = PacketDirection.Reply;
        switch (type) {
            case PacketType.Login:
                attributes.login = (payload.readUInt8(2) === 1);
                break;
            case PacketType.Command:
                attributes.sequence = payload.readUInt8(2);
                if (payload.length > 4 && payload.readUInt8(3) === 0) { // multipart packet
                    attributes.total = payload.readUInt8(4);
                    attributes.index = payload.readUInt8(5);
                    attributes.part = payload.slice(6, payload.length);
                    direction = PacketDirection.Split;
                }
                else {
                    attributes.data = payload.slice(3, payload.length).toString();
                }
                break;
            case PacketType.Message:
                attributes.sequence = payload.readUInt8(2);
                attributes.message = payload.slice(3, payload.length).toString();
                break;
            default:
                throw new errors_1.UnknownPacketType(type);
        }
        return new Packet(type, direction, attributes);
    }
    get(key) {
        return this.attributes[key];
    }
    set(key, value) {
        this.attributes[key] = value;
        return this;
    }
    /**
     * check if packet has attribute
     *
     * @param {string} key
     * @returns {boolean}
     * @memberof Packet
     */
    has(key) {
        return typeof this.attributes[key] !== 'undefined';
    }
    /**
     * clear attributes of packet
     *
     * @returns {Packet}
     * @memberof Packet
     */
    clear() {
        this.attributes = {};
        this.attributes.timestamp = new Date().getTime(); // new timestamp
        if (this.direction === PacketDirection.Request) {
            this.attributes.sent = 0;
        }
        return this;
    }
    /**
     * packet type
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get type() {
        return this.info.type;
    }
    /**
     * packet direction
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get direction() {
        return this.info.direction;
    }
    /**
     * timestamp of packet creation
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get timestamp() {
        return this.attributes.timestamp;
    }
    /**
     * number of times packet was serialized for sending
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get sent() {
        return typeof this.attributes.sent === 'number' ? this.attributes.sent : 0;
    }
    /**
     * packet sequence
     *
     * @type {number}
     * @memberof Packet
     */
    get sequence() {
        return typeof this.attributes.sequence === 'number' ? this.attributes.sequence : -1;
    }
    /**
     * packet sequence
     *
     * @memberof Packet
     */
    set sequence(sequence) {
        if (sequence < 0 || sequence > 255) {
            throw new errors_1.InvalidSequence(sequence);
        }
        this.attributes.sequence = sequence;
    }
    /**
     * check if packet is valid
     *
     * @readonly
     * @memberof Packet
     */
    get valid() {
        return (Number.isInteger(this.type) && Number.isInteger(this.direction));
    }
    /**
     * serialize packet to be sent to battleye
     *
     * @returns {Buffer}
     * @memberof Packet
     */
    serialize() {
        if (!this.valid) {
            throw new errors_1.InvalidPacket();
        }
        let payload;
        switch (this.type) {
            case PacketType.Login:
                if (!this.has('password')) {
                    throw new errors_1.NoPassword();
                }
                const password = this.get('password');
                payload = Buffer.alloc(password.length + 2);
                payload.writeUInt8(0xFF, 0);
                payload.writeUInt8(this.type, 1);
                payload.write(password, 2);
                break;
            case PacketType.Command:
                if (!this.has('command')) {
                    throw new errors_1.NoCommand();
                }
                const cmd = this.get('command');
                payload = Buffer.alloc(cmd.length + 3);
                payload.writeUInt8(0xFF, 0);
                payload.writeUInt8(this.type, 1);
                payload.writeUInt8(this.sequence, 2);
                payload.write(cmd, 3);
                break;
            case PacketType.Message:
                payload = Buffer.alloc(3);
                payload.writeUInt8(0xFF, 0);
                payload.writeUInt8(this.type, 1);
                payload.writeUInt8(this.sequence, 2);
                break;
            default:
                throw new errors_1.UnknownPacketType(this.type);
        }
        const crc = crc32_1.crc32(payload);
        const header = Buffer.from([0x42, 0x45, 0x00, 0x00, 0x00, 0x00]);
        header.writeInt32BE(crc.readInt32LE(0), 2);
        this.attributes.sent = this.attributes.sent ? this.attributes.sent + 1 : 1;
        return Buffer.concat([header, payload], header.length + payload.length);
    }
}
exports.Packet = Packet;
//# sourceMappingURL=packet.js.map