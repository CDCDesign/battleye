/// <reference types="node" />
import * as dgram from 'dgram';
import { EventEmitter } from 'events';
import { Connection, IConnectionDetails, IConnectionOptions, IPacketResponse } from './connection';
import { Packet } from './packet';
export interface ISocketOptions {
    port?: number;
    ip?: string;
}
export declare interface Socket {
    on(event: 'listening', listener: (socket: dgram.Socket) => void): this;
    on(event: 'received', listener: (resolved: boolean, packet: Packet, buffer: Packet, connection: Connection, info: dgram.RemoteInfo) => void): this;
    on(event: 'sent', listener: (packet: Packet, buffer: Buffer, bytes: number, connection: Connection) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
}
/**
 * UDP Socket for battleye rcon server to communicate with
 *
 * @export
 * @class Socket
 * @extends {emitter}
 * @implements {ISocket}
 */
export declare class Socket extends EventEmitter {
    private readonly options;
    private readonly socket;
    private readonly connections;
    private readonly info;
    /**
     * Creates an instance of Socket.
     * @param {ISocketOptions} [options={}]
     * @memberof Socket
     */
    constructor(options?: ISocketOptions);
    /**
     * creates a new connection
     *
     * @param {IConnectionDetails} details
     * @param {IConnectionOptions} [options={}]
     * @param {boolean} [connect=true]
     * @returns {Connection}
     * @memberof Socket
     */
    connection(details: IConnectionDetails, options?: IConnectionOptions, connect?: boolean): Connection;
    /**
     * receive packet from a connection and route packet to appropriate connection
     *
     * @param {Buffer} buffer
     * @param {dgram.RemoteInfo} info
     * @memberof Socket
     */
    receive(buffer: Buffer, info: dgram.RemoteInfo): void;
    /**
     * send packet to connection
     *
     * @param {Connection} connection
     * @param {Packet} packet
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Socket
     */
    send(connection: Connection, packet: Packet, resolve?: boolean): Promise<IPacketResponse>;
    /**
     * UDP socket is listening
     *
     * @readonly
     * @type {boolean}
     * @memberof Socket
     */
    get listening(): boolean;
}
