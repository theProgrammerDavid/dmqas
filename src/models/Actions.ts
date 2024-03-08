import { Page } from "puppeteer";
import type { Logger } from "winston";
import { extractDomain, sleep } from "../util";

export type ACTIONS = "WaitForNetworkIdleAction"
    | "ScreenshotAction"
    | "DelayAction"
    | "ClickHTMLElementAction"
    | "PageExitAction"
    | "ElementExistsAction"
    | "ScrollAction"

export interface iAction {
    page: Page
    logger: Logger

    execute: <T>(...args: any[]) => Promise<T>
}

export class Action implements iAction {
    page: Page;
    logger: Logger;

    constructor(page: Page, logger: Logger) {
        this.page = page;
        this.logger = logger;
    }

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
        return this.page.waitForNetworkIdle();
    }
}

export class ScreenshotAction extends Action {
    fileName: string;
    constructor(page: Page, logger: Logger, fileName: string) {
        super(page, logger)

        this.fileName = fileName;
    }

    async execute(): Promise<any> {
        this.logger.info('taking screenshot')
        await this.page.screenshot({ path: this.fileName })
        return;
    }
}

export class DelayAction extends Action {
    constructor(page: Page, logger: Logger) {
        super(page, logger)
    }

    async execute(delay: number): Promise<any> {
        this.logger.info("waiting for delay")
        return sleep(delay)
    }
}

export class ClickHTMLElementAction extends Action {
    htmlSelector: string;

    constructor(page: Page, logger: Logger, element: string) {
        super(page, logger);

        this.htmlSelector = element;
    }

    async execute(): Promise<any> {
        const frame = await this.page.waitForSelector(this.htmlSelector);
        const offset = { x: 213 + 5, y: 11 + 5 };
        const rect = await this.page.evaluate(el => {
            const { x, y } = el!.getBoundingClientRect();
            return { x, y };
        }, frame)

        await Promise.all([
            this.page.mouse.click(rect.x + offset.x, rect.y + offset.y),
            this.page.waitForNavigation({
                waitUntil: 'networkidle2'
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
    constructor(page: Page, logger: Logger, elementSelector: string) {
        super(page, logger);

        this.elementSelector = elementSelector;
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

    constructor(page: Page, logger: Logger, scrollDeltaY: number) {
        super(page, logger);

        this.scrollDeltaY = scrollDeltaY
    }

    async execute(): Promise<any> {
        this.logger.info(`scrolling ${this.scrollDeltaY}`)
        await this.page.mouse.wheel({ deltaY: this.scrollDeltaY })
    }
}