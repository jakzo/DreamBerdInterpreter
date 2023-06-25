import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { watch } from "chokidar";

const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url));
const OHM_GRAMMAR_GLOB = path.join(ROOT_DIR, "src", "**", "*.ohm");

const recompileGrammarOnChange = () => {
  watch(OHM_GRAMMAR_GLOB).on("all", () => {
    spawn("npm", ["run", "grammar:generate"], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
  });
};

export default recompileGrammarOnChange;
