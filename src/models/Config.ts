import { iFlow } from "./Flow";

export interface iConfig {
    headless: boolean;
    flows: iFlow[];
    maxThreads?: number;
    width: number,
    height: number,
    customSize: boolean
}