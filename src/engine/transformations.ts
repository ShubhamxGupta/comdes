import { Grammar, Production } from "./types";
import { parseGrammar } from "./grammar";

/**
 * Converts a unified Grammar object back into a string representation.
 */
export function stringifyGrammar(grammar: Grammar): string {
  const lines: string[] = [];

  // Start with the start symbol
  const startProds = grammar.productions.filter(
    (p) => p.lhs === grammar.startSymbol,
  );
  if (startProds.length > 0) {
    const rhss = startProds.map((p) => p.rhs.join(" ") || "ε").join(" | ");
    lines.push(`${grammar.startSymbol} -> ${rhss}`);
  }

  // Then the rest
  for (const nt of grammar.nonTerminals) {
    if (nt === grammar.startSymbol) continue;

    const prods = grammar.productions.filter((p) => p.lhs === nt);
    if (prods.length > 0) {
      const rhss = prods.map((p) => p.rhs.join(" ") || "ε").join(" | ");
      lines.push(`${nt} -> ${rhss}`);
    }
  }

  return lines.join("\n");
}

/**
 * Eliminates Immediate and Indirect Left Recursion from a raw grammar string.
 */
export function eliminateLeftRecursion(rawInput: string): string {
  const grammar = parseGrammar(rawInput);
  const nonTerminals = Array.from(grammar.nonTerminals);
  let newProductions: Production[] = [];

  // Group existing productions by LHS
  const prodMap = new Map<string, string[][]>();
  for (const nt of nonTerminals) prodMap.set(nt, []);

  for (const prod of grammar.productions) {
    prodMap.get(prod.lhs)!.push(prod.rhs);
  }

  // Iterate over Non-Terminals A_i
  for (let i = 0; i < nonTerminals.length; i++) {
    const ai = nonTerminals[i];

    // For each A_j where j < i (Indirect Recursion Resolution)
    for (let j = 0; j < i; j++) {
      const aj = nonTerminals[j];
      const newAiRhss: string[][] = [];

      for (const aiRhs of prodMap.get(ai)!) {
        if (aiRhs.length > 0 && aiRhs[0] === aj) {
          // A_i -> A_j gamma
          const gamma = aiRhs.slice(1);
          // Replace A_j with all its derivations A_i -> delta gamma
          for (const ajRhs of prodMap.get(aj)!) {
            // handle epsilon empty array
            const delta = ajRhs.length === 1 && ajRhs[0] === "ε" ? [] : ajRhs;
            newAiRhss.push([...delta, ...gamma]);
          }
        } else {
          newAiRhss.push(aiRhs);
        }
      }
      prodMap.set(ai, newAiRhss);
    }

    // Eliminate Immediate Left Recursion for A_i
    const currentAiRhss = prodMap.get(ai)!;
    const alphas: string[][] = []; // Left recursive A -> A alpha
    const betas: string[][] = []; // Non-recursive A -> beta

    for (const rhs of currentAiRhss) {
      if (rhs.length > 0 && rhs[0] === ai) {
        alphas.push(rhs.slice(1));
      } else {
        betas.push(rhs);
      }
    }

    if (alphas.length > 0) {
      // Create new Non-Terminal A'
      let aiPrime = `${ai}'`;
      while (
        grammar.nonTerminals.has(aiPrime) ||
        grammar.terminals.has(aiPrime)
      ) {
        aiPrime += "'";
      }

      const newAiBetas: string[][] = [];
      const newAiPrimeAlphas: string[][] = [];

      // A -> beta A'
      if (betas.length === 0) {
        // If no beta exists, it's just A'
        newAiBetas.push([aiPrime]);
      } else {
        for (const beta of betas) {
          if (beta.length === 1 && beta[0] === "ε") {
            newAiBetas.push([aiPrime]);
          } else {
            newAiBetas.push([...beta, aiPrime]);
          }
        }
      }

      // A' -> alpha A' | ε
      for (const alpha of alphas) {
        newAiPrimeAlphas.push([...alpha, aiPrime]);
      }
      newAiPrimeAlphas.push(["ε"]);

      prodMap.set(ai, newAiBetas);
      prodMap.set(aiPrime, newAiPrimeAlphas);
      nonTerminals.push(aiPrime); // Track the new NT
      grammar.nonTerminals.add(aiPrime);
    }
  }

  // Re-assemble the grammar
  for (const nt of nonTerminals) {
    const rhss = prodMap.get(nt) || [];
    for (const rhs of rhss) {
      newProductions.push({ lhs: nt, rhs });
    }
  }

  grammar.productions = newProductions;
  return stringifyGrammar(grammar);
}

