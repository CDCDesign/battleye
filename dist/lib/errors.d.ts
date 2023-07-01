import { IPacketPromise } from './connection';
/**
 * NoConnection
 *
 * @export
 * @class NoConnection
 * @extends {Error}
 */
export declare class NoConnection extends Error {
    constructor();
}
/**
 * NoPassword
 *
 * @export
 * @class NoPassword
 * @extends {Error}
 */
export declare class NoPassword extends Error {
    constructor();
}
/**
 * NoCommand
 *
 * @export
 * @class NoCommand
 * @extends {Error}
 */
export declare class NoCommand extends Error {
    constructor();
}
/**
 * ConnectionExists
 *
 * @export
 * @class ConnectionExists
 * @extends {Error}
 */
export declare class ConnectionExists extends Error {
    constructor();
}
/**
 * UnknownConnection
 *
 * @export
 * @class UnknownConnection
 * @extends {Error}
 */
export declare class UnknownConnection extends Error {
    constructor(id: string, ip: string, port: number);
}
/**
 * UnknownCommand
 *
 * @export
 * @class UnknownCommand
 * @extends {Error}
 */
export declare class MaxRetries extends Error {
    constructor();
}
/**
 * UnknownCommand
 *
 * @export
 * @class UnknownCommand
 * @extends {Error}
 */
export declare class UnknownCommand extends Error {
    constructor(cmd: string);
}
/**
 * UnknownPacketType
 *
 * @export
 * @class UnknownPacketType
 * @extends {Error}
 */
export declare class UnknownPacketType extends Error {
    constructor(type: number);
}
/**
 * UnsupportedPacketType
 *
 * @export
 * @class UnsupportedPacketType
 * @extends {Error}
 */
export declare class UnsupportedPacketType extends Error {
    constructor(type: number);
}
/**
 * ServerTimeout
 *
 * @export
 * @class ServerTimeout
 * @extends {Error}
 */
export declare class ServerTimeout extends Error {
    constructor();
}
/**
 * ServerDisconnect
 *
 * @export
 * @class ServerDisconnect
 * @extends {Error}
 */
export declare class ServerDisconnect extends Error {
    constructor();
}
/**
 * InvalidPassword
 *
 * @export
 * @class InvalidPassword
 * @extends {Error}
 */
export declare class InvalidPassword extends Error {
    constructor();
}
/**
 * InvalidPacket
 *
 * @export
 * @class InvalidPacket
 * @extends {Error}
 */
export declare class InvalidPacket extends Error {
    constructor();
}
/**
 * InvalidSequence
 *
 * @export
 * @class InvalidSequence
 * @extends {Error}
 */
export declare class InvalidSequence extends Error {
    constructor(sequence: number);
}
/**
 * PacketError
 *
 * @export
 * @class PacketError
 * @extends {Error}
 */
export declare class PacketError extends Error {
    constructor(message: string);
}
/**
 * PacketOverflow
 *
 * @export
 * @class PacketOverflow
 * @extends {Error}
 */
export declare class PacketOverflow extends Error {
    store: IPacketPromise;
    constructor(store: IPacketPromise);
}
