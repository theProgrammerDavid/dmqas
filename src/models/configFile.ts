import { ACTIONS, Action } from "./Actions";
import winston from 'winston';

export interface iConfig {
    headless: boolean;
    customSize: boolean;
    width: number;
    height: number;
    flows: iFlow[];
}

export type LOG_LEVEL = 'info' | 'debug' | 'verbose' | 'trace' | 'warning' | 'error'

export interface iFlow {
    url: string;
    name: string;
    logLevel: LOG_LEVEL,
    actions: iAction[];
    timeoutInMs?: number; // if timeout, error will be thrown if page loading exceeds
    errHandler?: (err: any, logger: winston.Logger) => void;
}

export type iAction = [ACTIONS, ...any[]]