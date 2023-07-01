export declare function hashAddress(ip: string, port: number): string;
export interface IBEConfig {
    rconpassword?: string;
    rconport?: number;
    rconip?: string;
    maxping?: number;
}
export declare function readCfg(bepath: string): Promise<IBEConfig>;
