import { Grammar, Production } from "./types";

/**
 * Parses raw input string into a structured Grammar object.
 * Supports:
 * - "S -> A | B" format
 * - "S -> epsilon" or "S -> ε" for empty productions
 */
export function parseGrammar(input: string): Grammar {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const productions: Production[] = [];
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = "";

  for (const line of lines) {
    // Support both "->" and ":" as assignment operators
    const assignmentOperator = line.includes("->")
      ? "->"
      : line.includes(":")
        ? ":"
        : null;
    if (!assignmentOperator) continue;

    const parts = line.split(assignmentOperator);
    if (parts.length < 2) continue; // Malformed line

    const lhs = parts[0].trim();
    if (!lhs) continue; // Missing LHS
    if (!startSymbol) startSymbol = lhs;
    nonTerminals.add(lhs);

    const rhss = parts[1].split("|").map((r) => r.trim());

    for (const rhs of rhss) {
      if (rhs === "ε" || rhs.toLowerCase() === "epsilon") {
        productions.push({ lhs, rhs: ["ε"] });
        terminals.add("ε");
      } else {
        // Split by space for tokenization
        // e.g. "A B c" -> ["A", "B", "c"]
        const tokens = rhs.split(/\s+/);
        productions.push({ lhs, rhs: tokens });
        tokens.forEach((t) => {
          // Temporarily add everything to terminals, will filter later
          if (t !== "ε") terminals.add(t);
        });
      }
    }
  }

  // Filter out terminal tokens that are actually non-terminals
  nonTerminals.forEach((nt) => terminals.delete(nt));

  // If a user types a grammar but it fails to parse anything valid, throw an error
  if (productions.length === 0) {
    throw new Error(
      "No valid production rules found. Please check your grammar syntax.",
    );
  }

  return {
    productions,
    nonTerminals,
    terminals,
    startSymbol,
  };
}
