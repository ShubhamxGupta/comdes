import { Grammar, Production } from "../types";
import { LRItem, LRState, CanonicalCollection, LRTable } from "../types";
import { FirstFollowSets, computeFirstForSequence } from "../sets";

/**
 * Creates the initial item for the augmented grammar.
 * S' -> S
 */
export function createAugmentedGrammar(grammar: Grammar): Grammar {
  const newStart = `${grammar.startSymbol}'`;
  // ensure unique
  let actualStart = newStart;
  while (
    grammar.nonTerminals.has(actualStart) ||
    grammar.terminals.has(actualStart)
  ) {
    actualStart += "'";
  }

  const newProduction: Production = {
    lhs: actualStart,
    rhs: [grammar.startSymbol],
  };

  return {
    ...grammar,
    startSymbol: actualStart,
    nonTerminals: new Set([...grammar.nonTerminals, actualStart]),
    productions: [newProduction, ...grammar.productions],
  };
}

function itemsEqual(a: LRItem, b: LRItem): boolean {
  if (
    a.lhs !== b.lhs ||
    a.dotIndex !== b.dotIndex ||
    a.rhs.length !== b.rhs.length
  )
    return false;
  for (let i = 0; i < a.rhs.length; i++) {
    if (a.rhs[i] !== b.rhs[i]) return false;
  }
  // Check lookaheads (for LR1)
  if (a.lookahead && b.lookahead) {
    if (a.lookahead.length !== b.lookahead.length) return false;
    const sortedA = [...a.lookahead].sort();
    const sortedB = [...b.lookahead].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  } else if (!a.lookahead && !b.lookahead) {
    return true;
  }
  return false;
}

function stateHasItem(stateItems: LRItem[], item: LRItem): boolean {
  return stateItems.some((existing) => itemsEqual(existing, item));
}

export function closure(items: LRItem[], grammar: Grammar): LRItem[] {
  const closureItems = [...items];
  let changed = true;

  while (changed) {
    changed = false;
    for (const item of closureItems) {
      if (item.dotIndex >= item.rhs.length) continue;

      const symbolAfterDot = item.rhs[item.dotIndex];
      if (grammar.nonTerminals.has(symbolAfterDot)) {
        // Expand non-terminal
        const productions = grammar.productions.filter(
          (p) => p.lhs === symbolAfterDot,
        );
        for (const prod of productions) {
          const newItem: LRItem = {
            lhs: prod.lhs,
            rhs: prod.rhs,
            dotIndex: 0,
          };

          // Handle epsilon: A -> epsilon becomes A -> . (dot at end effectively)
          // But in our array repr, epsilon is a symbol 'ε'.
          // If rhs is ['ε'], dot is before epsilon?
          // Standard convention: A -> . is valid.
          // If A -> epsilon, rhs is empty or Contains epsilon?
          // Our parser produces ['ε'] for epsilon productions.
          // If rhs is ['ε'], we treat it as empty.
          if (newItem.rhs.length === 1 && newItem.rhs[0] === "ε") {
            newItem.rhs = [];
          }

          if (!stateHasItem(closureItems, newItem)) {
            closureItems.push(newItem);
            changed = true;
          }
        }
      }
    }
  }
  return closureItems;
}

export function goto(
  items: LRItem[],
  symbol: string,
  grammar: Grammar,
): LRItem[] {
  const movedItems: LRItem[] = [];

  for (const item of items) {
    if (item.dotIndex >= item.rhs.length) continue;

    const symbolAfterDot = item.rhs[item.dotIndex];
    if (symbolAfterDot === symbol) {
      const newItem: LRItem = {
        lhs: item.lhs,
        rhs: item.rhs,
        dotIndex: item.dotIndex + 1,
      };
      movedItems.push(newItem);
    }
  }

  return closure(movedItems, grammar);
}

function statesEqual(a: LRItem[], b: LRItem[]): boolean {
  if (a.length !== b.length) return false;
  const formatItem = (i: LRItem) => {
    let rs = `${i.lhs}->${i.rhs.join("")}@${i.dotIndex}`;
    if (i.lookahead) {
      rs += `,` + [...i.lookahead].sort().join("/");
    }
    return rs;
  };
  const sigA = a.map(formatItem).sort().join("|");
  const sigB = b.map(formatItem).sort().join("|");
  return sigA === sigB;
}

