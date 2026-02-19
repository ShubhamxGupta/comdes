import { create } from 'zustand';
import { Grammar, ParsingTable, ParsingStep } from '../engine/types';
import { parseGrammar } from '../engine/grammar';

interface GrammarState {
  rawInput: string;
  parsedGrammar: Grammar | null;
  parsingTable: ParsingTable | null;
  steps: ParsingStep[];
  parseError: string | null;
  
  setGrammar: (input: string) => void;
  buildTable: () => void;
  reset: () => void;
}

export const useGrammarStore = create<GrammarState>((set, get) => ({
  rawInput: 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id',
  parsedGrammar: null,
  parsingTable: null,
  steps: [],
  parseError: null,

  setGrammar: (input: string) => {
    set({ rawInput: input });
    try {
      const grammar = parseGrammar(input);
      set({ parsedGrammar: grammar, parseError: null });
    } catch (e: any) {
      set({ parseError: e.message });
    }
  },

  buildTable: () => {
    // Todo: Implement integration with engine
  },

  reset: () => {
    set({ steps: [], parsingTable: null });
  }
}));
