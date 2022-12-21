import { ChainName, connect } from "@tableland/sdk";
import { Config, LocalTableland } from "@tableland/local";
import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject, HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
import "@nomiclabs/hardhat-ethers";
import { init, TablesConfig } from "./tables";
import "./type-extensions";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    let tablesConfig: TablesConfig;
    const userTablesConfig = userConfig.tables;
    if (userTablesConfig == undefined) {
      tablesConfig = {
        gen: {
          onCreateTables: true,
          path: path.normalize(path.join(config.paths.root, "gen")),
        },
        definitions: {},
      };
    } else {
      tablesConfig = userTablesConfig;
    }
    config.tables = tablesConfig;
    config.localTableland = userConfig.localTableland;
    config.networks["local-tableland"] = config.networks.localhost;
  }
);

extendEnvironment((hre) => {
  hre.tableland = lazyObject(() => {
    return {
      processTables: async (config: TablesConfig = hre.config.tables) => {
        if (
          hre.network.name === "hardhat" ||
          hre.network.name === "localhost"
        ) {
          throw new HardhatPluginError(
            "@tableland/hardhat",
            "Can't integrate Tableland into localhost or hardhat network. Use network local-tableland or any real network instead."
          );
        }
        const [signer] = await hre.ethers.getSigners();
        const tbl = connect({ signer, chain: hre.network.name as ChainName });
        const frm = init(tbl);
        const res = await frm.tables.processTablesConfig(config);
        return res;
      },
    };
  });
});

task("node", async (args, hre, runSuper) => {
  if (hre.network.name === "local-tableland") {
    await startLocalTableland(hre.config.localTableland);
    await new Promise((res) => {});
  } else {
    await runSuper(args);
  }
});

task("run", async (args, hre, runSuper) => {
  let lt: LocalTableland | undefined;
  if (hre.network.name === "local-tableland") {
    lt = await startLocalTableland(hre.config.localTableland);
  }
  await runSuper(args);
  if (lt) {
    await lt.shutdown();
  }
});

task("test", async (args, hre, runSuper) => {
  let lt: LocalTableland | undefined;
  if (hre.network.name === "local-tableland") {
    lt = await startLocalTableland(hre.config.localTableland);
  }
  await runSuper(args);
  if (lt) {
    await lt.shutdown();
  }
});

task(
  "tables",
  "Process Tableland tables defined in your Hardhat config",
  async (args, hre) => {
    let lt: LocalTableland | undefined;
    if (hre.network.name === "local-tableland") {
      lt = await startLocalTableland(hre.config.localTableland);
    }
    await hre.tableland.processTables(hre.config.tables);
    if (lt) {
      await lt.shutdown();
    }
  }
);

async function startLocalTableland(config?: Config): Promise<LocalTableland> {
  // TODO: Figure out how to pass hardhat node settings to the local tableland instance.
  const lt = new LocalTableland(config);
  process.on("SIGINT", async () => {
    await lt.shutdown();
  });
  await lt.start();
  return lt;
}