export function buildCanonicalCollection(
  grammar: Grammar,
): CanonicalCollection {
  // 1. Augment Grammar
  const augmented = createAugmentedGrammar(grammar);

  // 2. Initial State
  const startProd = augmented.productions[0];
  const startItem: LRItem = {
    lhs: startProd.lhs,
    rhs: startProd.rhs,
    dotIndex: 0,
  };

  const startStateItems = closure([startItem], augmented);
  const startState: LRState = {
    id: 0,
    items: startStateItems,
    transitions: {},
  };

  const states: LRState[] = [startState];
  let stateCounter = 1;
  let changed = true;

  while (changed) {
    changed = false;
    // Iterate over current states (copy to avoid infinite loop issues if we append while iterating?)
    // Standard worklist algorithm is better.
    // Let's iterate by index
    for (let i = 0; i < states.length; i++) {
      const currentState = states[i];

      // Collect symbols after dots
      const symbols = new Set<string>();
      for (const item of currentState.items) {
        if (item.dotIndex < item.rhs.length) {
          symbols.add(item.rhs[item.dotIndex]);
        }
      }

      for (const symbol of symbols) {
        if (currentState.transitions[symbol] !== undefined) continue;

        const nextStateItems = goto(currentState.items, symbol, augmented);
        if (nextStateItems.length === 0) continue;

        // Check if this state already exists
        let targetStateId = -1;
        const existingState = states.find((s) =>
          statesEqual(s.items, nextStateItems),
        );

        if (existingState) {
          targetStateId = existingState.id;
        } else {
          const newState: LRState = {
            id: stateCounter++,
            items: nextStateItems,
            transitions: {},
          };
          states.push(newState);
          targetStateId = newState.id;
          changed = true;
        }

        currentState.transitions[symbol] = targetStateId;
      }
    }
  }

  return {
    states,
    startStateId: 0,
  };
}

export function buildSLRTable(
  grammar: Grammar,
  followSets: Map<string, Set<string>>,
): { table: LRTable; conflicts: string[]; collection: CanonicalCollection } {
  const collection = buildCanonicalCollection(grammar);
  const augmentedStart = createAugmentedGrammar(grammar).startSymbol;
  const table: LRTable = { action: {}, goto: {} };
  const conflicts: string[] = [];

  // Initialize rows
  collection.states.forEach((state) => {
    table.action[state.id] = {};
    table.goto[state.id] = {};
  });

  collection.states.forEach((state) => {
    // 1. Shift Actions (and Gotos)
    // Transitions generated by canonical collection are technically both shift and goto
    // We separate them here.
    for (const [symbol, nextStateId] of Object.entries(state.transitions)) {
      if (grammar.terminals.has(symbol)) {
        // Shift
        const key = symbol;
        if (table.action[state.id][key]) {
          conflicts.push(
            `Shift/Reduce conflict at State ${state.id} on '${key}'`,
          );
          if (!table.action[state.id][key].includes(`s${nextStateId}`)) {
            table.action[state.id][key] += `\ns${nextStateId}`;
          }
        } else {
          table.action[state.id][key] = `s${nextStateId}`;
        }
      } else if (grammar.nonTerminals.has(symbol)) {
        // Goto
        table.goto[state.id][symbol] = nextStateId;
      }
    }

    // 2. Reduce Actions
    state.items.forEach((item) => {
      if (item.dotIndex === item.rhs.length) {
        // Item is [A -> alpha .]
        if (
          item.lhs === augmentedStart &&
          item.rhs.length === 1 &&
          item.rhs[0] === grammar.startSymbol
        ) {
          // Accept: [S' -> S .]
          // Accept on '$'
          table.action[state.id]["$"] = "acc";
        } else {
          // Reduce A -> alpha
          // For SLR, we reduce on symbols in FOLLOW(A)
          const follow = followSets.get(item.lhs);
          if (follow) {
            follow.forEach((symbol) => {
              if (table.action[state.id][symbol]) {
                // Conflict
                const existing = table.action[state.id][symbol];
                const formattedRhs =
                  item.rhs.length === 0 ? "ε" : item.rhs.join(" ");
                const newAction = `r(${item.lhs} -> ${formattedRhs})`;
                conflicts.push(
                  `Conflict at State ${state.id} on '${symbol}': Existing '${existing}', trying to add '${newAction}'`,
                );
                if (!existing.includes(newAction)) {
                  table.action[state.id][symbol] += `\n${newAction}`;
                }
              } else {
                const formattedRhs =
                  item.rhs.length === 0 ? "ε" : item.rhs.join(" ");
                table.action[state.id][symbol] =
                  `r(${item.lhs} -> ${formattedRhs})`;
              }
            });
          }
        }
      }
    });
  });

  return { table, conflicts, collection };
}