/**
 * Performs Left Factoring on a raw grammar string.
 */
export function leftFactor(rawInput: string): string {
  const grammar = parseGrammar(rawInput);
  let newProductions: Production[] = [];
  const nonTerminals = Array.from(grammar.nonTerminals);

  const prodMap = new Map<string, string[][]>();
  for (const nt of nonTerminals) prodMap.set(nt, []);
  for (const prod of grammar.productions) {
    prodMap.get(prod.lhs)!.push(prod.rhs);
  }

  const worklist = [...nonTerminals];

  while (worklist.length > 0) {
    const a = worklist.shift()!;
    const rhss = prodMap.get(a)!;

    // Find longest common prefix
    let maxPrefix: string[] = [];
    let bestGroup: string[][] = [];
    let bestIndices: number[] = [];

    for (let i = 0; i < rhss.length; i++) {
      for (let j = i + 1; j < rhss.length; j++) {
        const p1 = rhss[i];
        const p2 = rhss[j];
        if (
          p1.length === 0 ||
          p2.length === 0 ||
          p1[0] === "ε" ||
          p2[0] === "ε"
        )
          continue;

        let k = 0;
        while (k < p1.length && k < p2.length && p1[k] === p2[k]) k++;

        if (k > 0 && k >= maxPrefix.length) {
          const prefix = p1.slice(0, k);
          // Find all rhymes that share this prefix
          const groupIndices: number[] = [];
          for (let m = 0; m < rhss.length; m++) {
            let match = true;
            for (let n = 0; n < k; n++) {
              if (rhss[m][n] !== prefix[n]) {
                match = false;
                break;
              }
            }
            if (match) groupIndices.push(m);
          }

          if (
            groupIndices.length > 1 &&
            (groupIndices.length > bestIndices.length ||
              (groupIndices.length === bestIndices.length &&
                prefix.length > maxPrefix.length))
          ) {
            maxPrefix = prefix;
            bestIndices = groupIndices;
            bestGroup = groupIndices.map((idx) => rhss[idx]);
          }
        }
      }
    }

    if (maxPrefix.length > 0) {
      // Needs factoring
      let aPrime = `${a}'`;
      while (
        grammar.nonTerminals.has(aPrime) ||
        grammar.terminals.has(aPrime)
      ) {
        aPrime += "'";
      }
      grammar.nonTerminals.add(aPrime);

      const newARhss: string[][] = [];
      const newAPrimeRhss: string[][] = [];

      // Add unaffected rules
      for (let i = 0; i < rhss.length; i++) {
        if (!bestIndices.includes(i)) {
          newARhss.push(rhss[i]);
        }
      }

      // Add A -> alpha A'
      newARhss.push([...maxPrefix, aPrime]);

      // Add A' -> gamma_i
      for (const g of bestGroup) {
        const gamma = g.slice(maxPrefix.length);
        if (gamma.length === 0) {
          newAPrimeRhss.push(["ε"]);
        } else {
          newAPrimeRhss.push(gamma);
        }
      }

      prodMap.set(a, newARhss);
      prodMap.set(aPrime, newAPrimeRhss);

      // We might need to factor A and A' further
      worklist.push(a);
      worklist.push(aPrime);
    }
  }

  // Re-assemble
  for (const nt of grammar.nonTerminals) {
    const rhss = prodMap.get(nt) || [];
    for (const rhs of rhss) {
      newProductions.push({ lhs: nt, rhs });
    }
  }

  grammar.productions = newProductions;
  return stringifyGrammar(grammar);
}
