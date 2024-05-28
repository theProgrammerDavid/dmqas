
# DMQAS

An automated QA framework for websites capable of mimicking human interactions, built upon the `puppeteer` framework

> If you have an amazing QA engineer/team, please buy them a beer/pizza 

## Running

Install my-project with npm

```bash
  cd dmqas
  pnpm install
  pnpm run start --config "./config.json"
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

