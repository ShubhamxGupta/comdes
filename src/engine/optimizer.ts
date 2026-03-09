// ============================================================
// Basic Block Partitioning, DAG Construction, & Optimization
// ============================================================

// --- Types ---

export interface TACInstr {
  index: number;
  raw: string;
  op: string; // +, -, *, /, =, goto, if, param, call, return
  arg1: string;
  arg2: string;
  result: string;
  isLeader: boolean;
  blockId: number;
}

export interface BasicBlock {
  id: number;
  label: string;
  instructions: TACInstr[];
  successors: number[];
}

export interface DAGNode {
  id: number;
  label: string; // operator or leaf value
  isLeaf: boolean;
  left?: number; // child DAG node id
  right?: number; // child DAG node id
  attachedNames: string[]; // variables that hold this value
}

export interface OptimizationNote {
  type: "cse" | "dead_code" | "constant_fold" | "copy_prop";
  description: string;
  blockId: number;
}

export interface OptimizerResult {
  instructions: TACInstr[];
  blocks: BasicBlock[];
  dagPerBlock: Map<number, DAGNode[]>;
  optimizations: OptimizationNote[];
}

// --- TAC Parser ---

function parseTACLine(line: string, index: number): TACInstr {
  const trimmed = line.trim();

  // goto L
  const gotoMatch = trimmed.match(/^goto\s+(\w+)$/i);
  if (gotoMatch) {
    return {
      index,
      raw: trimmed,
      op: "goto",
      arg1: gotoMatch[1],
      arg2: "",
      result: "",
      isLeader: false,
      blockId: -1,
    };
  }

  // if x relop y goto L
  const ifMatch = trimmed.match(
    /^if\s+(.+?)\s+(<=|>=|<|>|==|!=)\s+(.+?)\s+goto\s+(\w+)$/i,
  );
  if (ifMatch) {
    return {
      index,
      raw: trimmed,
      op: "if_goto",
      arg1: ifMatch[1],
      arg2: `${ifMatch[2]} ${ifMatch[3]}`,
      result: ifMatch[4],
      isLeader: false,
      blockId: -1,
    };
  }

  // Label:  (e.g. L1:)
  const labelMatch = trimmed.match(/^(\w+):$/);
  if (labelMatch) {
    return {
      index,
      raw: trimmed,
      op: "label",
      arg1: labelMatch[1],
      arg2: "",
      result: "",
      isLeader: false,
      blockId: -1,
    };
  }

  // x = y op z
  const binMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\s*([+\-*/])\s*(\w+)$/);
  if (binMatch) {
    return {
      index,
      raw: trimmed,
      op: binMatch[3],
      arg1: binMatch[2],
      arg2: binMatch[4],
      result: binMatch[1],
      isLeader: false,
      blockId: -1,
    };
  }

  // x = op y (unary minus)
  const unaryMatch = trimmed.match(/^(\w+)\s*=\s*(-)\s*(\w+)$/);
  if (unaryMatch) {
    return {
      index,
      raw: trimmed,
      op: "uminus",
      arg1: unaryMatch[3],
      arg2: "",
      result: unaryMatch[1],
      isLeader: false,
      blockId: -1,
    };
  }

  // x = y (copy)
  const copyMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)$/);
  if (copyMatch) {
    return {
      index,
      raw: trimmed,
      op: "=",
      arg1: copyMatch[2],
      arg2: "",
      result: copyMatch[1],
      isLeader: false,
      blockId: -1,
    };
  }

  // param x
  const paramMatch = trimmed.match(/^param\s+(\w+)$/i);
  if (paramMatch) {
    return {
      index,
      raw: trimmed,
      op: "param",
      arg1: paramMatch[1],
      arg2: "",
      result: "",
      isLeader: false,
      blockId: -1,
    };
  }

  // call p, n
  const callMatch = trimmed.match(/^call\s+(\w+)\s*,\s*(\d+)$/i);
  if (callMatch) {
    return {
      index,
      raw: trimmed,
      op: "call",
      arg1: callMatch[1],
      arg2: callMatch[2],
      result: "",
      isLeader: false,
      blockId: -1,
    };
  }

  // return x
  const retMatch = trimmed.match(/^return\s+(\w+)?$/i);
  if (retMatch) {
    return {
      index,
      raw: trimmed,
      op: "return",
      arg1: retMatch[1] || "",
      arg2: "",
      result: "",
      isLeader: false,
      blockId: -1,
    };
  }

  // Fallback
  return {
    index,
    raw: trimmed,
    op: "unknown",
    arg1: "",
    arg2: "",
    result: "",
    isLeader: false,
    blockId: -1,
  };
}

