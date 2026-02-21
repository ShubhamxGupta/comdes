import { parseGrammar } from "./src/engine/grammar";
import { computeFirstSets, computeFollowSets } from "./src/engine/sets";
import {
  buildSLRTable,
  buildCLRTable,
  buildLALRTable,
} from "./src/engine/parsing/lr";

const input = `
S -> A a A b | B b B a
A -> ε
B -> ε
`;

const grammar = parseGrammar(input);
const first = computeFirstSets(grammar);
const follow = computeFollowSets(grammar, first);

console.log("Grammar:", grammar);

const slr = buildSLRTable(grammar, follow);
console.log("SLR Conflicts:", slr.conflicts);

const clr = buildCLRTable(grammar, first);
console.log("CLR Conflicts:", clr.conflicts);

const lalr = buildLALRTable(grammar, first);
console.log("LALR Conflicts:", lalr.conflicts);
