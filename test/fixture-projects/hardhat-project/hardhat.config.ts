// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "local-tableland",
  localTableland: {
    silent: true,
    verbose: false,
  },
};

export default config;
