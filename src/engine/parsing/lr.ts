import { Grammar, Production } from '../types';
import { FirstFollowSets } from '../sets';

export interface Item {
  production: Production;
  dotPosition: number;
  lookahead?: string; // For CLR/LALR
}

export class ItemSet {
  items: Item[];
  id: number;
  transitions: Map<string, number>; // symbol -> next state ID

  constructor(id: number, items: Item[]) {
    this.id = id;
    this.items = items;
    this.transitions = new Map();
  }

  // Simplified compare for uniqueness
  get key(): string {
    return this.items
      .map(i => `${i.production.lhs}->${i.production.rhs.join('')}.${i.dotPosition}|${i.lookahead || ''}`)
      .sort()
      .join('::');
  }
}

export class CanonicalCollection {
  states: ItemSet[];
  
  constructor() {
    this.states = [];
  }

  addState(state: ItemSet) {
    this.states.push(state);
  }
}

/**
 * Computes Closure of a set of items (LR(0)).
 */
export function closureLR0(items: Item[], grammar: Grammar): Item[] {
  const result = [...items];
  let changed = true;

  while (changed) {
    changed = false;
    for (const item of result) {
      if (item.dotPosition >= item.production.rhs.length) continue;
      
      const symbolAfterDot = item.production.rhs[item.dotPosition];
      if (grammar.nonTerminals.has(symbolAfterDot)) {
        // Add all productions for this non-terminal
        // B -> . gamma
        const productions = grammar.productions.filter(p => p.lhs === symbolAfterDot);
        for (const p of productions) {
            // Check if already exists (LR0 doesn't care about lookahead)
            if (!result.some(existing => existing.production === p && existing.dotPosition === 0 && !existing.lookahead)) {
                result.push({ production: p, dotPosition: 0 });
                changed = true;
            }
        }
      }
    }
  }
  return result;
}

/**
 * Computes Goto(I, X)
 */
export function gotoLR0(items: Item[], symbol: string, grammar: Grammar): Item[] {
  const movedItems: Item[] = [];
  
  for (const item of items) {
     if (item.dotPosition < item.production.rhs.length && item.production.rhs[item.dotPosition] === symbol) {
         movedItems.push({
             production: item.production,
             dotPosition: item.dotPosition + 1,
             lookahead: item.lookahead
         });
     }
  }
  
  return closureLR0(movedItems, grammar); // Note: closure type depends on LR type
}

/**
 * Main function to build LR(0) Canonical Collection
 */
export function buildLR0Collection(grammar: Grammar): CanonicalCollection {
    const cc = new CanonicalCollection();
    // Augmented grammar S' -> .S
    const augmentedProd: Production = { lhs: grammar.startSymbol + "'", rhs: [grammar.startSymbol] };
    const startItem: Item = { production: augmentedProd, dotPosition: 0 };
    
    const startState = new ItemSet(0, closureLR0([startItem], grammar));
    cc.addState(startState);
    
    const processingQueue = [startState];
    let stateCounter = 1;
    
    // Naive implementation loop
    // In real app, we need to handle "equivalent states" check strictly
    
    return cc;
}
