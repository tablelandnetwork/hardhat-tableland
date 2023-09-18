import { assert, expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { useEnvironment } from "./helpers";

use(chaiAsPromised);

describe("Integration tests", function () {
  this.timeout(30000);
  describe("Hardhat Runtime Environment local tableland extension", function () {
    useEnvironment("hardhat-project");
    it("Should add the local tableland field", function () {
      assert.typeOf(this.hre.localTableland, "object");
    });
    it("local tableland should start", async function () {
      await expect(this.hre.localTableland.start()).to.be.fulfilled;
    });
    it("local tableland should stop", async function () {
      await expect(this.hre.localTableland.stop()).to.be.fulfilled;
    });
  });
  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");
    it("Should add localTableland to the config", function () {
      assert.isDefined(this.hre.config.localTableland);
    });
  });
});
