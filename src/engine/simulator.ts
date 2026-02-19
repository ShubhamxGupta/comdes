import { ParsingTable, ParsingStep } from './types';

/**
 * Simulates LL(1) parsing process step-by-step.
 */
export function simulateLL1(
  input: string[],
  table: ParsingTable,
  startSymbol: string
): ParsingStep[] {
  const steps: ParsingStep[] = [];
  const stack = ['$', startSymbol];
  const inputBuffer = [...input, '$'];
  
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
      action: ''
    };

    if (top === '$') {
      if (currentInput === '$') {
        step.action = 'Accept';
        steps.push(step);
        break;
      } else {
        step.action = 'Error: Stack empty but input remains';
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
      
      step.action = `Output ${prod.lhs} -> ${prod.rhs.join(' ')}`;
      stack.pop();
      
      // Push RHS in reverse order (unless epsilon)
      if (prod.rhs.length === 1 && prod.rhs[0] === 'ε') {
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
