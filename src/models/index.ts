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


export type tPlatform = 'windows' | 'linux' | 'macos';

export interface iDiffImageResult {
    non_zero_diff_found: boolean;
    pixels_changed: number;
}

export interface iScreenshotOptions {
    heatmapOpacity: number

}