import { Connection } from "@tableland/sdk";
import { NonceManager } from "@ethersproject/experimental";
import { processConfig, TablesConfig, Artifact, gen } from "./process";

export interface Framework {
  tables: {
    processTablesConfig: (tablesConfig: TablesConfig) => Promise<Artifact[]>;
    gen: (tablesConfig: TablesConfig) => Promise<void>;
  };
}

export function init(connection: Connection): Framework {
  if (connection.signer !== undefined) {
    connection.signer = new NonceManager(connection.signer);
  }
  return {
    tables: {
      processTablesConfig: async (tablesConfig: TablesConfig) =>
        await processConfig(tablesConfig, connection),
      gen: async (tablesConfig: TablesConfig) => await gen(tablesConfig),
    },
  };
}

export { TablesConfig, Artifact };
