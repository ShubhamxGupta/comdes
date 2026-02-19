import { Grammar, Production, ParsingTable, ParsingStep } from '../types';
import { FirstFollowSets } from '../sets';

export interface LL1TableResult {
  table: ParsingTable;
  conflicts: string[]; // List of conflicts found
}

/**
 * Builds an LL(1) Parsing Table.
 */
export function buildLL1Table(
  grammar: Grammar,
  firstSets: FirstFollowSets,
  followSets: FirstFollowSets
): LL1TableResult {
  const table: ParsingTable = {};
  const conflicts: string[] = [];

  // Initialize table
  for (const nt of grammar.nonTerminals) {
    table[nt] = {};
  }

  for (const prod of grammar.productions) {
    const A = prod.lhs;
    const alpha = prod.rhs;

    // Calculate FIRST(alpha)
    const firstAlpha = new Set<string>();
    let allNullable = true;
    for (const sym of alpha) {
        if (grammar.terminals.has(sym)) {
            firstAlpha.add(sym);
            allNullable = false;
            break;
        } else if (grammar.nonTerminals.has(sym)) {
            const f = firstSets.get(sym);
            if (f) {
                f.forEach(t => { if (t !== 'ε') firstAlpha.add(t); });
                if (!f.has('ε')) {
                    allNullable = false;
                    break;
                }
            }
        } else if (sym === 'ε') {
            // Epsilon
        }
    }
    if (allNullable) firstAlpha.add('ε');

    // Rule 1: For each a in FIRST(alpha), add A -> alpha to M[A, a]
    for (const a of firstAlpha) {
      if (a !== 'ε') {
        if (table[A][a]) {
          // Conflict: Multiple entries
          conflicts.push(`Conflict at M[${A}, ${a}]: Existing entry ${formatProd(table[A][a][0])}, trying to add ${formatProd(prod)}`);
          table[A][a].push(prod);
        } else {
            table[A][a] = [prod];
        }
      }
    }

    // Rule 2: If epsilon is in FIRST(alpha), add A -> alpha to M[A, b] for each b in FOLLOW(A)
    if (firstAlpha.has('ε')) {
      const followA = followSets.get(A);
      if (followA) {
        for (const b of followA) {
          if (table[A][b]) {
             // Conflict
             // Only report unique conflicts if needed, or push all
             // Often we check if it already contains the exact same production to avoid duplicates, 
             // but here we are adding a DIFFERENT production usually (A -> alpha where alpha is nullable) versus some other production.
             // Actually, if we have A -> alpha and A -> beta, and both First(alpha) and First(beta) contain 'a', that's a First/First conflict (handled above).
             // This is usually First/Follow conflict.
             const existing = table[A][b];
             if (!existing.some(p => p.lhs === prod.lhs && JSON.stringify(p.rhs) === JSON.stringify(prod.rhs))) {
                 conflicts.push(`Conflict at M[${A}, ${b}]: Existing entry ${formatProd(existing[0])}, trying to add ${formatProd(prod)}`);
                 existing.push(prod);
             }
          } else {
             table[A][b] = [prod];
          }
        }
      }
    }
  }

  return { table, conflicts };
}

function formatProd(p: Production): string {
    return `${p.lhs} -> ${p.rhs.join(' ')}`;
}
