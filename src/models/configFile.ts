import { HTTPRequest } from "puppeteer";
import { ACTIONS, Action, iActionExecuteArgs, iClickHTMLElementActionArgs, iDelayActionArgs, iElementExistsActionArgs, iScreenshotActionArgs, iScrollActionArgs } from "./Actions";
import winston from 'winston';

export interface iConfig {
    headless: boolean;
    customSize: boolean;
    flows: iFlow[];
}

export type LOG_LEVEL = 'info' | 'debug' | 'verbose' | 'trace' | 'warning' | 'error'

export interface iFlow {
    url: string;
    name: string;
    width: number;
    browsers: iBrowser
    height: number;
    logLevel: LOG_LEVEL,
    actions: iAction[];
    timeoutInMs?: number; // if timeout, error will be thrown if page loading exceeds
    errHandler?: (err: any, logger: winston.Logger) => void;
    requestInterceptor?: (req: HTTPRequest) => void;
}

export type ActionArgsMap = {
    WaitForNetworkIdleAction: iActionExecuteArgs;  // No specific args for this action
    ScreenshotAction: iScreenshotActionArgs;
    DelayAction: iDelayActionArgs;
    ClickHTMLElementAction: iClickHTMLElementActionArgs;
    PageExitAction: iActionExecuteArgs;  // No specific args for this action
    ElementExistsAction: iElementExistsActionArgs;
    ScrollAction: iScrollActionArgs;
};

export type ActionType<T extends ACTIONS> = {
    actionType: T;
} & ActionArgsMap[T];

export type iAction = {
    [T in ACTIONS]: ActionType<T>;
}[ACTIONS];

export type iBrowserType = 'CHROMIUM' | 'FIREFOX' | 'WEBKIT'

export type iBrowser = Record<iBrowserType, boolean>