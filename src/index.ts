import { Config, LocalTableland } from "@tableland/local";
import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import "./type-extensions";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.localTableland = userConfig.localTableland;
    config.networks["local-tableland"] = config.networks.localhost;
  }
);

extendEnvironment((hre) => {
  hre.localTableland = lazyObject(() => {
    let lt: LocalTableland | undefined;
    return {
      start: async (config: Config | undefined = hre.config.localTableland) => {
        lt = new LocalTableland(config);
        await lt.start();
      },
      stop: async () => {
        await lt?.shutdown();
      },
    };
  });
});

// TODO: Figure out how to pass hardhat node settings to the local tableland instance.

task("node", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    process.on("SIGINT", async () => {
      await hre.localTableland.stop();
    });
    await hre.localTableland.start(hre.config.localTableland);
    await new Promise(() => {});
  } else {
    await runSuper(args);
  }
});

task("run", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await hre.localTableland.start(hre.config.localTableland);
  }
  await runSuper(args);
  await hre.localTableland.stop();
});

task("test", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await hre.localTableland.start(hre.config.localTableland);
  }
  await runSuper(args);
  await hre.localTableland.stop();
});
