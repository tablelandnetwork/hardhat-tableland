import { join, resolve } from "path";
// import { mkdir } from "fs/promises";
// import { exists } from "../util";

export const configDir = join(resolve("./"), ".tableland");

// async function main() {
//   if (!(await exists(configDir))) {
//     await new Promise<void>((res) => setTimeout(() => res(), 2000));
//     await mkdir(configDir);
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
