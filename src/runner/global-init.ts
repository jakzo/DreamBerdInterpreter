import { parseExpression } from "@babel/parser";

export const getGlobalInitBabelAst = () => {
  const globalInit = () => {
    const global = (function (this: any) {
      return this;
    })();
    global.db = {
      vars: new Map<string, {}>(),
      getVar(name: string) {},
    };
  };

  return parseExpression(globalInit.toString());
};
