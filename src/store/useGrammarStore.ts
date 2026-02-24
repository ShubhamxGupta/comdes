import { create } from "zustand";
import {
  Grammar,
  ParsingTable,
  ParsingStep,
  LRTable,
  CanonicalCollection,
  ParserType,
} from "@/engine/types";
import { parseGrammar } from "@/engine/grammar";
import {
  computeFirstSets,
  computeFollowSets,
  FirstFollowSets,
} from "@/engine/sets";
import { buildLL1Table } from "@/engine/parsing/ll1";
import {
  buildSLRTable,
  buildCanonicalCollection,
  buildCLRTable,
  buildLALRTable,
} from "@/engine/parsing/lr";
import { simulateLL1, simulateLR } from "@/engine/simulator";
import { buildParseTree, buildLRTree } from "@/engine/treeBuilder";
import { Node, Edge } from "reactflow";

interface GrammarState {
  rawInput: string;
  testInput: string;
  parsedGrammar: Grammar | null;
  selectedParsers: ParserType[];
  ll1Table: { table: ParsingTable; conflicts: string[] } | null;
  slrTable: {
    table: LRTable;
    conflicts: string[];
    collection: CanonicalCollection;
  } | null;
  clrTable: {
    table: LRTable;
    conflicts: string[];
    collection: CanonicalCollection;
  } | null;
  lalrTable: {
    table: LRTable;
    conflicts: string[];
    collection: CanonicalCollection;
  } | null;
  canonicalCollection: CanonicalCollection | null; // LR0 Collection
  firstSets: FirstFollowSets | null;
  followSets: FirstFollowSets | null;

  // Simulation State
  ll1Steps: ParsingStep[];
  slrSteps: ParsingStep[];
  clrSteps: ParsingStep[];
  lalrSteps: ParsingStep[];
  ll1ParseTree: { nodes: Node[]; edges: Edge[] } | null;
  slrParseTree: { nodes: Node[]; edges: Edge[] } | null;
  clrParseTree: { nodes: Node[]; edges: Edge[] } | null;
  lalrParseTree: { nodes: Node[]; edges: Edge[] } | null;

  error: string | null;

  // Actions
  setSelectedParsers: (parsers: ParserType[]) => void;
  setRawInput: (input: string) => void;
  setTestInput: (input: string) => void;
  parse: () => void;
  simulate: () => void;
}

