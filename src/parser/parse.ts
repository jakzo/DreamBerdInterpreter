import {
  Expression,
  Program,
  Statement,
  StatementEmpty,
  FunctionCall,
  StringLiteral,
  Identifier,
  StatementExpression,
  AnyAstNode,
} from "./ast.js";
import grammar from "./grammar.ohm-bundle.js";

type TempAstNode = AnyAstNode | Expression[] | StringChar;

interface StringChar {
  char: string;
}

const semantics = grammar.createSemantics().addOperation<TempAstNode>("ast", {
  Program(statements): Program {
    return new Program(
      statements.children
        .filter((statement) => statement.ctorName !== "eol")
        .map((statement) => statement.child(0).ast())
    );
  },
  StatementInner(type, end): StatementExpression {
    const base: Statement = end.ast();
    return new StatementExpression(
      base.precedence,
      base.printDebug,
      type.child(0).ast()
    );
  },
  EmptyStatement(end): StatementEmpty {
    const base: Statement = end.ast();
    return new StatementEmpty(base.precedence, base.printDebug);
  },
  statementEndExclamation(node): StatementEmpty {
    return new StatementEmpty(Math.max(node.numChildren, 1), false);
  },
  statementEndDebug(_node): StatementEmpty {
    return new StatementEmpty(1, true);
  },
  statementEndImplicit(_node): StatementEmpty {
    return new StatementEmpty(1, false);
  },
  FunctionCall(callee, _openParen, args, _closeParen): FunctionCall {
    return new FunctionCall(callee.ast(), args.child(0)?.ast() ?? []);
  },
  ExpressionList(head, _separators, tail): Expression[] {
    return [head.ast(), ...tail.children.map((child) => child.ast())];
  },
  stringLiteral(_openQuote, inner, _closeQuote): StringLiteral {
    return inner.ast();
  },
  stringContents(nodes): StringLiteral {
    const parts: string[] = [];
    for (const node of nodes.children) {
      const result = node.ast();
      if ("char" in result) {
        if (typeof parts[parts.length - 1] === "string") {
          parts[parts.length - 1] += result.char;
        } else {
          parts.push(result.char);
        }
      }
    }
    return new StringLiteral(parts);
  },
  stringChar(node): StringChar {
    return { char: node.sourceString };
  },
  identifier(chars): Identifier {
    return new Identifier(chars.sourceString);
  },
});

export const parse = (source: string): Program => {
  const tempAst = semantics(grammar.match(source)).ast();
  return tempAst;
};
