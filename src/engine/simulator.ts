import { ParsingStep, ParsingTable, LRTable } from "./types";

/**
 * Simulates LL(1) parsing process step-by-step.
 */
export function simulateLL1(
  input: string[],
  table: ParsingTable,
  startSymbol: string,
): ParsingStep[] {
  const steps: ParsingStep[] = [];
  const stack = ["$", startSymbol];
  const inputBuffer = [...input, "$"];

  let stepCount = 0;
  const maxSteps = 1000; // prevent infinite loops

  while (stack.length > 0 && stepCount < maxSteps) {
    stepCount++;
    const top = stack[stack.length - 1]; // peek
    const currentInput = inputBuffer[0];

    // Create step snapshot (before action)
    const step: ParsingStep = {
      stack: [...stack],
      input: [...inputBuffer],
      action: "",
    };

    if (top === "$") {
      if (currentInput === "$") {
        step.action = "Accept";
        steps.push(step);
        break;
      } else {
        step.action = "Error: Stack empty but input remains";
        steps.push(step);
        break;
      }
    }

    if (top === currentInput) {
      // Match
      step.action = `Match ${top}`;
      stack.pop();
      inputBuffer.shift();
      steps.push(step);
    } else if (table[top] && table[top][currentInput]) {
      // Predict / Expand
      const productions = table[top][currentInput];
      // LL(1) should have only 1 production in cell
      const prod = productions[0];

      step.action = `Output ${prod.lhs} -> ${prod.rhs.join(" ")}`;
      stack.pop();

      // Push RHS in reverse order (unless epsilon)
      if (prod.rhs.length === 1 && prod.rhs[0] === "ε") {
        // Do nothing (just pop LHS)
      } else {
        for (let i = prod.rhs.length - 1; i >= 0; i--) {
          stack.push(prod.rhs[i]);
        }
      }
      steps.push(step);
    } else {
      // Error
      step.action = `Error: No rule for M[${top}, ${currentInput}]`;
      steps.push(step);
      break;
    }
  }

  return steps;
}

export function simulateLR(input: string[], table: LRTable): ParsingStep[] {
  const steps: ParsingStep[] = [];
  const stack: { state: number; symbol: string | null }[] = [
    { state: 0, symbol: null },
  ];
  const inputBuffer = [...input, "$"];

  let stepCount = 0;
  const maxSteps = 1000;

  while (stepCount < maxSteps) {
    stepCount++;
    const currentState = stack[stack.length - 1].state;
    const currentToken = inputBuffer[0];

    const action = table.action[currentState]?.[currentToken];

    // Only snapshot for non-accept actions to avoid duplicate Accept entries
    if (action !== "acc") {
      steps.push({
        stack: stack.map((s) =>
          s.symbol ? `${s.symbol} ${s.state}` : `${s.state}`,
        ),
        input: [...inputBuffer],
        action: action || "Error",
        explanation: action
          ? undefined
          : `No action allowed for state ${currentState} on '${currentToken}'`,
      });
    }

    if (!action) break;

    if (action.startsWith("s")) {
      // SHIFT
      const nextStateId = parseInt(action.substring(1));
      stack.push({ state: nextStateId, symbol: currentToken });
      inputBuffer.shift();
    } else if (action.startsWith("r")) {
      // REDUCE
      const match = action.match(/r\((.*) -> (.*)\)/);
      if (match) {
        const lhs = match[1].trim();
        const rhsStr = match[2].trim();
        const rhs = rhsStr === "" || rhsStr === "ε" ? [] : rhsStr.split(" ");

        const popCount = rhs.length;

        for (let i = 0; i < popCount; i++) {
          stack.pop();
        }

        const topState = stack[stack.length - 1].state;
        const gotoState = table.goto[topState]?.[lhs];

        if (gotoState === undefined) {
          steps.push({
            stack: [],
            input: [],
            action: "Error",
            explanation: `No Goto`,
          });
          break;
        }

        stack.push({ state: gotoState, symbol: lhs });
      } else {
        break;
      }
    } else if (action === "acc") {
      steps.push({
        stack: stack.map((s) => `${s.state}`),
        input: [""],
        action: "Accept",
        explanation: "Parsing completed successfully",
      });
      break;
    }
  }

  return steps;
}
