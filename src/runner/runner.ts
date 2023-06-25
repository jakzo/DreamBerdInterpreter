import { Program } from "../parser/ast.js";
import { transpileToJs } from "./transpiler.js";

export interface Execution {}

export const execute = (ast: Program): Execution => run(transpileToJs(ast));

export const run = (transpiledJs: string): Execution => {
  // TODO
  return {};
};
