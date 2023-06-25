export type AnyAstNode = Program | AnyStatement | AnyExpression;

export abstract class AstNode {
  abstract type: string;
}

export class Program extends AstNode {
  type = "Program" as const;
  constructor(public statements: AnyStatement[]) {
    super();
  }
}

export type AnyStatement = StatementEmpty | StatementExpression;
export abstract class Statement extends AstNode {
  constructor(public precedence: number, public printDebug: boolean) {
    super();
  }
}
export class StatementEmpty extends Statement {
  type = "StatementEmpty" as const;
  constructor(precedence: number, printDebug: boolean) {
    super(precedence, printDebug);
  }
}
export class StatementExpression extends Statement {
  type = "StatementExpression" as const;
  constructor(
    precedence: number,
    printDebug: boolean,
    public expression: AnyExpression
  ) {
    super(precedence, printDebug);
  }
}

export type AnyExpression = FunctionCall | StringLiteral | Identifier;
export abstract class Expression extends AstNode {}
export class FunctionCall extends Expression {
  type = "FunctionCall" as const;
  constructor(public callee: AnyExpression, public args: AnyExpression[]) {
    super();
  }
}
export class StringLiteral extends Expression {
  type = "StringLiteral" as const;
  constructor(public parts: (string | AnyExpression)[]) {
    super();
  }
}
export class Identifier extends Expression {
  type = "Identifier" as const;
  constructor(public name: string) {
    super();
  }
}