// --- Leader identification & Basic Block construction ---

function identifyLeaders(instrs: TACInstr[]): void {
  if (instrs.length === 0) return;
  // Rule 1: First instruction is a leader
  instrs[0].isLeader = true;

  // Collect all jump targets
  const jumpTargets = new Set<string>();
  for (const instr of instrs) {
    if (instr.op === "goto") jumpTargets.add(instr.arg1);
    if (instr.op === "if_goto") jumpTargets.add(instr.result);
  }

  for (let i = 0; i < instrs.length; i++) {
    // Rule 2: Target of a jump is a leader
    if (instrs[i].op === "label" && jumpTargets.has(instrs[i].arg1)) {
      instrs[i].isLeader = true;
    }
    // Rule 3: Instruction immediately after a jump is a leader
    if (
      (instrs[i].op === "goto" || instrs[i].op === "if_goto") &&
      i + 1 < instrs.length
    ) {
      instrs[i + 1].isLeader = true;
    }
  }
}

function partitionBlocks(instrs: TACInstr[]): BasicBlock[] {
  identifyLeaders(instrs);
  const blocks: BasicBlock[] = [];
  let currentBlock: TACInstr[] = [];
  let blockId = 0;

  for (const instr of instrs) {
    if (instr.isLeader && currentBlock.length > 0) {
      blocks.push({
        id: blockId,
        label: `B${blockId}`,
        instructions: currentBlock,
        successors: [],
      });
      blockId++;
      currentBlock = [];
    }
    instr.blockId = blockId;
    currentBlock.push(instr);
  }
  if (currentBlock.length > 0) {
    blocks.push({
      id: blockId,
      label: `B${blockId}`,
      instructions: currentBlock,
      successors: [],
    });
  }

  // Build successor edges
  for (let i = 0; i < blocks.length; i++) {
    const lastInstr = blocks[i].instructions[blocks[i].instructions.length - 1];
    if (lastInstr.op === "goto") {
      // Find block containing te target label
      const target = blocks.find((b) =>
        b.instructions.some(
          (inst) => inst.op === "label" && inst.arg1 === lastInstr.arg1,
        ),
      );
      if (target) blocks[i].successors.push(target.id);
    } else if (lastInstr.op === "if_goto") {
      const target = blocks.find((b) =>
        b.instructions.some(
          (inst) => inst.op === "label" && inst.arg1 === lastInstr.result,
        ),
      );
      if (target) blocks[i].successors.push(target.id);
      if (i + 1 < blocks.length) blocks[i].successors.push(i + 1);
    } else {
      if (i + 1 < blocks.length) blocks[i].successors.push(i + 1);
    }
  }

  return blocks;
}

// --- DAG Construction within a Basic Block ---

