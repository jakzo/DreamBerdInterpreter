import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import util from "util";
import { describe, test } from "vitest";
// import { toAST } from "ohm-js/extras";
// import grammar from "../parser/grammar.ohm-bundle.js";
import { parse } from "../parser/parse.js";
import { transpileToJs } from "../runner/transpiler.js";

const fixturesDir = fileURLToPath(new URL("../__fixtures__", import.meta.url));

for (const dirName of await fs.readdir(fixturesDir)) {
  const dir = path.join(fixturesDir, dirName);
  const expectToFail = dirName.endsWith("failure");
  const filenames = await fs.readdir(dir);

  describe(dirName, () => {
    for (const filename of filenames) {
      if (!filename.endsWith(".db")) continue;

      test(filename, async () => {
        const contents = await fs.readFile(path.join(dir, filename), "utf-8");

        const tryParse = () => {
          try {
            return parse(contents);
          } catch (err) {
            if (expectToFail) return undefined;
            throw err;
          }
        };

        const ast = tryParse();
        if (expectToFail && ast)
          throw new Error("Expected to fail but succeeded instead");
        if (!ast) return;

        // console.log(
        //   util.inspect(toAST(grammar.match(contents)), false, Infinity, true)
        // );
        console.log(util.inspect(ast, false, Infinity, true));

        const transpiled = transpileToJs(ast);
        console.log("=== transpiled", transpiled);
      });
    }
  });
}
