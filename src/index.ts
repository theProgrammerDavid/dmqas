import type { Browser, Page } from 'puppeteer'
import { handleErrors, setupBrowser, setupPage, sleep } from './util';
import { ACTIONS, Action, ClickHTMLElementAction, DelayAction, ElementExistsAction, PageExitAction, ScreenshotAction, ScrollAction, WaitForNetworkIdleAction } from './Actions';
import { createLogger } from './util';
import winston from 'winston';
import { args } from './cliParser';
import fs from 'fs'
import path from 'path';
import { iConfig, iFlow, iAction } from './models/configFile';
import resultHandler from './ResultHandler';
import commandRunner from './commandRunner';
import { iScreenshotOptions } from './models';

async function doSomething(page: Page, a: iAction, logger: winston.Logger, flowName: string, extras: iScreenshotOptions) {
    let x: unknown;

    switch (a.actionType) {
        case 'ScreenshotAction':
            x = new ScreenshotAction(page, logger, extras);
            (x as ScreenshotAction).setup({
                fileName: a.fileName
            })
            const result = await (x as ScreenshotAction).execute();
            if (result) {
                resultHandler.flowFailed({
                    name: flowName,
                    failReason: "Screenshots do not match"
                });
            }
            return;
        case 'WaitForNetworkIdleAction':
            console.log('waiting for idle network');
            (x as WaitForNetworkIdleAction) = new WaitForNetworkIdleAction(page, logger);
            break;
        case 'DelayAction':
            console.log('delaying');
            x = new DelayAction(page, logger);
            (x as DelayAction).setup({
                delay: a.delay
            })
            break;
        case 'ClickHTMLElementAction':
            console.log('clicking button');
            (x as ClickHTMLElementAction) = new ClickHTMLElementAction(page, logger);
            (x as ClickHTMLElementAction).setup({
                element: a.element
            })
            break;
        case 'PageExitAction':
            (x as PageExitAction) = new PageExitAction(page, logger);
            resultHandler.flowPassed({
                name: flowName
            });
            break;
        case 'ElementExistsAction':
            (x as ElementExistsAction) = new ElementExistsAction(page, logger);
            (x as ElementExistsAction).setup({
                element: a.element
            })
            break;
        case 'ScrollAction':
            (x as ScrollAction) = new ScrollAction(page, logger);
            (x as ScrollAction).setup({
                deltaY: a.deltaY
            })
            break;
    };
    await (x as Action).execute()
}

async function doSomethingAgain(f: iFlow, logger: winston.Logger) {
    const page = await setupPage();
    page.setViewport({
        height: f.height,
        width: f.width
    });

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (f.requestInterceptor) {
            f.requestInterceptor(request)
        }
        request.continue();
    });

    page.on('response', async response => {
        if (f.responseInterceptor && response.headers()['Content-Length'] !== '0') {
            f.responseInterceptor(response);
        }
    });

    try {
        await page.goto(f.url, { timeout: f.timeoutInMs ?? 0 });
    }
    catch (err) {
        if (f.errHandler) f.errHandler(err, logger)
        handleErrors(err as Error);
        resultHandler.flowFailed({
            name: f.name,
            failReason: (err as Error).toString() ?? "Error in steps"
        });
        return;
    }

    for (let k = 0; k < f.actions.length; k++) {
        try {
            await doSomething(page, f.actions[k], logger, f.name, {
                ...f.screenshotOptions
            });
        }
        catch (err) {
            if (f.errHandler) f.errHandler(err, logger)
            handleErrors(err as Error);
            resultHandler.flowFailed({
                name: f.name,
                failReason: (err as Error).toString() ?? "Error in steps"
            });
            break;
        }
    }
}

async function main() {

    await commandRunner.init();

    let browser: Browser;

    try {
        const configFile: iConfig = (await import(path.resolve(__dirname, '..', args.config))).default;
        browser = await setupBrowser({ headless: configFile.headless });

        const x = [];
        const loggers: winston.Logger[] = [];

        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync('screenshots');
            fs.mkdirSync('screenshots/originals', { recursive: true });
            fs.mkdirSync('screenshots/new', { recursive: true });
            fs.mkdirSync('screenshots/heatmaps', { recursive: true });
        }

        for (let i = 0; i < configFile.flows.length; i++) {
            const flow = configFile.flows[i];
            loggers.push(createLogger('info', `logs/${flow.name}.log`))

            x.push(doSomethingAgain(flow, loggers[i]));
        }

        await Promise.all(x)

        browser.close()
    }
    catch (err) {
        console.log(err)
        process.exit(1)
    }

    resultHandler.printResults()
}

main()