import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import winston from 'winston';

puppeteer.use(stealthPlugin());

let browser: Browser;

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
    browser = await puppeteer.launch({
        headless,
        timeout: 50000,
    });

    return browser
}

export async function setupPage() {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')

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