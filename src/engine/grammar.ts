import { Grammar, Production } from './types';

/**
 * Parses raw input string into a structured Grammar object.
 * Supports:
 * - "S -> A | B" format
 * - "S -> epsilon" or "S -> ε" for empty productions
 */
export function parseGrammar(input: string): Grammar {
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const productions: Production[] = [];
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = '';

  for (const line of lines) {
    // Basic regex for "NonTerminal -> production1 | production2"
    // This is a naive implementation, will be enhanced.
    const parts = line.split('->');
    if (parts.length !== 2) continue;

    const lhs = parts[0].trim();
    if (!startSymbol) startSymbol = lhs;
    nonTerminals.add(lhs);

    const rhss = parts[1].split('|').map(r => r.trim());
    
    for (const rhs of rhss) {
      if (rhs === 'ε' || rhs.toLowerCase() === 'epsilon') {
        productions.push({ lhs, rhs: ['ε'] });
        terminals.add('ε');
      } else {
        // Split by space for tokenization
        // e.g. "A B c" -> ["A", "B", "c"]
        const tokens = rhs.split(/\s+/);
        productions.push({ lhs, rhs: tokens });
        tokens.forEach(t => {
          // Temporarily add everything to terminals, will filter later
          if (t !== 'ε') terminals.add(t); 
        });
      }
    }
  }

  // Refine terminals: Remove non-terminals from the set
  nonTerminals.forEach(nt => terminals.delete(nt));

  return {
    productions,
    nonTerminals,
    terminals,
    startSymbol,
  };
}