function buildDAG(block: BasicBlock): DAGNode[] {
  const nodes: DAGNode[] = [];
  // Map from variable/constant name to the DAG node id that currently holds it
  const nameToNode = new Map<string, number>();
  // Map from (op, leftId, rightId) string key to existing DAG node id (for CSE)
  const exprToNode = new Map<string, number>();

  let nextId = 0;

  function getOrCreateLeaf(name: string): number {
    if (nameToNode.has(name)) return nameToNode.get(name)!;
    const id = nextId++;
    nodes.push({ id, label: name, isLeaf: true, attachedNames: [name] });
    nameToNode.set(name, id);
    return id;
  }

  for (const instr of block.instructions) {
    if (
      instr.op === "label" ||
      instr.op === "goto" ||
      instr.op === "if_goto" ||
      instr.op === "param" ||
      instr.op === "call" ||
      instr.op === "return" ||
      instr.op === "unknown"
    ) {
      continue;
    }

    if (instr.op === "=") {
      // Copy statement: x = y
      const srcId = getOrCreateLeaf(instr.arg1);
      // Detach result from old node
      for (const n of nodes) {
        n.attachedNames = n.attachedNames.filter(
          (name) => name !== instr.result,
        );
      }
      nodes[srcId].attachedNames.push(instr.result);
      nameToNode.set(instr.result, srcId);
    } else {
      // Binary or unary op
      const leftId = getOrCreateLeaf(instr.arg1);
      const rightId = instr.arg2 ? getOrCreateLeaf(instr.arg2) : -1;

      const key =
        rightId >= 0
          ? `${instr.op}_${leftId}_${rightId}`
          : `${instr.op}_${leftId}`;

      if (exprToNode.has(key)) {
        // Common subexpression found!
        const existingId = exprToNode.get(key)!;
        // Detach result from old node
        for (const n of nodes) {
          n.attachedNames = n.attachedNames.filter(
            (name) => name !== instr.result,
          );
        }
        nodes[existingId].attachedNames.push(instr.result);
        nameToNode.set(instr.result, existingId);
      } else {
        const id = nextId++;
        const newNode: DAGNode = {
          id,
          label: instr.op,
          isLeaf: false,
          left: leftId,
          right: rightId >= 0 ? rightId : undefined,
          attachedNames: [instr.result],
        };
        nodes.push(newNode);
        exprToNode.set(key, id);
        // Detach result from old node
        for (const n of nodes) {
          if (n.id !== id) {
            n.attachedNames = n.attachedNames.filter(
              (name) => name !== instr.result,
            );
          }
        }
        nameToNode.set(instr.result, id);
      }
    }
  }

  return nodes;
}

// --- Optimization detection ---

function detectOptimizations(
  blocks: BasicBlock[],
  dagPerBlock: Map<number, DAGNode[]>,
): OptimizationNote[] {
  const notes: OptimizationNote[] = [];

  for (const block of blocks) {
    const dag = dagPerBlock.get(block.id);
    if (!dag) continue;

    // CSE: if a DAG interior node has more than one attached name
    for (const node of dag) {
      if (!node.isLeaf && node.attachedNames.length > 1) {
        notes.push({
          type: "cse",
          description: `Common subexpression: ${node.attachedNames.join(", ")} share the same computation (${node.label})`,
          blockId: block.id,
        });
      }
    }

    // Dead code: leaf nodes with no attached names (original var was reassigned)
    for (const node of dag) {
      if (node.attachedNames.length === 0) {
        notes.push({
          type: "dead_code",
          description: `Potential dead code: intermediate node (${node.label}) has no live variable attached`,
          blockId: block.id,
        });
      }
    }

    // Constant folding: binary op where both args are numeric constants
    for (const instr of block.instructions) {
      if (["+", "-", "*", "/"].includes(instr.op)) {
        if (/^\d+$/.test(instr.arg1) && /^\d+$/.test(instr.arg2)) {
          const a = parseInt(instr.arg1),
            b = parseInt(instr.arg2);
          let val: number | null = null;
          if (instr.op === "+") val = a + b;
          if (instr.op === "-") val = a - b;
          if (instr.op === "*") val = a * b;
          if (instr.op === "/" && b !== 0) val = Math.floor(a / b);
          if (val !== null) {
            notes.push({
              type: "constant_fold",
              description: `Constant folding: ${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2} → ${instr.result} = ${val}`,
              blockId: block.id,
            });
          }
        }
      }
    }

    // Copy propagation: x = y can be eliminated if x is always replaced by y
    for (const instr of block.instructions) {
      if (instr.op === "=") {
        notes.push({
          type: "copy_prop",
          description: `Copy propagation candidate: ${instr.result} = ${instr.arg1}. Replace all uses of ${instr.result} with ${instr.arg1}.`,
          blockId: block.id,
        });
      }
    }
  }

  return notes;
}

// --- Main Export ---

export function optimizeTAC(input: string): OptimizerResult {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const instructions = lines.map((line, i) => parseTACLine(line, i));

  const blocks = partitionBlocks(instructions);
  const dagPerBlock = new Map<number, DAGNode[]>();

  for (const block of blocks) {
    const dag = buildDAG(block);
    dagPerBlock.set(block.id, dag);
  }

  const optimizations = detectOptimizations(blocks, dagPerBlock);

  return { instructions, blocks, dagPerBlock, optimizations };
}
