/* eslint-disable */
const { parseGrammar } = require('./src/engine/grammar');
const { computeFirstSets, computeFollowSets } = require('./src/engine/sets');
const { buildLL1Table } = require('./src/engine/parsing/ll1');
const { simulateLL1 } = require('./src/engine/simulator');

const rawInput = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

const testInput = "id + id * id";

console.log("--- Debugging Engine ---");

try {
    console.log("1. Parsing Grammar...");
    const grammar = parseGrammar(rawInput);
    console.log("   Terminals:", Array.from(grammar.terminals));
    console.log("   Non-Terminals:", Array.from(grammar.nonTerminals));

    console.log("\n2. Computing Sets...");
    const first = computeFirstSets(grammar);
    const follow = computeFollowSets(grammar, first);
    // console.log("   FIRST:", first);
    // console.log("   FOLLOW:", follow);

    console.log("\n3. Building Table...");
    const { table, conflicts } = buildLL1Table(grammar, first, follow);
    
    if (conflicts.length > 0) {
        console.log("   CONFLICTS FOUND:", conflicts);
    } else {
        console.log("   Table built successfully.");
        console.log("   Table Keys:", Object.keys(table));
    }

    console.log("\n4. Simulating Input...");
    const tokens = testInput.split(/\s+/);
    const steps = simulateLL1(tokens, table, grammar.startSymbol);
    
    if (steps.length === 0) {
        console.log("   NO STEPS GENERATED!");
    } else {
        console.log(`   Generated ${steps.length} steps.`);
        console.log("   First Step:", steps[0]);
        console.log("   Last Step:", steps[steps.length - 1]);
    }

} catch (e) {
    console.error("ERROR:", e);
}
