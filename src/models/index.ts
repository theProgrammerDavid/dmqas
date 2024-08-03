export interface iActionExecuteArgs { }

export interface iScreenshotActionArgs extends iActionExecuteArgs {
    fileName: string;
}

export interface iDelayActionArgs extends iActionExecuteArgs {
    delay: number
}

export interface iClickHTMLElementActionArgs extends iActionExecuteArgs {
    element: string;
}

export interface iElementExistsActionArgs extends iActionExecuteArgs {
    element: string;
}

export interface iScrollActionArgs extends iActionExecuteArgs {
    deltaY: number;
}
