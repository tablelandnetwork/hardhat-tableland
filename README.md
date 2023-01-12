# @tableland/hardhat

[Tableland](https://tableland.xyz) support for Hardhat projects.

## What

This plugin makes it easy to run and interact with a local Tableland node for development and testing purposes. Upcoming versions will expand functionality to include support for Tableland table creation and management, plus more.

## Installation

```bash
npm install @tableland/hardhat
```

Import the plugin in your `hardhat.config.js`:

```js
require("@tableland/hardhat");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@tableland/hardhat";
```

## Tasks

This plugin creates no additional tasks, but does add a new network called `local-tablaland` that can be passed to any task that supports the `--network` flag. For example:

```
npx hardhat test --network local-tableland
```

and:

```
npx hardhat run scripts/deploy.ts --network local-tableland
```

and:

```
npx hardhat node --network local-tableland
```

## Environment extensions

This plugin extends the Hardhat Runtime Environment by adding a `localTableland` field whose type is:

```
{
    start: (config?: Config) => Promise<void>;
    stop: () => Promise<void>;
}
```

These functions allow you to progamatically interact with local Tableland, in a Hardhat script, for example.

## Configuration

This plugin extends the `HardhatUserConfig` object with an optional
`localTableland` field of type `Config`, which allows you to configure how local Tableland will run.

This is an example of how to set it:

```ts
const config: HardhatUserConfig = {
  ...
  localTableland: {
    silent: false,
    verbose: false,
  },
  ...
};

export default config;
```

## Usage

There are no additional steps you need to take for this plugin to work. Simply use the `local-tableland` network when running Hardhat tasks or interact with the Hardhat Runtime Environment's `localTableland` API programmatically.