// ============================================
// LR(1) Algorithms (CLR, LALR)
// ============================================

export function closure1(
  items: LRItem[],
  grammar: Grammar,
  firstSets: FirstFollowSets,
): LRItem[] {
  const closureItems = [...items];
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < closureItems.length; i++) {
      const item = closureItems[i];
      if (item.dotIndex >= item.rhs.length) continue;

      const symbolAfterDot = item.rhs[item.dotIndex];
      if (grammar.nonTerminals.has(symbolAfterDot)) {
        // For A -> alpha . B beta, a
        // FIRST(beta a)
        const beta = item.rhs.slice(item.dotIndex + 1);
        // The item's lookaheads
        const lookaheads = item.lookahead || ["$"];

        const productions = grammar.productions.filter(
          (p) => p.lhs === symbolAfterDot,
        );

        for (const prod of productions) {
          for (const lookaheadT of lookaheads) {
            const betaA = [...beta, lookaheadT];
            const firstBetaA = computeFirstForSequence(
              betaA,
              grammar,
              firstSets,
            );

            // Create item for each terminal in FIRST(beta a)
            // Group lookaheads into a single item to prevent explosive array growth
            const newItemRhs =
              prod.rhs.length === 1 && prod.rhs[0] === "ε" ? [] : prod.rhs;

            // Try to find if we already have this core item
            let existingItem = closureItems.find(
              (x) =>
                x.lhs === prod.lhs &&
                x.dotIndex === 0 &&
                x.rhs.length === newItemRhs.length &&
                x.rhs.every((s, idx) => s === newItemRhs[idx]),
            );

            if (!existingItem) {
              existingItem = {
                lhs: prod.lhs,
                rhs: newItemRhs,
                dotIndex: 0,
                lookahead: [],
              };
              closureItems.push(existingItem);
              changed = true;
            }

            if (!existingItem.lookahead) existingItem.lookahead = [];

            for (const b of firstBetaA) {
              if (b !== "ε" && !existingItem.lookahead!.includes(b)) {
                existingItem.lookahead!.push(b);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  // Normalize lookaheads (sort them for easier comparison)
  closureItems.forEach((i) => i.lookahead?.sort());
  return closureItems;
}

export function goto1(
  items: LRItem[],
  symbol: string,
  grammar: Grammar,
  firstSets: FirstFollowSets,
): LRItem[] {
  const movedItems: LRItem[] = [];

  for (const item of items) {
    if (item.dotIndex >= item.rhs.length) continue;

    const symbolAfterDot = item.rhs[item.dotIndex];
    if (symbolAfterDot === symbol) {
      movedItems.push({
        lhs: item.lhs,
        rhs: item.rhs,
        dotIndex: item.dotIndex + 1,
        lookahead: item.lookahead ? [...item.lookahead] : undefined,
      });
    }
  }

  return closure1(movedItems, grammar, firstSets);
}

export function buildLR1Collection(
  grammar: Grammar,
  firstSets: FirstFollowSets,
): CanonicalCollection {
  const augmented = createAugmentedGrammar(grammar);

  const startProd = augmented.productions[0];
  const startItem: LRItem = {
    lhs: startProd.lhs,
    rhs: startProd.rhs,
    dotIndex: 0,
    lookahead: ["$"], // LR(1) initial lookahead is $
  };

  const startStateItems = closure1([startItem], augmented, firstSets);
  const states: LRState[] = [
    {
      id: 0,
      items: startStateItems,
      transitions: {},
    },
  ];

  let stateCounter = 1;
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < states.length; i++) {
      const currentState = states[i];

      const symbols = new Set<string>();
      for (const item of currentState.items) {
        if (item.dotIndex < item.rhs.length) {
          symbols.add(item.rhs[item.dotIndex]);
        }
      }

      for (const symbol of symbols) {
        if (currentState.transitions[symbol] !== undefined) continue;

        const nextStateItems = goto1(
          currentState.items,
          symbol,
          augmented,
          firstSets,
        );
        if (nextStateItems.length === 0) continue;

        let targetStateId = -1;
        const existingState = states.find((s) =>
          statesEqual(s.items, nextStateItems),
        );

        if (existingState) {
          targetStateId = existingState.id;
        } else {
          const newState: LRState = {
            id: stateCounter++,
            items: nextStateItems,
            transitions: {},
          };
          states.push(newState);
          targetStateId = newState.id;
          changed = true;
        }

        currentState.transitions[symbol] = targetStateId;
      }
    }
  }

  return { states, startStateId: 0 };
}

export function buildCLRTable(
  grammar: Grammar,
  firstSets: FirstFollowSets,
): { table: LRTable; conflicts: string[]; collection: CanonicalCollection } {
  const collection = buildLR1Collection(grammar, firstSets);
  const augmentedStart = createAugmentedGrammar(grammar).startSymbol;
  const table: LRTable = { action: {}, goto: {} };
  const conflicts: string[] = [];

  collection.states.forEach((state) => {
    table.action[state.id] = {};
    table.goto[state.id] = {};
  });

  collection.states.forEach((state) => {
    // Shift Actions + Gotos
    for (const [symbol, nextStateId] of Object.entries(state.transitions)) {
      if (grammar.terminals.has(symbol)) {
        if (table.action[state.id][symbol]) {
          conflicts.push(
            `Shift/Reduce conflict at State ${state.id} on '${symbol}'`,
          );
          if (!table.action[state.id][symbol].includes(`s${nextStateId}`)) {
            table.action[state.id][symbol] += `\ns${nextStateId}`;
          }
        } else {
          table.action[state.id][symbol] = `s${nextStateId}`;
        }
      } else if (grammar.nonTerminals.has(symbol)) {
        table.goto[state.id][symbol] = nextStateId;
      }
    }

    // Reduce Actions
    state.items.forEach((item) => {
      if (item.dotIndex === item.rhs.length) {
        if (
          item.lhs === augmentedStart &&
          item.rhs.length === 1 &&
          item.rhs[0] === grammar.startSymbol &&
          item.lookahead?.includes("$")
        ) {
          table.action[state.id]["$"] = "acc";
        } else {
          if (item.lookahead) {
            item.lookahead.forEach((symbol) => {
              const formattedRhs =
                item.rhs.length === 0 ? "ε" : item.rhs.join(" ");
              const newAction = `r(${item.lhs} -> ${formattedRhs})`;
              if (
                table.action[state.id][symbol] &&
                !table.action[state.id][symbol].includes(newAction)
              ) {
                conflicts.push(
                  `Conflict at State ${state.id} on '${symbol}': Existing '${table.action[state.id][symbol]}', trying to add '${newAction}'`,
                );
                table.action[state.id][symbol] += `\n${newAction}`;
              } else if (!table.action[state.id][symbol]) {
                table.action[state.id][symbol] = newAction;
              }
            });
          }
        }
      }
    });
  });

  return { table, conflicts, collection };
}

function itemsCoreEqual(a: LRItem, b: LRItem): boolean {
  if (
    a.lhs !== b.lhs ||
    a.dotIndex !== b.dotIndex ||
    a.rhs.length !== b.rhs.length
  )
    return false;
  for (let i = 0; i < a.rhs.length; i++) {
    if (a.rhs[i] !== b.rhs[i]) return false;
  }
  return true;
}

function stateCoresEqual(a: LRItem[], b: LRItem[]): boolean {
  if (a.length !== b.length) return false;
  const formatCore = (i: LRItem) => `${i.lhs}->${i.rhs.join("")}@${i.dotIndex}`;
  const sigA = a.map(formatCore).sort().join("|");
  const sigB = b.map(formatCore).sort().join("|");
  return sigA === sigB;
}

export function buildLALRCollection(
  lr1Collection: CanonicalCollection,
): CanonicalCollection {
  const states = lr1Collection.states;
  const mergedStates: LRState[] = [];
  const stateMap: { [oldId: number]: number } = {};

  for (const state of states) {
    let mergedTo = -1;
    for (let i = 0; i < mergedStates.length; i++) {
      if (stateCoresEqual(mergedStates[i].items, state.items)) {
        mergedTo = mergedStates[i].id;
        // Union the lookaheads
        for (let j = 0; j < state.items.length; j++) {
          const existingItem = mergedStates[i].items.find((mi) =>
            itemsCoreEqual(mi, state.items[j]),
          );
          if (existingItem && state.items[j].lookahead) {
            for (const lk of state.items[j].lookahead!) {
              if (!existingItem.lookahead) existingItem.lookahead = [];
              if (!existingItem.lookahead.includes(lk)) {
                existingItem.lookahead.push(lk);
              }
            }
            existingItem.lookahead!.sort();
          }
        }
        break;
      }
    }
    if (mergedTo !== -1) {
      stateMap[state.id] = mergedTo;
    } else {
      const newStateId = mergedStates.length;
      mergedStates.push({
        id: newStateId,
        // Deep copy items to avoid mutating LR1 state by reference
        items: state.items.map((it) => ({
          ...it,
          lookahead: it.lookahead ? [...it.lookahead] : undefined,
        })),
        transitions: {},
      });
      stateMap[state.id] = newStateId;
    }
  }

  // Remap transitions
  for (const oldState of states) {
    const newId = stateMap[oldState.id];
    const newState = mergedStates[newId];
    for (const [symbol, targetId] of Object.entries(oldState.transitions)) {
      newState.transitions[symbol] = stateMap[targetId];
    }
  }

  return {
    states: mergedStates,
    startStateId: stateMap[lr1Collection.startStateId],
  };
}

export function buildLALRTable(
  grammar: Grammar,
  firstSets: FirstFollowSets,
): { table: LRTable; conflicts: string[]; collection: CanonicalCollection } {
  const lr1Collection = buildLR1Collection(grammar, firstSets);
  const lalrCollection = buildLALRCollection(lr1Collection);
  const augmentedStart = createAugmentedGrammar(grammar).startSymbol;

  const table: LRTable = { action: {}, goto: {} };
  const conflicts: string[] = [];

  lalrCollection.states.forEach((state) => {
    table.action[state.id] = {};
    table.goto[state.id] = {};
  });

  lalrCollection.states.forEach((state) => {
    // Shift Actions + Gotos
    for (const [symbol, nextStateId] of Object.entries(state.transitions)) {
      if (grammar.terminals.has(symbol)) {
        if (table.action[state.id][symbol]) {
          conflicts.push(
            `Shift/Reduce conflict at State ${state.id} on '${symbol}' (LALR)`,
          );
          if (!table.action[state.id][symbol].includes(`s${nextStateId}`)) {
            table.action[state.id][symbol] += `\ns${nextStateId}`;
          }
        } else {
          table.action[state.id][symbol] = `s${nextStateId}`;
        }
      } else if (grammar.nonTerminals.has(symbol)) {
        table.goto[state.id][symbol] = nextStateId;
      }
    }

    // Reduce Actions
    state.items.forEach((item) => {
      if (item.dotIndex === item.rhs.length) {
        if (
          item.lhs === augmentedStart &&
          item.rhs.length === 1 &&
          item.rhs[0] === grammar.startSymbol &&
          item.lookahead?.includes("$")
        ) {
          table.action[state.id]["$"] = "acc";
        } else {
          if (item.lookahead) {
            item.lookahead.forEach((symbol) => {
              const formattedRhs =
                item.rhs.length === 0 ? "ε" : item.rhs.join(" ");
              const newAction = `r(${item.lhs} -> ${formattedRhs})`;
              if (
                table.action[state.id][symbol] &&
                !table.action[state.id][symbol].includes(newAction)
              ) {
                conflicts.push(
                  `Reduce/Reduce or Shift/Reduce conflict at State ${state.id} on '${symbol}' (LALR)`,
                );
                table.action[state.id][symbol] += `\n${newAction}`;
              } else if (!table.action[state.id][symbol]) {
                table.action[state.id][symbol] = newAction;
              }
            });
          }
        }
      }
    });
  });

  return { table, conflicts, collection: lalrCollection };
}
