import { Grammar } from "./types";

export type TokenSet = Set<string>;
export type FirstFollowSets = Map<string, TokenSet>;

/**
 * Computes FIRST sets for all non-terminals in the grammar.
 */
export function computeFirstSets(grammar: Grammar): FirstFollowSets {
  const firstSets: FirstFollowSets = new Map();

  // Initialize empty sets
  for (const nt of grammar.nonTerminals) {
    firstSets.set(nt, new Set());
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of grammar.productions) {
      const lhs = prod.lhs;
      const rhs = prod.rhs;

      // If X -> epsilon, add epsilon to FIRST(X)
      if (rhs.length === 1 && rhs[0] === "ε") {
        if (!firstSets.get(lhs)?.has("ε")) {
          firstSets.get(lhs)?.add("ε");
          changed = true;
        }
        continue;
      }

      // If X -> Y1 Y2 ... Yk
      let allNullable = true;
      for (const symbol of rhs) {
        // If symbol is terminal, add to FIRST(X) and break
        if (grammar.terminals.has(symbol)) {
          if (!firstSets.get(lhs)?.has(symbol)) {
            firstSets.get(lhs)?.add(symbol);
            changed = true;
          }
          allNullable = false;
          break;
        }

        // If symbol is non-terminal, add FIRST(symbol) - {epsilon} to FIRST(X)
        const symbolFirst = firstSets.get(symbol);
        if (symbolFirst) {
          for (const token of symbolFirst) {
            if (token !== "ε" && !firstSets.get(lhs)?.has(token)) {
              firstSets.get(lhs)?.add(token);
              changed = true;
            }
          }
          // If Y1 is not nullable, stop
          if (!symbolFirst.has("ε")) {
            allNullable = false;
            break;
          }
        }
      }

      // If all symbols in RHS are nullable, add epsilon to FIRST(X)
      if (allNullable) {
        if (!firstSets.get(lhs)?.has("ε")) {
          firstSets.get(lhs)?.add("ε");
          changed = true;
        }
      }
    }
  }

  return firstSets;
}

/**
 * Computes FOLLOW sets for all non-terminals.
 */
export function computeFollowSets(
  grammar: Grammar,
  firstSets: FirstFollowSets,
): FirstFollowSets {
  const followSets: FirstFollowSets = new Map();

  // Initialize
  for (const nt of grammar.nonTerminals) {
    followSets.set(nt, new Set());
  }

  // Rule 1: Place $ in FOLLOW(Start Symbol)
  followSets.get(grammar.startSymbol)?.add("$");

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of grammar.productions) {
      const rhs = prod.rhs;

      for (let i = 0; i < rhs.length; i++) {
        const symbol = rhs[i];
        if (!grammar.nonTerminals.has(symbol)) continue;

        const currentFollow = followSets.get(symbol)!;
        const remainingRhs = rhs.slice(i + 1);

        // Calculate FIRST(remainingRhs)
        const firstOfRemaining = new Set<string>();
        let allRemainingNullable = true;

        if (remainingRhs.length === 0) {
          // End of production
        } else {
          for (const nextSym of remainingRhs) {
            if (grammar.terminals.has(nextSym)) {
              firstOfRemaining.add(nextSym);
              allRemainingNullable = false;
              break;
            } else if (grammar.nonTerminals.has(nextSym)) {
              const nextFirst = firstSets.get(nextSym)!;
              nextFirst.forEach((t) => {
                if (t !== "ε") firstOfRemaining.add(t);
              });
              if (!nextFirst.has("ε")) {
                allRemainingNullable = false;
                break;
              }
            } else if (nextSym === "ε") {
              // Epsilon production in RHS? Handling logic
            }
          }
        }

        // Rule 2: Add FIRST(beta) - {epsilon} to FOLLOW(B)
        // for A -> alpha B beta
        for (const f of firstOfRemaining) {
          if (!currentFollow.has(f)) {
            currentFollow.add(f);
            changed = true;
          }
        }

        // Rule 3: If A -> alpha B or A -> alpha B beta (where beta is nullable)
        // add FOLLOW(A) to FOLLOW(B)
        if (remainingRhs.length === 0 || allRemainingNullable) {
          const lhsFollow = followSets.get(prod.lhs)!;
          for (const f of lhsFollow) {
            if (!currentFollow.has(f)) {
              currentFollow.add(f);
              changed = true;
            }
          }
        }
      }
    }
  }

  return followSets;
}

/**
 * Computes the FIRST set for a sequence of symbols (like beta a).
 */
export function computeFirstForSequence(
  sequence: string[],
  grammar: Grammar,
  firstSets: FirstFollowSets,
): Set<string> {
  const result = new Set<string>();
  let allNullable = true;

  for (const sym of sequence) {
    if (grammar.terminals.has(sym)) {
      result.add(sym);
      allNullable = false;
      break;
    } else if (grammar.nonTerminals.has(sym)) {
      const f = firstSets.get(sym);
      if (f) {
        f.forEach((t) => {
          if (t !== "ε") result.add(t);
        });
        if (!f.has("ε")) {
          allNullable = false;
          break;
        }
      }
    } else if (sym === "ε") {
      // Ignore epsilon symbol inside a sequence unless it's the only one
    } else {
      // Must be a terminal (e.g. '$')
      result.add(sym);
      allNullable = false;
      break;
    }
  }

  if (allNullable) {
    result.add("ε");
  }

  return result;
}
