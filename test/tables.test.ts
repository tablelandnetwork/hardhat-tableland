import { strictEqual } from "assert";
import { join, resolve } from "path";
import { describe, test } from "mocha";
import { getAccounts, getConnection } from "@tableland/local";
import { init } from "../src/tables";
import { TablesConfig } from "../src/tables";
// import { table } from "../test/gen/tables";

const config: TablesConfig = {
  gen: {
    onCreateTables: false,
    path: join(resolve("./"), "test", "gen"),
  },
  definitions: {
    people: {
      schema: "first_name text, last_name text, age integer",
    },
    places: {
      schema: "name text, lon integer, lat integer",
    },
  },
};

describe("framework", function () {
  const [, signer] = getAccounts();
  const sdk = getConnection(signer);
  const fw = init(sdk);

  test("process table config", async function () {
    this.timeout(20000);
    const res = await fw.tables.processTablesConfig(config);
    strictEqual(res.length, 2);
    strictEqual(res[0].prefix, "people");
    strictEqual(res[1].prefix, "places");
  });
  // test("table", async () => {
  //   await gen(config);
  //   const name = table("people", sdk).prefix;
  //   strictEqual(name, "people");
  // });
});
