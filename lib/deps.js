export {resolve, join, extname, dirname} from "path";
export {createHash} from "crypto";
import fs from "fs/promises";
function getFileInfoType(fileInfo) {
  return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymbolicLink ? "symlink" : void 0;
}
export async function ensureDir(dir) {
  try {
    const fileInfo = await fs.lstat(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dir, {recursive: true});
      return;
    }
    throw err;
  }
}
export async function exists(filePath) {
  try {
    await fs.lstat(filePath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}
