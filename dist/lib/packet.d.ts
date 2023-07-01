/// <reference types="node" />
export declare enum PacketType {
    Login = 0,
    Command = 1,
    Message = 2
}
export declare enum PacketDirection {
    Request = 0,
    Reply = 1,
    Split = 2
}
export interface IPacketAttributes {
    timestamp?: number;
    sent?: number;
    sequence?: number;
    total?: number;
    index?: number;
    data?: string;
    password?: string;
    command?: string;
    message?: string;
    login?: boolean;
    part?: Buffer;
    [key: string]: number | string | boolean | Buffer | undefined | Error;
}
/**
 * Packet class
 *
 * @export
 * @class Packet
 */
export declare class Packet {
    private attributes;
    private readonly info;
    /**
     * Creates an instance of Packet.
     *
     * @param {PacketType} type
     * @param {PacketDirection} direction
     * @param {IPacketAttributes} [attributes={}]
     * @memberof Packet
     */
    constructor(type: PacketType, direction: PacketDirection, attributes?: IPacketAttributes);
    /**
     * copies packet from another packet
     *
     * @static
     * @param {Packet} packet
     * @returns {Packet}
     * @memberof Packet
     */
    static COPY(packet: Packet): Packet;
    /**
     * creates packet from buffer
     *
     * @static
     * @param {Buffer} buffer
     * @returns {Packet}
     * @memberof Packet
     */
    static FROM(buffer: Buffer): Packet;
    /**
     * get packet attribute
     *
     * @param {string} key
     * @returns {*}
     * @memberof Packet
     */
    get(key: 'password' | 'command' | 'data' | 'message'): string;
    get(key: 'index' | 'total' | 'sequence'): number;
    get(key: 'login'): boolean;
    get(key: 'part'): Buffer;
    get(key: 'error'): Error;
    /**
     * set packet attribute
     *
     * @param {string} key
     * @param {*} value
     * @returns {Packet}
     * @memberof Packet
     */
    set(key: 'password' | 'command' | 'data' | 'message', value: string): this;
    set(key: 'index' | 'total' | 'sequence', value: number): this;
    set(key: 'login', value: boolean): this;
    set(key: 'part', value: Buffer): this;
    /**
     * check if packet has attribute
     *
     * @param {string} key
     * @returns {boolean}
     * @memberof Packet
     */
    has(key: string): boolean;
    /**
     * clear attributes of packet
     *
     * @returns {Packet}
     * @memberof Packet
     */
    clear(): Packet;
    /**
     * packet type
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get type(): number;
    /**
     * packet direction
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get direction(): number;
    /**
     * timestamp of packet creation
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get timestamp(): number | undefined;
    /**
     * number of times packet was serialized for sending
     *
     * @readonly
     * @type {number}
     * @memberof Packet
     */
    get sent(): number;
    /**
     * packet sequence
     *
     * @type {number}
     * @memberof Packet
     */
    get sequence(): number;
    /**
     * packet sequence
     *
     * @memberof Packet
     */
    set sequence(sequence: number);
    /**
     * check if packet is valid
     *
     * @readonly
     * @memberof Packet
     */
    get valid(): boolean;
    /**
     * serialize packet to be sent to battleye
     *
     * @returns {Buffer}
     * @memberof Packet
     */
    serialize(): Buffer;
}
