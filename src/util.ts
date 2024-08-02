// import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import winston from 'winston';
import fs from 'fs/promises'
import { Config } from './validations';
import { chromium, firefox, webkit, Browser, Page } from 'playwright'
import { iBrowserType } from './models/configFile';

puppeteer.use(stealthPlugin());

let chromiumBrowser: Browser;
let firefoxBrowser: Browser;
let webkitBrowser: Browser;

interface iSetupBrowser {
    headless: boolean;
    timeout?: number;
    args?: string;
    customView?: boolean
}


/**
 * 
 * @param param0 
 * @returns 
 */
export async function setupBrowser(
    { headless, customView, timeout }: iSetupBrowser
) {
    // browser = await puppeteer.launch({
    //     headless,
    //     timeout: 50000,
    // });

    // return browser
    chromiumBrowser = await chromium.launch({
        headless,
        timeout: 50000
    });

    firefoxBrowser = await firefox.launch({
        headless,
        timeout: 50000
    });

    webkitBrowser = await webkit.launch({
        headless,
        timeout: 50000
    });

    return {
        chromiumBrowser, firefoxBrowser, webkitBrowser
    }
}

export async function setupPage(browser: Browser, width: number, height: number) {
    // const page = await browser.newPage();
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')

    // return page;

    const context = await browser.newContext({
        viewport: {
            width, height
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();

    // Modify various properties to hide automation
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
        (window.navigator as any).chrome = {
            runtime: {},
        };
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });
    });

    return page;
}

/**
 * 
 * @param ms 
 * @returns 
 */
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param logLevel 
 * @param fileName 
 * @returns 
 */
export function createLogger(logLevel: string, fileName: string) {
    const logger = winston.createLogger({
        level: logLevel,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            // new winston.transports.File({ filename: "error.log", level: "warn" }),
            new winston.transports.File({ filename: fileName }),
        ],
    });

    return logger;
}

/**
 * 
 * @param url 
 * @returns 
 */
export function extractDomain(url: string): string | null {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return null;
    }
}

/**
 * Throws error if config file JSON schema is not correct
 * @param filePath 
 * @returns 
 */
export async function readConfigfileAndValidateSchema(filePath: string) {
    const fileData = fs.readFile(filePath);
    const parsedData = JSON.parse((await fileData).toString());

    return Config.parse(parsedData);
}

/**
 * 
 */
export function handleErrors(e: Error) {
    if (e.name) {
        switch (e.name) {
            case 'TimeoutError':
                break;
        }
    }
}

/**
 * 
 * @param fileName 
 * @returns 
 */
export function genNewImageFilename(fileName: string) {
    const indexOfDot = fileName.indexOf(".");
    const fileNameWithoutDot = fileName.slice(0, indexOfDot);
    return `${fileNameWithoutDot}_new.png`;
}

/**
 * 
 * @param fileName 
 * @returns 
 */
export function genHeatmapFileName(fileName: string) {
    const indexOfDot = fileName.indexOf(".");
    const fileNameWithoutDot = fileName.slice(0, indexOfDot);
    return `${fileNameWithoutDot}_heatmap.png`;
}

/**
 * 
 * @param page 
 * @param selector 
 */
export async function pageContainsHTMLElement(page: Page, selector: string): Promise<boolean> {

    // let s = await page.evaluate(() => {
    //     let el = document.querySelector(selector) as HTMLElement
    //     return el ? el.innerText : ""
    // }, selector)

    const selectorElement = await page.$(selector);
    return Boolean(selectorElement);
}