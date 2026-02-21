export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  grammar: string;
  testInput: string;
  tags: string[];
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
  },
  {
    id: "eps-closure",
    title: "Epsilon Transitions",
    description:
      "A grammar demonstrating the mathematical challenges of evaluating epsilon derivations.",
    difficulty: "Hard",
    grammar: "S -> A a A b | B b B a\nA -> ε\nB -> ε",
    testInput: "a b",
    tags: ["Epsilon", "LALR(1)"],
  },
];
