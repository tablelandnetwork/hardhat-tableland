// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "local-tableland",
  tables: {
    gen: {
      onCreateTables: true,
      path: "./gen",
    },
    definitions: {
      people: {
        schema: "id integer, name text, age integer",
      },
    },
  },
};

export default config;
