import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { Connection } from "@tableland/sdk";
import { exists } from "../util";
import { configDir } from "../config-dir";

const artifactsDir = join(configDir, "tables");

async function main() {
  if (!(await exists(artifactsDir))) {
    await mkdir(artifactsDir, { recursive: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export interface TableConfig {
  schema: string;
}

export interface TablesConfig {
  gen: {
    onCreateTables: boolean;
    path: string;
  };
  definitions: {
    [key: string]: TableConfig;
  };
}

export interface Artifact {
  name: string;
  prefix: string;
  chainId: number;
  tableId: string;
  schema: string;
  structureHash: string;
  txnHash: string;
  blockNumber: number;
}

export async function processConfig(
  tablesConfig: TablesConfig,
  connection: Connection
): Promise<Artifact[]> {
  const tasks = Object.entries(tablesConfig.definitions).map(
    async ([prefix, tableConfig]) => {
      return await processTableConfig(prefix, tableConfig, connection);
    }
  );
  const artifacts = await Promise.all(tasks);
  if (tablesConfig.gen.onCreateTables) {
    await gen(tablesConfig);
  }
  return artifacts;
}

async function processTableConfig(
  prefix: string,
  tableConfig: TableConfig,
  connection: Connection
): Promise<Artifact> {
  const artifactPath = join(
    artifactsDir,
    `${prefix}_${connection.options.chain}.json`
  );
  const { structureHash } = await connection.hash(tableConfig.schema, {
    prefix,
  });
  if (await exists(artifactPath)) {
    const b = await readFile(artifactPath);
    const artifact: Artifact = JSON.parse(b.toString());
    if (
      artifact.prefix === prefix &&
      artifact.structureHash === structureHash
    ) {
      return artifact;
    }
  }
  const {
    name,
    chainId,
    tableId,
    txnHash,
    blockNumber,
  } = await connection.create(tableConfig.schema, { prefix });
  const artifcat: Artifact = {
    name: name ?? "",
    prefix,
    chainId,
    tableId: tableId?.toString() ?? "",
    schema: tableConfig.schema,
    structureHash,
    txnHash,
    blockNumber,
  };
  await writeFile(artifactPath, JSON.stringify(artifcat, null, 2));
  return artifcat;
}

export async function gen(config: TablesConfig): Promise<void> {
  const artifacts = new Map<string, Map<string, Artifact>>();
  const prefixes = new Array<string>();
  const chains = new Array<string>();
  for (const file of await readdir(artifactsDir)) {
    const b = await readFile(join(artifactsDir, file));
    const chain = file.split("_").at(-1)?.split(".").at(0);
    if (!chain) {
      throw new Error("failed to parse chain name from file name.");
    }

    const artifact: Artifact = JSON.parse(b.toString());
    if (!artifacts.has(chain)) {
      artifacts.set(chain, new Map<string, Artifact>());
      chains.push(chain);
    }
    artifacts.get(chain)?.set(artifact.prefix, artifact);
    if (!prefixes.includes(artifact.prefix)) {
      prefixes.push(artifact.prefix);
    }
  }

  const out = `${genHeader()}

${genPrefixType(prefixes)}
${genChainType(chains)}

${genTables(artifacts)}

${genTableFunc()}

`;

  if (!(await exists(config.gen.path))) {
    await mkdir(config.gen.path);
  }
  await writeFile(join(config.gen.path, "tables.ts"), out);
}

function genHeader(): string {
  return `
// This file was generated by @tableland/framework, so don't edit it!

export interface Table {
  name: string;
  prefix: string;
  chainId: number;
  tableId: string;
  schema: string;
  structureHash: string;
  txnHash: string;
  blockNumber: number;
}`;
}

function genPrefixType(prefixes: string[]): string {
  const exp = prefixes.map((prefix) => `"${prefix}"`).join(" | ");
  return `export type Prefix = ${exp};`;
}

function genChainType(chains: string[]): string {
  const exp = chains.map((chain) => `"${chain}"`).join(" | ");
  return `export type Chain = ${exp};`;
}

function genTables(artifacts: Map<string, Map<string, Artifact>>): string {
  const res = Array.from(artifacts)
    .map(([chain, tables]) => genChain(chain, tables))
    .join("\n");

  return `export const tables: Record<Chain, Record<Prefix, Table>> = {
${res}
};`;
}

function genChain(chain: string, tables: Map<string, Artifact>): string {
  chain = chain.includes("-") ? `"${chain}"` : chain;
  const res = Array.from(tables)
    .map(([prefix, artifact]) => genTable(prefix, artifact))
    .join("\n");

  return `  ${chain}: {
${res}
  },`;
}

function genTable(prefix: string, artifact: Artifact): string {
  prefix = prefix.includes("-") ? `"${prefix}"` : prefix;
  return `    ${prefix}: {
      name: "${artifact.name}",
      prefix: "${artifact.prefix}",
      chainId: ${artifact.chainId},
      tableId: "${artifact.tableId}",
      schema: "${artifact.schema}",
      structureHash: "${artifact.structureHash}",
      txnHash: "${artifact.txnHash}",
      blockNumber: ${artifact.blockNumber},
    },`;
}

function genTableFunc(): string {
  return `export function table(prefix: Prefix, chain: Chain): Table {
  const chainData = tables[chain];
  if (chainData === undefined) {
    throw new Error(\`no \${prefix} tables tracked for chain \${chain}\`);
  }
  return chainData[prefix];
}`;
}
