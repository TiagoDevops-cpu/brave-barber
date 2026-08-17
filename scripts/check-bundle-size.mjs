import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const maxJavaScriptBytes = 350 * 1024;
const assetsDirectory = join(process.cwd(), "dist", "assets");
const files = await readdir(assetsDirectory);

for (const file of files.filter((name) => name.endsWith(".js"))) {
  const filePath = join(assetsDirectory, file);
  const { size } = await stat(filePath);
  if (size > maxJavaScriptBytes) {
    throw new Error(
      `Performance budget exceeded: ${file} is ${size} bytes (maximum ${maxJavaScriptBytes}).`,
    );
  }
}
