import { Grammar, Production, ParsingStep } from "./types";

export function parseSDTGrammar(input: string): Grammar {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const productions: Production[] = [];
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = "";

  for (const line of lines) {
    const assignmentOperator = line.includes("->")
      ? "->"
      : line.includes(":")
        ? ":"
        : null;
    if (!assignmentOperator) continue;

    const parts = line.split(assignmentOperator);
    if (parts.length < 2) continue;

    const lhs = parts[0].trim();
    if (!lhs) continue;
    if (!startSymbol) startSymbol = lhs;
    nonTerminals.add(lhs);

    // Split by | to get alternatives. For SDT, it's safer to rely on
    // explicit line-by-line rules or simple | usage without braces.
    const rhss = parts[1].split("|").map((r) => r.trim());

    for (const rhsRaw of rhss) {
      // Look for { ... } at the end
      let rhs = rhsRaw;
      let semanticAction;
      const braceIndex = rhsRaw.indexOf("{");
      if (braceIndex !== -1) {
        semanticAction = rhsRaw
          .substring(braceIndex + 1, rhsRaw.lastIndexOf("}"))
          .trim();
        rhs = rhsRaw.substring(0, braceIndex).trim();
      }

      if (rhs === "ε" || rhs.toLowerCase() === "epsilon") {
        productions.push({ lhs, rhs: ["ε"], semanticAction });
        terminals.add("ε");
      } else {
        const tokens = rhs.split(/\s+/).filter((t) => t.length > 0);
        productions.push({ lhs, rhs: tokens, semanticAction });
        tokens.forEach((t) => {
          if (t !== "ε") terminals.add(t);
        });
      }
    }
  }

  nonTerminals.forEach((nt) => terminals.delete(nt));

  if (productions.length === 0) {
    throw new Error(
      "No valid production rules found. Please check your grammar syntax.",
    );
  }

  return {
    productions,
    nonTerminals,
    terminals,
    startSymbol,
  };
}

export interface SDTStep {
  action: string;
  stack: string[];
  input: string[];
  semanticStack: unknown[];
  evaluatedValue?: unknown;
}

export function evaluateSDT(
  grammar: Grammar,
  parsingSteps: ParsingStep[],
  originalTokens: string[], // e.g. ["id:5", "+", "id:3"]
): { finalValue: unknown; steps: SDTStep[] } {
  const semanticStack: unknown[] = [];
  const sdtSteps: SDTStep[] = [];
  let tokenIdx = 0;

  for (const step of parsingSteps) {
    const action = step.action;

    if (action.startsWith("s") || action === "Shift") {
      const shiftedTokenStr = originalTokens[tokenIdx++];

      let val: unknown = undefined;
      let sym = shiftedTokenStr;

      if (sym && sym.includes(":")) {
        const parts = sym.split(":");
        sym = parts[0];
        val = isNaN(Number(parts[1])) ? parts[1] : Number(parts[1]);
      } else {
        // If it's a number string, parse it, otherwise keep as string
        if (sym && !isNaN(Number(sym))) {
          val = Number(sym);
        } else {
          val = sym; // default to the string itself
        }
      }

      semanticStack.push(val);

      sdtSteps.push({
        action: `Shift ${sym}`,
        stack: [...step.stack],
        input: [...step.input],
        semanticStack: [...semanticStack],
      });
    } else if (action.startsWith("r")) {
      // Reduce E -> E + T
      // Find the production in grammar
      const match =
        action.match(/r\((.*) -> (.*)\)/) ||
        action.match(/Reduce by (.*) -> (.*)/);
      if (match) {
        const lhs = match[1].trim();
        const rhsStr = match[2].trim();
        const isEpsilon = rhsStr === "" || rhsStr === "ε";
        const rhsTokens = isEpsilon ? [] : rhsStr.split(" ");

        let semanticAction = "";
        // Find matching production to get semanticAction
        const prod = grammar.productions.find(
          (p) =>
            p.lhs === lhs &&
            (p.rhs.join(" ") === rhsStr || (isEpsilon && p.rhs[0] === "ε")),
        );

        if (prod && prod.semanticAction) {
          semanticAction = prod.semanticAction;
        }

        const args: unknown[] = [];
        for (let i = 0; i < rhsTokens.length; i++) {
          args.unshift(semanticStack.pop());
        }

        let evaluatedValue: unknown = undefined;
        if (semanticAction) {
          try {
            // Replace $1, $2, etc with args[0], args[1]
            let code = semanticAction;
            for (let i = 0; i < args.length; i++) {
              // Replace all occurrences of $n with args[n] (1-indexed)
              const regex = new RegExp(`\\$${i + 1}\\b`, "g");
              code = code.replace(regex, `args[${i}]`);
            }
            code = code.replace(/\$\$/g, "result");

            // Execute
            const fn = new Function(
              "args",
              `let result; ${code}; return result;`,
            );
            evaluatedValue = fn(args);
          } catch (err) {
            console.error(
              "Error evaluating semantic action:",
              semanticAction,
              err,
            );
            evaluatedValue = "Error";
          }
        } else {
          // Default action: $$ = $1 (if exists)
          evaluatedValue = args.length > 0 ? args[0] : undefined;
        }

        semanticStack.push(evaluatedValue);

        sdtSteps.push({
          action: `Reduce ${lhs} -> ${rhsStr}`,
          stack: [...step.stack],
          input: [...step.input],
          semanticStack: [...semanticStack],
          evaluatedValue,
        });
      }
    } else if (action === "Accept") {
      sdtSteps.push({
        action: "Accept",
        stack: [...step.stack],
        input: [...step.input],
        semanticStack: [...semanticStack],
        evaluatedValue: semanticStack[0],
      });
    }
  }

  return {
    finalValue: semanticStack[0],
    steps: sdtSteps,
  };
}
