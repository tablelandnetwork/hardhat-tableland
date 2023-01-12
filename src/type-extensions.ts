import { Config } from "@tableland/local";
import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    localTableland?: Config;
  }

  export interface HardhatConfig {
    localTableland?: Config;
  }

  export interface NetworksConfig {
    "local-tableland": HttpNetworkConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    localTableland: {
      start: (config?: Config) => Promise<void>;
      stop: () => Promise<void>;
    };
  }
}
