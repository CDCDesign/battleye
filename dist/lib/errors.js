"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketOverflow = exports.PacketError = exports.InvalidSequence = exports.InvalidPacket = exports.InvalidPassword = exports.ServerDisconnect = exports.ServerTimeout = exports.UnsupportedPacketType = exports.UnknownPacketType = exports.UnknownCommand = exports.MaxRetries = exports.UnknownConnection = exports.ConnectionExists = exports.NoCommand = exports.NoPassword = exports.NoConnection = void 0;
/**
 * NoConnection
 *
 * @export
 * @class NoConnection
 * @extends {Error}
 */
class NoConnection extends Error {
    constructor() { super('Not connected'); }
}
exports.NoConnection = NoConnection;
/**
 * NoPassword
 *
 * @export
 * @class NoPassword
 * @extends {Error}
 */
class NoPassword extends Error {
    constructor() { super('No password provided'); }
}
exports.NoPassword = NoPassword;
/**
 * NoCommand
 *
 * @export
 * @class NoCommand
 * @extends {Error}
 */
class NoCommand extends Error {
    constructor() { super('No command provided'); }
}
exports.NoCommand = NoCommand;
/**
 * ConnectionExists
 *
 * @export
 * @class ConnectionExists
 * @extends {Error}
 */
class ConnectionExists extends Error {
    constructor() { super('A connection with that IP/Port already exists'); }
}
exports.ConnectionExists = ConnectionExists;
/**
 * UnknownConnection
 *
 * @export
 * @class UnknownConnection
 * @extends {Error}
 */
class UnknownConnection extends Error {
    constructor(id, ip, port) { super(`Unknown server: ${id} ${ip !== undefined && port !== undefined ? `(${ip}:${port})` : ''}`); }
}
exports.UnknownConnection = UnknownConnection;
/**
 * UnknownCommand
 *
 * @export
 * @class UnknownCommand
 * @extends {Error}
 */
class MaxRetries extends Error {
    constructor() { super('Maximum amount of retries exceeded'); }
}
exports.MaxRetries = MaxRetries;
/**
 * UnknownCommand
 *
 * @export
 * @class UnknownCommand
 * @extends {Error}
 */
class UnknownCommand extends Error {
    constructor(cmd) { super(`Unknown command: '${cmd}'`); }
}
exports.UnknownCommand = UnknownCommand;
/**
 * UnknownPacketType
 *
 * @export
 * @class UnknownPacketType
 * @extends {Error}
 */
class UnknownPacketType extends Error {
    constructor(type) { super(`Unknown packet type: '${type}'`); }
}
exports.UnknownPacketType = UnknownPacketType;
/**
 * UnsupportedPacketType
 *
 * @export
 * @class UnsupportedPacketType
 * @extends {Error}
 */
class UnsupportedPacketType extends Error {
    constructor(type) { super(`Unsupported packet type: '${type}'`); }
}
exports.UnsupportedPacketType = UnsupportedPacketType;
/**
 * ServerTimeout
 *
 * @export
 * @class ServerTimeout
 * @extends {Error}
 */
class ServerTimeout extends Error {
    constructor() { super('Server connection timed out'); }
}
exports.ServerTimeout = ServerTimeout;
/**
 * ServerDisconnect
 *
 * @export
 * @class ServerDisconnect
 * @extends {Error}
 */
class ServerDisconnect extends Error {
    constructor() { super('Server was manually disconnected'); }
}
exports.ServerDisconnect = ServerDisconnect;
/**
 * InvalidPassword
 *
 * @export
 * @class InvalidPassword
 * @extends {Error}
 */
class InvalidPassword extends Error {
    constructor() { super('Server password is invalid'); }
}
exports.InvalidPassword = InvalidPassword;
/**
 * InvalidPacket
 *
 * @export
 * @class InvalidPacket
 * @extends {Error}
 */
class InvalidPacket extends Error {
    constructor() { super('Packet is not valid'); }
}
exports.InvalidPacket = InvalidPacket;
/**
 * InvalidSequence
 *
 * @export
 * @class InvalidSequence
 * @extends {Error}
 */
class InvalidSequence extends Error {
    constructor(sequence) { super(`Invalid sequence number: #${sequence}`); }
}
exports.InvalidSequence = InvalidSequence;
/**
 * PacketError
 *
 * @export
 * @class PacketError
 * @extends {Error}
 */
class PacketError extends Error {
    constructor(message) { super(`Packet Error: ${message}`); }
}
exports.PacketError = PacketError;
/**
 * PacketOverflow
 *
 * @export
 * @class PacketOverflow
 * @extends {Error}
 */
class PacketOverflow extends Error {
    constructor(store) {
        super('Packet Overflow Occurred');
        this.store = store;
    }
}
exports.PacketOverflow = PacketOverflow;
//# sourceMappingURL=errors.js.map