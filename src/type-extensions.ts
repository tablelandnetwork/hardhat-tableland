import { Config } from "@tableland/local";
import { Artifact, TablesConfig } from "./tables";

import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    tables?: TablesConfig;
    localTableland?: Config;
  }

  export interface HardhatConfig {
    tables: TablesConfig;
    localTableland?: Config;
  }

  export interface NetworksConfig {
    "local-tableland": HttpNetworkConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    tableland: {
      processTables: (config?: TablesConfig) => Promise<Artifact[]>;
    };
  }
}
