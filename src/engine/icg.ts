import { Grammar, ParsingStep } from "./types";

// --- Types ---

export interface TACInstruction {
  op: string;
  arg1?: string;
  arg2?: string;
  result: string;
}

export interface Quadruple {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
}

export interface Triple {
  index: number;
  op: string;
  arg1: string; // can be a value or "(i)" referencing triple i
  arg2: string;
}

export interface IndirectTriple {
  pointer: number; // index into the triples array
  triple: Triple;
}

export interface ICGResult {
  instructions: TACInstruction[];
  tempCount: number;
  quadruples: Quadruple[];
  triples: Triple[];
  indirectTriples: IndirectTriple[];
}

// --- TAC Generator ---

export function generateTAC(
  grammar: Grammar,
  parsingSteps: ParsingStep[],
  originalTokens: string[],
): ICGResult {
  const instructions: TACInstruction[] = [];
  const valueStack: string[] = [];
  let tempCount = 0;
  let tokenIdx = 0;

  const newTemp = (): string => {
    tempCount++;
    return `t${tempCount}`;
  };

  for (const step of parsingSteps) {
    const action = step.action;

    if (action.startsWith("s") || action === "Shift") {
      const tokenStr = originalTokens[tokenIdx++];
      if (!tokenStr) continue;

      let val = tokenStr;
      if (tokenStr.includes(":")) {
        const parts = tokenStr.split(":");
        val = parts[1];
      }
      valueStack.push(val);
    } else if (action.startsWith("r")) {
      const match =
        action.match(/r\((.*) -> (.*)\)/) ||
        action.match(/Reduce by (.*) -> (.*)/);

      if (match) {
        const lhs = match[1].trim();
        const rhsStr = match[2].trim();
        const isEpsilon = rhsStr === "" || rhsStr === "ε";
        const rhsTokens = isEpsilon ? [] : rhsStr.split(" ");

        const prod = grammar.productions.find(
          (p) =>
            p.lhs === lhs &&
            (p.rhs.join(" ") === rhsStr || (isEpsilon && p.rhs[0] === "ε")),
        );

        const args: string[] = [];
        for (let i = 0; i < rhsTokens.length; i++) {
          const v = valueStack.pop();
          if (v !== undefined) args.unshift(v);
        }

        const semanticAction = prod?.semanticAction || "";

        if (semanticAction && args.length >= 2) {
          const opMatch = semanticAction.match(/\$\d+\s*([+\-*/])\s*\$\d+/);

          if (opMatch) {
            const op = opMatch[1];
            const left = args.length === 3 ? args[0] : args[0];
            const right = args.length === 3 ? args[2] : args[1];

            const temp = newTemp();
            instructions.push({ op, arg1: left, arg2: right, result: temp });
            valueStack.push(temp);
          } else {
            const assignMatch = semanticAction.match(/\$(\d+)/);
            if (assignMatch) {
              const idx = parseInt(assignMatch[1]) - 1;
              if (idx >= 0 && idx < args.length) {
                valueStack.push(args[idx]);
              } else {
                valueStack.push(args[0] || lhs);
              }
            } else {
              valueStack.push(args[0] || lhs);
            }
          }
        } else if (semanticAction) {
          const refMatch = semanticAction.match(/\$(\d+)/);
          if (refMatch) {
            const idx = parseInt(refMatch[1]) - 1;
            if (idx >= 0 && idx < args.length) {
              valueStack.push(args[idx]);
            } else {
              valueStack.push(args[0] || lhs);
            }
          } else {
            valueStack.push(args[0] || lhs);
          }
        } else {
          valueStack.push(args[0] || lhs);
        }
      }
    }
  }

  // Build quadruples: (op, arg1, arg2, result)
  const quadruples: Quadruple[] = instructions.map((inst, i) => ({
    index: i,
    op: inst.op,
    arg1: inst.arg1 || "",
    arg2: inst.arg2 || "",
    result: inst.result,
  }));

  // Build triples: (op, arg1, arg2) — result is implicit via index
  // Map temp names to triple indices for referencing
  const tempToTripleIndex = new Map<string, number>();
  const triples: Triple[] = instructions.map((inst, i) => {
    const resolveArg = (arg: string | undefined): string => {
      if (!arg) return "";
      const tripleIdx = tempToTripleIndex.get(arg);
      if (tripleIdx !== undefined) return `(${tripleIdx})`;
      return arg;
    };
    tempToTripleIndex.set(inst.result, i);
    return {
      index: i,
      op: inst.op,
      arg1: resolveArg(inst.arg1),
      arg2: resolveArg(inst.arg2),
    };
  });

  // Build indirect triples: a pointer list + the same triples
  const indirectTriples: IndirectTriple[] = triples.map((t, i) => ({
    pointer: i,
    triple: t,
  }));

  return { instructions, tempCount, quadruples, triples, indirectTriples };
}

/**
 * Formats TAC instructions into a human-readable string.
 */
export function formatTAC(instructions: TACInstruction[]): string {
  return instructions
    .map((inst) => {
      if (inst.op === "=") {
        return `${inst.result} = ${inst.arg1}`;
      }
      return `${inst.result} = ${inst.arg1 || ""} ${inst.op} ${inst.arg2 || ""}`;
    })
    .join("\n");
}
