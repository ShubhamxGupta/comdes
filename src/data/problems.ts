export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  grammar: string;
  testInput: string;
  tags: string[];
  recommendedSolver: "Syntax" | "Semantic" | "ICG";
}

export const problems: PracticeProblem[] = [
  {
    id: "basic-arithmetic",
    title: "Basic Arithmetic",
    description:
      "A standard grammar for arithmetic expressions mapping addition and multiplication.",
    difficulty: "Easy",
    grammar: "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id",
    testInput: "id + id * id",
    tags: ["Left-Recursive", "Ambiguous"],
    recommendedSolver: "Syntax",
  },
  {
    id: "dangling-else",
    title: "The Dangling Else",
    description:
      "The classic ambiguous grammar simulating conditional programming statements.",
    difficulty: "Medium",
    grammar: "S -> i E t S | i E t S e S | a\nE -> b",
    testInput: "i b t i b t a e a",
    tags: ["Ambiguous", "Shift/Reduce"],
    recommendedSolver: "Syntax",
  },
  {
    id: "palindromes",
    title: "Palindromes",
    description:
      "A simple context-free grammar that generates odd-length palindromes.",
    difficulty: "Easy",
    grammar: "S -> a S a | b S b | c",
    testInput: "a b c b a",
    tags: ["Context-Free", "LL(1)"],
    recommendedSolver: "Syntax",
  },
  {
    id: "sdt-calculator",
    title: "SDT: Desktop Calculator",
    description:
      "Evaluate mathematical expressions dynamically using Syntax-Directed Translation actions.",
    difficulty: "Medium",
    grammar:
      "E -> E + T { $1 + $3 }\nE -> E - T { $1 - $3 }\nE -> T { $1 }\nT -> T * F { $1 * $3 }\nT -> T / F { $1 / $3 }\nT -> F { $1 }\nF -> ( E ) { $2 }\nF -> num { parseFloat($1) }",
    testInput: "num + num * num",
    tags: ["SDT", "Evaluation", "LALR(1)"],
    recommendedSolver: "Semantic",
  },
  {
    id: "sdt-binary",
    title: "SDT: Binary to Decimal",
    description:
      "Convert a binary fractional string into its decimal equivalent via synthesized attributes.",
    difficulty: "Hard",
    grammar:
      "N -> L . L { $1 + $3 / Math.pow(2, $3.toString().length) }\nN -> L { $1 }\nL -> L B { $1 * 2 + $2 }\nL -> B { $1 }\nB -> 0 { 0 }\nB -> 1 { 1 }",
    testInput: "1 0 1 . 1 1",
    tags: ["SDT", "Synthesized Attributes"],
    recommendedSolver: "Semantic",
  },
  {
    id: "operator-precedence",
    title: "Strict Operator Precedence",
    description:
      "A heavily nested unambiguous grammar forcing explicit operator precedence climbing.",
    difficulty: "Medium",
    grammar:
      "Expr -> Expr || Term1 | Term1\nTerm1 -> Term1 && Term2 | Term2\nTerm2 -> Term2 == Term3 | Term3\nTerm3 -> Term3 + Term4 | Term3 - Term4 | Term4\nTerm4 -> Term4 * Factor | Term4 / Factor | Factor\nFactor -> ! Factor | ( Expr ) | id | num",
    testInput: "id == num && ! ( id || id )",
    tags: ["Unambiguous", "Precedence", "Deep Recursion"],
    recommendedSolver: "Syntax",
  },
  {
    id: "json-parser",
    title: "Mini JSON Validator",
    description:
      "A structurally complex grammar simulating the validation of JSON objects and arrays.",
    difficulty: "Hard",
    grammar:
      "Value -> Object | Array | string | number | true | false | null\nObject -> { Members } | { }\nMembers -> Pair , Members | Pair\nPair -> string : Value\nArray -> [ Elements ] | [ ]\nElements -> Value , Elements | Value",
    testInput: "{ string : [ number , true ] }",
    tags: ["Context-Free", "Data Structures", "LL(1)"],
    recommendedSolver: "Syntax",
  },
  {
    id: "eps-closure",
    title: "Epsilon Transitions",
    description:
      "A grammar demonstrating the mathematical challenges of evaluating epsilon derivations causing reduce/reduce conflicts.",
    difficulty: "Hard",
    grammar: "S -> A a A b | B b B a\nA -> ε\nB -> ε",
    testInput: "a b",
    tags: ["Epsilon", "LALR(1)", "Conflicts"],
    recommendedSolver: "Syntax",
  },
  {
    id: "icg-arithmetic",
    title: "ICG: Arithmetic Expression",
    description:
      "Generate three-address code for basic arithmetic expressions with named variables.",
    difficulty: "Easy",
    grammar:
      "E -> E + T { $$ = $1 + $3 }\nE -> T { $$ = $1 }\nT -> T * F { $$ = $1 * $3 }\nT -> F { $$ = $1 }\nF -> ( E ) { $$ = $2 }\nF -> id { $$ = $1 }",
    testInput: "id:a + id:b * id:c",
    tags: ["ICG", "TAC", "Arithmetic"],
    recommendedSolver: "ICG",
  },
  {
    id: "icg-complex-expr",
    title: "ICG: Nested Expression",
    description:
      "Generate TAC for a complex nested expression with parentheses demonstrating temporary variable chains.",
    difficulty: "Medium",
    grammar:
      "E -> E + T { $$ = $1 + $3 }\nE -> E - T { $$ = $1 - $3 }\nE -> T { $$ = $1 }\nT -> T * F { $$ = $1 * $3 }\nT -> T / F { $$ = $1 / $3 }\nT -> F { $$ = $1 }\nF -> ( E ) { $$ = $2 }\nF -> id { $$ = $1 }",
    testInput: "id:x + id:y * ( id:z - id:w )",
    tags: ["ICG", "TAC", "Complex"],
    recommendedSolver: "ICG",
  },
];
