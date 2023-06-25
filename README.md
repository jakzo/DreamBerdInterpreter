> 🚧 Work in progress. Will probably never finish. 🚧

An interpreter for the DreamBerd language based on the [official specification](https://github.com/TodePond/DreamBerd).

See the [official repository](https://github.com/TodePond/DreamBerd) for instructions on how to write DreamBerd programs.

## Usage

Install [Node.js](https://nodejs.org/) then run:

```sh
npx dreamberd ./my-program.db
```

## Assumptions

In some cases, the specification is ambiguous or undefined. For these the interpreter tries to follow the "spirit of the language" and implement what would be expected. Below are listed some of these assumptions.

### Expression whitespace

DreamBerd supports grouping of subexpressions by whitespace, effectively eliminating the need for parentheses by writing higher precedence subexpressions more compactly with less whitespace and lower precedence subexpressions with more whitespace like so:

```dreamberd
1+2 * 3+4
// => (1+2) * (3+4)
```

To approximate which subexpression looks closer, the algorithm in pseudo-code is:

- Each operator in the expression has a `left_score` and a `right_score`
- `left_score = spaces_left + spaces_right/2`
- `right_score = spaces_left/2 + spaces_right`
  - Where `spaces_left` is the number of space characters immediately to the left of the operator (and similar for `spaces_right`)
- For each operator `op`:
  - Iterate leftwards through the operators to `op`'s left until reaching an operator where `other_op.left_score > op.right_score`
    - Insert implicit open-parentheses starting after `other_op`
    - If the start of the expression is reached and there are no more operators, the implicit open-parentheses is added at the start of the expression
  - Then do the same rightwards, iterating through operators on the right until finding one where `other_op.right_score > op.left_score` and insert implicit close-parentheses
- When there are no parentheses (implicit or explicit) around a subexpression, typical operator precedence applies (`*/` then `+-`, etc.)

Here is an example of the algorithm in action:

```dreamberd
5   *   1+2 * 3+4*5  /  6 +7 * 8 +9
// 4.5   0 1.5 0 0   3    1 1.5  1    // <- operator left_score
// 4.5   0 1.5 0 0   3   0.51.5 0.5   // <- operator right_score
// (5   *   (((1+2) * ((3+4*5)))  /  ((6 +7) * (8 +9))))   // <- result
```

### General syntax and semantics

The language appears to be based on JavaScript and as such inherits a lot of its semantics and built-in types, methods, etc.

Syntax not fully defined in the specification matches JavaScript as well but only a subset of it is implemented for simplicity.
