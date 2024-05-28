import type { Browser, Page } from 'puppeteer'
import { handleErrors, setupBrowser, setupPage, sleep } from './util';
import { ACTIONS, Action, ClickHTMLElementAction, DelayAction, ElementExistsAction, PageExitAction, ScreenshotAction, ScrollAction, WaitForNetworkIdleAction } from './models/Actions';
import { createLogger } from './util';
import winston from 'winston';
import { args } from './cliParser';
import fs from 'fs'
import path from 'path';
import { iConfig, iFlow } from './models/configFile';
import resultHandler from './ResultHandler';

async function doSomething(page: Page, a: any[], logger: winston.Logger, flowName: string) {
    let x: Action | undefined;

    switch (a[0] as ACTIONS) {
        case 'ScreenshotAction':
            x = new ScreenshotAction(page, logger, a[1])
            const result = await x.execute();
            if (result) {
                resultHandler.flowFailed({
                    name: flowName,
                    failReason: "Screenshots do not match"
                });
            }
            return;
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
            resultHandler.flowPassed({
                name: flowName
            });
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

async function doSomethingAgain(f: iFlow, logger: winston.Logger) {
    const page = await setupPage();
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
            await doSomething(page, f.actions[k], logger, f.name);
        }
        catch (err) {
            if (f.errHandler) f.errHandler(err, logger)
            handleErrors(err as Error);
            break;
        }
    }
}

async function main() {

    let browser: Browser;

    try {
        const configFile: iConfig = (await import(path.resolve(__dirname, '..', args.config))).default;
        browser = await setupBrowser({ headless: configFile.headless });

        const x = [];
        const loggers: winston.Logger[] = [];

        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync('screenshots');
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