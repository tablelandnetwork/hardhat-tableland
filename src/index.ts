import { Config, LocalTableland } from "@tableland/local";
import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import {
  HardhatConfig,
  HardhatRuntimeEnvironment,
  HardhatUserConfig,
} from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
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
        lt.start();
        await lt.isReady();
      },
      stop: async () => {
        if (lt) {
          await lt.shutdown();
        }
      },
    };
  });
});

task("node", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await startLocalTableland(hre);
  } else {
    await runSuper(args);
  }
});

task("run", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await startLocalTableland(hre);
  }
  await runSuper(args);
  await hre.localTableland.stop();
});

task("test", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await startLocalTableland(hre);
  }
  await runSuper(args);
  await hre.localTableland.stop();
});

async function startLocalTableland(
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  // TODO: Figure out how to pass hardhat node settings to the local tableland instance.
  const lt = new LocalTableland(hre.config.localTableland);
  process.on("SIGINT", async () => {
    await hre.localTableland.stop();
  });
  await hre.localTableland.start();
}
