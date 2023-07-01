/// <reference types="node" />
import { EventEmitter } from 'events';
import { Packet } from './packet';
import { Socket } from './socket';
export interface IConnectionDetails {
    name: string;
    ip: string;
    port: number;
    password: string;
}
export interface IConnectionOptions {
    reconnect?: boolean;
    reconnectTimeout?: number;
    keepAlive?: boolean;
    keepAliveInterval?: number;
    timeout?: boolean;
    timeoutInterval?: number;
    serverTimeout?: number;
    packetTimeout?: number;
    packetTimeoutThresholded?: number;
}
export interface IPacketPromise {
    bytes: number;
    packet: Packet;
    resolve(value?: IPacketResponse | PromiseLike<IPacketResponse>): void;
    reject(reason?: Error): void;
}
export interface IPacketResponse {
    command?: string;
    data?: string;
    connected?: boolean;
    bytes: number;
    sent: Packet;
    received?: Packet;
    connection: Connection;
}
export declare interface Connection {
    on(event: 'message', listener: (message: string, packet: Packet) => void): this;
    on(event: 'command', listener: (data: string, resolved: boolean, packet: Packet) => void): this;
    on(event: 'connected', listener: () => void): this;
    on(event: 'disconnected', listener: (reason: string | Error) => void): this;
    on(event: 'debug', listener: (message: string) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
}
/**
 * Connection to battleye rcon server
 *
 * @export
 * @class Connection
 * @extends {emitter}
 * @implements {IConnection}
 */
export declare class Connection extends EventEmitter {
    private readonly socket;
    private readonly options;
    private keepAlive;
    private timeout;
    private packets;
    private multipart;
    private readonly info;
    /**
     * Creates an instance of Connection.
     *
     * @param {Socket} socket
     * @param {IConnectionDetails} details
     * @param {IConnectionOptions} [options={}]
     * @memberof Connection
     */
    constructor(socket: Socket, details: IConnectionDetails, options?: IConnectionOptions);
    /**
     * connect to the connection
     *
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    connect(): Promise<IPacketResponse>;
    /**
     * sends a command packet to connection
     *
     * @param {string} command
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    command(command: string, resolve?: boolean): Promise<IPacketResponse>;
    /**
     * sends a packet to connection
     *
     * @param {Packet} packet
     * @param {boolean} [resolve=true]
     * @returns {Promise<IPacketResponse>}
     * @memberof Connection
     */
    send(packet: Packet, resolve?: boolean): Promise<IPacketResponse>;
    /**
     * stores command Promise
     *
     * @param {IPacketPromise} store
     * @memberof Connection
     */
    store(store: IPacketPromise): void;
    recieve(packet: Packet): Promise<boolean>;
    /**
     * resolves Promise from packet reply
     *
     * @param {Packet} packet
     * @returns {boolean}
     * @memberof Connection
     */
    resolve(packet: Packet): boolean;
    /**
     * returns weather or not connection is active
     *
     * @readonly
     * @type {boolean}
     * @memberof Connection
     */
    get connected(): boolean;
    /**
     * returns connection id
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get id(): string;
    /**
     * returns connection name
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get name(): string;
    /**
     * returns connection ip
     *
     * @readonly
     * @type {string}
     * @memberof Connection
     */
    get ip(): string;
    /**
     * returns connection port
     *
     * @readonly
     * @type {number}
     * @memberof Connection
     */
    get port(): number;
    /**
     * kill connection
     *
     * @param {Error} reason
     * @memberof Connection
     */
    kill(reason: Error): void;
    /**
     * set's up timers for keep alive and timeouts
     *
     * @private
     * @memberof Connection
     */
    private setup;
    /**
     * returns connection packet sequence
     *
     * @readonly
     * @type {number}
     * @memberof Connection
     */
    get sequence(): number;
    /**
     * disconnects from connection
     *
     * @param {Error} [reason=new ServerDisconnect()]
     * @memberof Connection
     */
    private disconnect;
    /**
     * cleans up unresolved promises and resets connection
     *
     * @private
     * @param {Error} error
     * @memberof Connection
     */
    private cleanup;
}