export const useGrammarStore = create<GrammarState>((set, get) => ({
  rawInput: "", // No dummy data
  testInput: "", // No dummy data
  parsedGrammar: null,
  selectedParsers: ["LL1", "SLR1", "CLR1", "LALR1"],
  ll1Table: null,
  slrTable: null,
  clrTable: null,
  lalrTable: null,
  canonicalCollection: null,
  firstSets: null,
  followSets: null,

  ll1Steps: [],
  slrSteps: [],
  clrSteps: [],
  lalrSteps: [],
  ll1ParseTree: null,
  slrParseTree: null,
  clrParseTree: null,
  lalrParseTree: null,

  error: null,

  setSelectedParsers: (parsers: ParserType[]) =>
    set({ selectedParsers: parsers }),
  setRawInput: (input) => set({ rawInput: input, error: null }),
  setTestInput: (input) => {
    set({ testInput: input });
    get().simulate(); // Auto-simulate on input change
  },

  parse: () => {
    const { rawInput } = get();
    if (!rawInput.trim()) {
      set({ error: "Please enter a grammar." });
      return;
    }

    try {
      // 1. Parse Grammar
      const grammar = parseGrammar(rawInput);

      // 2. Compute Sets
      const first = computeFirstSets(grammar);
      const follow = computeFollowSets(grammar, first);

      // 3. Build Tables
      // Try LL(1)
      let ll1Result = null;
      if (get().selectedParsers.includes("LL1")) {
        try {
          ll1Result = buildLL1Table(grammar, first, follow);
        } catch (e) {
          console.warn("LL(1) Table generation failed", e);
        }
      }

      // Try SLR(1)
      let slrResult = null;
      let lr0Collection = null;
      if (get().selectedParsers.includes("SLR1")) {
        try {
          lr0Collection = buildCanonicalCollection(grammar); // Call explicitly to store it
          slrResult = buildSLRTable(grammar, follow);
        } catch (e) {
          console.warn("SLR(1) Table generation failed", e);
        }
      }

      // Try CLR(1)
      let clrResult = null;
      if (get().selectedParsers.includes("CLR1")) {
        try {
          clrResult = buildCLRTable(grammar, first);
        } catch (e) {
          console.warn("CLR(1) Table generation failed", e);
        }
      }

      // Try LALR(1)
      let lalrResult = null;
      if (get().selectedParsers.includes("LALR1")) {
        try {
          lalrResult = buildLALRTable(grammar, first);
        } catch (e) {
          console.warn("LALR(1) Table generation failed", e);
        }
      }

      set({
        parsedGrammar: grammar,
        ll1Table: ll1Result,
        slrTable: slrResult,
        clrTable: clrResult,
        lalrTable: lalrResult,
        canonicalCollection: lr0Collection,
        firstSets: first,
        followSets: follow,
        error: null,
        // Reset simulation
        ll1Steps: [],
        slrSteps: [],
        clrSteps: [],
        lalrSteps: [],
        ll1ParseTree: null,
        slrParseTree: null,
        clrParseTree: null,
        lalrParseTree: null,
      });

      // Auto-simulate if there is test input
      if (get().testInput.trim()) {
        get().simulate();
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to parse grammar";
      set({ error: message });
    }
  },

  simulate: () => {
    const { parsedGrammar, ll1Table, slrTable, testInput } = get();
    if (!parsedGrammar || !testInput.trim()) return;

    const tokens = testInput.trim().split(/\s+/); // Simple space splitting

    // LL(1) Simulation
    let ll1Steps: ParsingStep[] = [];
    let ll1Tree = null;
    if (ll1Table) {
      if (ll1Table.conflicts.length === 0) {
        try {
          ll1Steps = simulateLL1(
            tokens,
            ll1Table.table,
            parsedGrammar.startSymbol,
          );
          ll1Tree = buildParseTree(
            tokens,
            ll1Table.table,
            parsedGrammar.startSymbol,
          );
        } catch (e) {
          console.warn("LL1 Simulation failed", e);
        }
      } else {
        ll1Steps = [
          {
            stack: [],
            input: [],
            action:
              "Error: Grammar is not LL(1). Cannot build parsing tree due to table conflicts.",
          },
        ];
      }
    }

    // LR Simulation
    let lrSteps: ParsingStep[] = [];
    let lrTree = null;

    // Choose strongest available table for simulation
    const { clrTable, lalrTable } = get();

    let slrSteps: ParsingStep[] = [];
    let slrTree = null;
    if (slrTable) {
      if (slrTable.conflicts.length === 0) {
        try {
          slrSteps = simulateLR(tokens, slrTable.table);
          slrTree = buildLRTree(slrSteps, parsedGrammar);
        } catch (e) {
          console.warn("SLR Simulation failed", e);
        }
      } else {
        slrSteps = [
          {
            stack: [],
            input: [],
            action: "Error: Grammar is not strictly SLR(1).",
          },
        ];
      }
    }

    let clrSteps: ParsingStep[] = [];
    let clrTree = null;
    if (clrTable) {
      if (clrTable.conflicts.length === 0) {
        try {
          clrSteps = simulateLR(tokens, clrTable.table);
          clrTree = buildLRTree(clrSteps, parsedGrammar);
        } catch (e) {
          console.warn("CLR Simulation failed", e);
        }
      } else {
        clrSteps = [
          {
            stack: [],
            input: [],
            action: "Error: Grammar is not strictly CLR(1).",
          },
        ];
      }
    }

    let lalrSteps: ParsingStep[] = [];
    let lalrTree = null;
    if (lalrTable) {
      if (lalrTable.conflicts.length === 0) {
        try {
          lalrSteps = simulateLR(tokens, lalrTable.table);
          lalrTree = buildLRTree(lalrSteps, parsedGrammar);
        } catch (e) {
          console.warn("LALR Simulation failed", e);
        }
      } else {
        lalrSteps = [
          {
            stack: [],
            input: [],
            action: "Error: Grammar is not strictly LALR(1).",
          },
        ];
      }
    }

    set({
      ll1Steps,
      slrSteps,
      clrSteps,
      lalrSteps,
      ll1ParseTree: ll1Tree,
      slrParseTree: slrTree,
      clrParseTree: clrTree,
      lalrParseTree: lalrTree,
    });
  },
}));
