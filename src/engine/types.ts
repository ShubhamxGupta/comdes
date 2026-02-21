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

export type ParserType = "LL1" | "LR0" | "SLR1" | "CLR1" | "LALR1";

export interface LRItem {
  lhs: string;
  rhs: string[];
  dotIndex: number; // 0 means before first symbol
  lookahead?: string[]; // For CLR/LALR
}

export interface LRState {
  id: number;
  items: LRItem[];
  transitions: Record<string, number>; // symbol -> nextStateId
}

export interface CanonicalCollection {
  states: LRState[];
  startStateId: number;
}

export interface LRTable {
  action: { [stateId: number]: { [symbol: string]: string } };
  goto: { [stateId: number]: { [nonTerminal: string]: number } };
}
// Alias for backwards compatibility
export type SLRTable = LRTable;
