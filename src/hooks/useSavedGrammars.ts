import { useState, useEffect } from "react";

export interface SavedGrammar {
  id: string;
  name: string;
  grammar: string;
  testInput: string;
  savedAt: number;
}

const STORAGE_KEY = "comdes_saved_grammars";

export function useSavedGrammars() {
  const [savedGrammars, setSavedGrammars] = useState<SavedGrammar[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line
        setSavedGrammars(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved grammars", e);
    }
  }, []);

  const saveGrammar = (name: string, grammar: string, testInput: string) => {
    const newSaved: SavedGrammar = {
      id: crypto.randomUUID(),
      name,
      grammar,
      testInput,
      savedAt: Date.now(),
    };

    const updated = [newSaved, ...savedGrammars];
    setSavedGrammars(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save grammar", e);
    }
  };

  const deleteGrammar = (id: string) => {
    const updated = savedGrammars.filter((g) => g.id !== id);
    setSavedGrammars(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update saved grammars after deletion", e);
    }
  };

  return {
    savedGrammars,
    saveGrammar,
    deleteGrammar,
  };
}
