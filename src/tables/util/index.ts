import { PathLike, constants } from "fs";
import { access } from "fs/promises";

export async function exists(path: PathLike): Promise<boolean> {
  return await access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
