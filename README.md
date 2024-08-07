
# DMQAS

A distributed (WIP) automated QA framework for websites capable of mimicking human interactions, built upon the `puppeteer` framework

> If you have an amazing QA engineer/team, please buy them a beer/pizza 

## Running

Install my-project with pnpm

```bash
  cd dmqas
  pnpm install
  pnpm run start --config ./configs/config.dmqas.ts
```

Create a file `configs/config.dmqas.ts`

```ts
// configs/config.dmqas.ts
import { iConfig } from "../src/models/configFile";

const CONFIG: iConfig = {
    headless: false,
    "customSize": false,
    "flows": [
        {
            "url": "https://bluehost.com",
            "width": 1920,
            "height": 1080,
            name: "BH main",
            // browsers: {
            //     CHROMIUM: true,
            //     FIREFOX: false,
            //     WEBKIT: false
            // },
            "logLevel": "info",
            timeoutInMs: 0,
            "actions": [
                {
                    actionType: "WaitForNetworkIdleAction"
                },
                {
                    actionType: "ClickHTMLElementAction",
                    element: "#hero7 > div > div.responsivecolumns > div > div > div.wrapper.section > div > div > div > div > div.responsive-columns__column.responsive-columns__column--left.col-sm-6.wordpressSection > div.cta.section > div > a"
                },
                {
                    actionType: "DelayAction",
                    delay: 2000
                },
                {
                    actionType: "ClickHTMLElementAction",
                    element: "#cardApi-cpanel-PRO > div.card-body > div > div:nth-child(11) > div.cta.section > div > a > span"
                },
                {
                    actionType: "ScreenshotAction",
                    fileName: "test.png"
                },
                {
                    actionType: "PageExitAction"
                }
            ],
            errHandler: (err, logger) => {
                console.log('xyz')
                if (err.constructor.name) {
                    switch (err.constructor.name) {
                        case "TimeoutError":
                            // do something here
                            logger.error(err.message);
                            break;
                        case "SelectorNotFound":
                            break;
                    }
                }
                return 1+1
            },
            requestInterceptor: async (request) => {
                if (request.url().includes('sfcore.do')) {
                    console.log(request.postData())
                }
            },
            responseInterceptor: async (response) => {
                if (response.url().includes('sfcore.do')) {
                    try {
                        const responseBody = await response.text();
                        console.log('Response JSON:', responseBody);
                    } catch (error) {
                        console.error('Failed to parse response as JSON:');
                        // console.error(await response.text() )
                    }
                }
            }
        },
        {
            name: "Personal website",
            "url": "https://davidvelho.com",
            "logLevel": "info",
            "width": 1920,
            "height": 1080,
            "actions": [
                {
                    actionType: "WaitForNetworkIdleAction"
                },
                {
                    actionType: "DelayAction",
                    delay: 1000
                },
                {
                    actionType: "ScreenshotAction",
                    fileName: "landing.png"
                },
                {
                    actionType: "PageExitAction"
                }
            ]
        }
    ]
}

export default CONFIG;
```

## Documentation

[Documentation WIP](https://linktodocumentation)


## Features

1. Website navigation
2. Website delayed loading
3. Screenshot heatmap comparison

## Roadmap
- Per page proxy support
- Per page network throttling
- Master Slave architecture 

