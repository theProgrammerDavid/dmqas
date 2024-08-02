// import { Page } from "puppeteer";
import { Page } from 'playwright'
import type { Logger } from "winston";
import { extractDomain, genHeatmapFileName, genNewImageFilename, pageContainsHTMLElement, sleep } from "../util";
import fs from 'fs'
import path from 'path'
import { spawnImageDiff } from "../commandRunner";
import { SelectorNotFound } from "./Errors";

export type ACTIONS = "WaitForNetworkIdleAction"
    | "ScreenshotAction"
    | "DelayAction"
    | "ClickHTMLElementAction"
    | "PageExitAction"
    | "ElementExistsAction"
    | "ScrollAction"

interface iAction {
    page: Page
    logger: Logger

    execute: <T>(...args: any[]) => Promise<T>
    setup: (args: iActionExecuteArgs) => void
}

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

export class Action implements iAction {
    page: Page;
    logger: Logger;

    constructor(page: Page, logger: Logger) {
        this.page = page;
        this.logger = logger;
    }
    setup(args: iActionExecuteArgs) {

    };

    execute<T>(...args: any[]): Promise<T> {
        throw new Error("You must specify the type T for execute method.");
    }
}

export class WaitForNetworkIdleAction extends Action {
    constructor(page: Page, logger: Logger) {
        super(page, logger)
    }

    async execute(): Promise<any> {
        this.logger.info("waiting for network idle")
        return this.page.waitForNavigation();
    }
}

export class ScreenshotAction extends Action {
    fileName: string;

    constructor(page: Page, logger: Logger) {
        super(page, logger)
        this.fileName = "";
    }

    setup({ fileName }: iScreenshotActionArgs) {
        this.fileName = fileName;
    }

    async execute(): Promise<any> {
        let filePath = `screenshots/${this.fileName}`
        const resolvePath = path.resolve(__dirname, '..', '..', filePath)
        if (fs.existsSync(resolvePath)) {
            console.log('screenshot exists, comparing');

            const newFilePath = genNewImageFilename(`screenshots/${this.fileName}`)
            const heatmapFilePath = genHeatmapFileName(`screenshots/${this.fileName}`)

            await this.page.screenshot({ path: newFilePath })

            const x = path.resolve(__dirname, '..', '..', filePath);
            const y = path.resolve(__dirname, '..', '..', newFilePath)
            const z = path.resolve(__dirname, '..', '..', heatmapFilePath)

            const output = await spawnImageDiff(
                x,
                y,
                z
            ) as string;

            return output.trim() === 'non zero diff found: true';
        }
        else {
            this.logger.info('taking screenshot');
            await this.page.screenshot({ path: filePath })

        }
        return;
    }
}

export class DelayAction extends Action {
    constructor(page: Page, logger: Logger) {
        super(page, logger)
        this.delay = 0;
    }
    delay: number;

    setup({ delay }: iDelayActionArgs) {
        this.delay = delay;
    }

    async execute(delay: number): Promise<any> {
        this.logger.info("waiting for delay")
        return sleep(delay)
    }
}

export class ClickHTMLElementAction extends Action {
    htmlSelector: string;

    constructor(page: Page, logger: Logger) {
        super(page, logger);
        this.htmlSelector = "";
    }

    setup({ element }: iClickHTMLElementActionArgs): void {
        this.htmlSelector = element;
    }

    async execute(): Promise<any> {
        const pageHasElement = await pageContainsHTMLElement(this.page, this.htmlSelector);
        if (!pageHasElement) {
            // this.logger.error();
            throw new SelectorNotFound(`page ${this.page.url} does not contain selector ${this.htmlSelector}`)
        }

        // await Promise.all([
        //     this.page.click(this.htmlSelector, {
        //         delay: 10
        //     }),
        //     this.page.waitForNavigation({
        //         waitUntil: 'networkidle2'
        //     })
        // ])

        // const frame = await this.page.waitForSelector(this.htmlSelector);
        // const offset = { x: 213 + 5, y: 11 + 5 };
        // const rect = await this.page.evaluate(el => {
        //     const { x, y } = el!.getBoundingClientRect();
        //     return { x, y };
        // }, frame)

        await Promise.all([
            // this.page.mouse.click(rect.x + offset.x, rect.y + offset.y),
            this.page.$eval(this.htmlSelector, element => (element as any).click()),
            this.page.waitForNavigation({
                waitUntil: 'networkidle'
            })
        ])
        this.logger.info('click action done, waiting for networkIdle')

    }
}

export class PageExitAction extends Action {
    constructor(page: Page, logger: Logger) {
        super(page, logger)
    }

    execute(): any {
        this.logger.info(`closing page ${extractDomain(this.page.url())}`)
        return this.page.close();
    }
}

export class ElementExistsAction extends Action {
    elementSelector: string

    constructor(page: Page, logger: Logger) {
        super(page, logger);

        this.elementSelector = "";
    }

    setup({ element }: iElementExistsActionArgs): void {
        this.elementSelector = element;
    }

    async execute(): Promise<any> {
        const element = await this.page.$(this.elementSelector)
        if (!element)
            throw new Error(`Error! element does not exist. Selector: ${this.elementSelector}`)

        return element
    }
}

export class ScrollAction extends Action {
    scrollDeltaY: number

    constructor(page: Page, logger: Logger) {
        super(page, logger);

        this.scrollDeltaY = 0;
    }

    setup({ deltaY }: iScrollActionArgs): void {
        this.scrollDeltaY = deltaY;
    }

    async execute(): Promise<any> {
        this.logger.info(`scrolling ${this.scrollDeltaY}`)
        await this.page.mouse.wheel(this.scrollDeltaY, 0);
    }
}