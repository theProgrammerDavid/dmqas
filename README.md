
# DMQAS

An automated QA framework for websites capable of mimicking human interactions, built upon the `puppeteer` framework

> If you have an amazing QA engineer/team, please buy them a beer/pizza 

## Running

Install my-project with npm

```bash
  cd dmqas
  pnpm install
  pnpm exec playwright install
  pnpm run start --config ./configs/config.dmqas.ts
```

```ts
// configs/config.dmqas.ts

import { iConfig } from "../src/models/configFile";

const CONFIG: iConfig = {
    headless: true,
    "customSize": false,
    "width": 800,
    "height": 800,
    "flows": [
        {
            "url": "https://bluehost.com",
            name: "BH main",
            "logLevel": "info",
            timeoutInMs: 60 * 60 * 1,
            "actions": [
                ["WaitForNetworkIdleAction"],
                ["ClickHTMLElementAction", "#hero7 > div.videoHero__text > div.cta > div > a"],
                ["DelayAction", 200],
                ["ClickHTMLElementAction", "div.bluehostCard-4--js:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(11) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1)"],
                ["ScreenshotAction", "test.png"],
            ],
            errHandler: (err, logger) => {
                if (err.constructor.name) {
                    switch (err.constructor.name) {
                        case "TimeoutError":
                            // do something here
                            logger.error(err.message);
                            break;
                    }
                }
            }
        },
        {
            name: "Personal website",
            "url": "https://davidvelho.com",
            "logLevel": "info",
            "actions": [
                ["WaitForNetworkIdleAction"],
                ["DelayAction", 4000],

                ["ScreenshotAction", "landing.png"],
                ["PageExitAction"]
            ]
        }
    ]
}

export default CONFIG;
```

## Documentation

[Documentation](https://linktodocumentation)


## Features

1. Website navigation
2. Website delayed loading 

```ts
export type ACTIONS = "WaitForNetworkIdleAction"
    | "ScreenshotAction"
    | "DelayAction"
    | "ClickHTMLElementAction"
    | "PageExitAction"
    | "ElementExistsAction"
    | "ScrollAction"
```

## Roadmap

- Per page proxy support

- Page screenshot 

