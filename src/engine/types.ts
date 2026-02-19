export interface Production {
  lhs: string;
  rhs: string[]; // e.g. ["E", "+", "T"]
}

export interface Grammar {
  productions: Production[];
  nonTerminals: Set<string>;
  terminals: Set<string>;
  startSymbol: string;
}

export interface ParsingTable {
  [nonTerminal: string]: {
    [terminal: string]: Production[];
  };
}

export interface ParsingStep {
  stack: string[];
  input: string[];
  action: string;
  explanation?: string;
}

export type GrammarType = "LL1" | "LR0" | "SLR1" | "CLR1" | "LALR1";
