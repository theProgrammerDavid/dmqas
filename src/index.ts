import type { Page } from 'puppeteer'
import CONFIG from '../config';
import { setupBrowser, setupPage, sleep } from './util';
import { ACTIONS, Action, ClickHTMLElementAction, DelayAction, ElementExistsAction, PageExitAction, ScreenshotAction, ScrollAction, WaitForNetworkIdleAction } from './models/Actions';
import { iPage } from './models';
import { createLogger } from './util';
import winston from 'winston';

async function doSomething(page: Page, a: any[], logger: winston.Logger) {
    let x: Action | undefined;

    switch (a[0] as ACTIONS) {
        case 'ScreenshotAction':
            x = new ScreenshotAction(page, logger, a[1])
            break;
        case 'WaitForNetworkIdleAction':
            console.log('waiting for idle network')
            x = new WaitForNetworkIdleAction(page, logger);
            break;
        case 'DelayAction':
            console.log('delaying')
            x = new DelayAction(page, logger)
            break;
        case 'ClickHTMLElementAction':
            console.log('clicking button')
            x = new ClickHTMLElementAction(page, logger, a[1]);
            break;
        case 'PageExitAction':
            x = new PageExitAction(page, logger);
            break;
        case 'ElementExistsAction':
            x = new ElementExistsAction(page, logger, a[1])
            break;
        case 'ScrollAction':
            x = new ScrollAction(page, logger, a[1])
            break;
    };
    await x.execute()
}

async function doSomethingAgain(f: iPage, logger: winston.Logger) {
    const page = await setupPage();
    await page.goto(f.url, { timeout: 60 * 60 * 60 });

    for (let k = 0; k < f.actions.length; k++) {
        await doSomething(page, f.actions[k], logger);
    }
}

async function main() {
    const browser = await setupBrowser({ headless: CONFIG.headless });

    const x = [];
    const loggers = [];

    for (let i = 0; i < CONFIG.flows.length; i++) {
        const flow = CONFIG.flows[i];
        loggers.push(createLogger('info', 'app' + i + '.log'))

        x.push(doSomethingAgain(flow, loggers[i]));
    }

    await Promise.all(x)

    browser.close()
}

main()