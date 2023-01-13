# @tableland/hardhat

[Tableland](https://tableland.xyz) support for Hardhat projects.

## What

This plugin makes it easy to run and interact with a local Tableland node for development and testing purposes. Upcoming versions will expand functionality to include support for Tableland table creation and management, plus more.

## Installation

```bash
npm install @tableland/hardhat --save-dev
```

Import the plugin in your `hardhat.config.js`:

```js
require("@tableland/hardhat");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@tableland/hardhat";
```

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

## Usage

There are no additional steps you need to take for this plugin to work. Simply use the `local-tableland` network when running Hardhat tasks or interact with the Hardhat Runtime Environment's `localTableland` API programmatically.

{% note %}

**Note:** The `@nomicfoundation/hardhat-network-helpers` package provides a useful function `loadFixture` that will reset the state of the Hardhat network to a snapshot that your fixture captured. Unfortunately, Local Tablelend can't yet deal with this type of state reset, so avoid using `loadFixture` when using Local Tableland.

{% endnote %}
