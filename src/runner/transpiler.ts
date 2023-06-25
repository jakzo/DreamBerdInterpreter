import t, { program } from "@babel/types";
import generator from "@babel/generator";
import template from "@babel/template";
import * as Ast from "../parser/ast.js";

const globalInit = template.default(`
const global = (function (this) { return this; })();
global.db = {
  vars: new Map(),
  getVar(name) {},
};
`);

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

export const transpileToJs = (ast: Ast.Program): string => {
  const state = {
    scopeId: 0,
  };

  const scopeInit = () => {
    state.scopeId++;
    return [
      t.variableDeclaration("const", [
        t.variableDeclarator(
          t.identifier("scopeId"),
          t.numericLiteral(state.scopeId)
        ),
        t.variableDeclarator(
          t.identifier(`vars${state.scopeId}`),
          t.newExpression(t.identifier("Map"), [])
        ),
      ]),
    ];
  };

  const scopeDeinit = () => {
    state.scopeId--;
  };

  const visitProgram = (node: Ast.Program) => {
    const scope = scopeInit();
    const program = t.program([
      ...scope,
      ...node.statements.map(visitStatement),
    ]);
    scopeDeinit();
    return program;
  };

  const visitStatement = (node: Ast.AnyStatement) => {
    switch (node.type) {
      case "StatementExpression":
        return t.expressionStatement(visitExpression(node.expression));
      case "StatementEmpty":
        return t.emptyStatement();
    }
    throw expectNever(node);
  };

  const visitExpression = (node: Ast.AnyExpression) => {
    switch (node.type) {
      case "FunctionCall": {
        const args: Parameters<typeof t.callExpression> = [
          visitExpression(node),
          node.args.map(visitExpression),
        ];
        return t.callExpression(...args);
      }
      case "Identifier":
        return t.identifier(`i_${node.name}`);
      case "StringLiteral": {
        const quasis: t.TemplateElement[] = [];
        const expressions: t.Expression[] = [];
        let i = 0;
        while (i < node.parts.length) {
          let str = "";
          while (i < node.parts.length && typeof node.parts[i] === "string") {
            str += node.parts[i++];
          }
          quasis.push(t.templateElement({ raw: str }));

          const part = node.parts[i];
          if (part && typeof part !== "string") {
            expressions.push(visitExpression(part));
            i++;
          }
        }
        while (quasis.length <= expressions.length) {
          quasis.push(t.templateElement({ raw: "" }));
        }
        return t.templateLiteral(quasis, expressions);
      }
    }
    throw expectNever(node);
  };

  const babelAst = visitProgram(ast);
  return generator.default(babelAst).code;
};

const expectNever = (_value: never) => new Error("Unknown node encountered");
