// ============================================================
// Target Code Generator — Liveness, Next-Use, Register Alloc
// ============================================================

// --- Types ---

export interface CodegenInstr {
  index: number;
  raw: string;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
}

export interface LivenessEntry {
  instrIndex: number;
  variable: string;
  isLive: boolean;
  nextUse: number | null; // instruction index of next use, or null if dead
}

export interface RegisterDescriptor {
  register: string;
  contents: string[]; // variables currently in this register
}

export interface AssemblyInstr {
  label: string;
  comment: string;
}

export interface CodegenResult {
  instructions: CodegenInstr[];
  livenessTable: LivenessEntry[];
  assembly: AssemblyInstr[];
  registerDescriptors: RegisterDescriptor[];
  numRegisters: number;
}

// --- TAC Parser (reuse same format) ---

function parseCodegenLine(line: string, index: number): CodegenInstr {
  const trimmed = line.trim();

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
    };
  }

  // x = -y (unary)
  const unaryMatch = trimmed.match(/^(\w+)\s*=\s*(-)\s*(\w+)$/);
  if (unaryMatch) {
    return {
      index,
      raw: trimmed,
      op: "uminus",
      arg1: unaryMatch[3],
      arg2: "",
      result: unaryMatch[1],
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
    };
  }

  return { index, raw: trimmed, op: "unknown", arg1: "", arg2: "", result: "" };
}

// --- Liveness & Next-Use computation (backward scan) ---

function computeLiveness(instrs: CodegenInstr[]): LivenessEntry[] {
  const entries: LivenessEntry[] = [];

  // Collect all variables
  const allVars = new Set<string>();
  for (const instr of instrs) {
    if (instr.result && instr.op !== "unknown") allVars.add(instr.result);
    if (instr.arg1 && !/^\d+$/.test(instr.arg1)) allVars.add(instr.arg1);
    if (instr.arg2 && !/^\d+$/.test(instr.arg2)) allVars.add(instr.arg2);
  }

  // For each variable, track liveness and next-use at each instruction
  // Scan backwards
  const varState = new Map<string, { live: boolean; nextUse: number | null }>();

  // Initialize: all non-temp variables are live at exit
  for (const v of allVars) {
    const isTemp = /^t\d+$/.test(v);
    varState.set(v, { live: !isTemp, nextUse: null });
  }

  // Backward scan
  for (let i = instrs.length - 1; i >= 0; i--) {
    const instr = instrs[i];
    if (instr.op === "unknown") continue;

    // Record current state for each variable used/defined
    const varsInInstr = new Set<string>();
    if (instr.result) varsInInstr.add(instr.result);
    if (instr.arg1 && !/^\d+$/.test(instr.arg1)) varsInInstr.add(instr.arg1);
    if (instr.arg2 && !/^\d+$/.test(instr.arg2)) varsInInstr.add(instr.arg2);

    for (const v of varsInInstr) {
      const state = varState.get(v) || { live: false, nextUse: null };
      entries.push({
        instrIndex: i,
        variable: v,
        isLive: state.live,
        nextUse: state.nextUse,
      });
    }

    // Step 1: Attach info about result (LHS) — after recording
    // The result variable is now DEAD (until a use below revives it)
    if (instr.result) {
      varState.set(instr.result, { live: false, nextUse: null });
    }

    // Step 2: arg1 and arg2 are now LIVE with next-use = i
    if (instr.arg1 && !/^\d+$/.test(instr.arg1)) {
      varState.set(instr.arg1, { live: true, nextUse: i });
    }
    if (instr.arg2 && !/^\d+$/.test(instr.arg2)) {
      varState.set(instr.arg2, { live: true, nextUse: i });
    }
  }

  return entries;
}

// --- Simple Register Allocation (getReg) ---

interface RegState {
  name: string;
  contents: Set<string>; // variables currently in this register
}

function generateAssembly(
  instrs: CodegenInstr[],
  numRegisters: number,
): {
  assembly: AssemblyInstr[];
  finalDescriptors: RegisterDescriptor[];
} {
  const assembly: AssemblyInstr[] = [];

  // Initialize register pool
  const registers: RegState[] = [];
  for (let i = 0; i < numRegisters; i++) {
    registers.push({ name: `R${i}`, contents: new Set() });
  }

  // Address descriptor: maps variable -> locations (register names or "memory")
  const addrDesc = new Map<string, Set<string>>();

  function getAddrOf(v: string): Set<string> {
    if (!addrDesc.has(v)) addrDesc.set(v, new Set(["memory"]));
    return addrDesc.get(v)!;
  }

  function findRegContaining(v: string): RegState | undefined {
    return registers.find((r) => r.contents.has(v));
  }

  function getReg(needed: string, avoid?: string): RegState {
    // 1. If variable is already in a register, use it
    const existing = findRegContaining(needed);
    if (existing) return existing;

    // 2. Find an empty register
    const empty = registers.find((r) => r.contents.size === 0);
    if (empty) return empty;

    // 3. Spill: find a register whose variable is also in memory or least useful
    // Prefer register not holding the "avoid" variable
    let best: RegState | undefined;
    for (const r of registers) {
      if (avoid && r.contents.has(avoid)) continue;
      best = r;
      break;
    }
    if (!best) best = registers[0];

    // Spill all variables in this register
    for (const v of best.contents) {
      const locs = getAddrOf(v);
      if (!locs.has("memory")) {
        assembly.push({
          label: `ST ${v}, ${best.name}`,
          comment: `spill ${v} to memory`,
        });
        locs.add("memory");
      }
    }
    best.contents.clear();
    return best;
  }

  for (const instr of instrs) {
    if (instr.op === "unknown") continue;

    if (instr.op === "=") {
      // Copy: result = arg1
      const srcReg = findRegContaining(instr.arg1);
      if (srcReg) {
        // Already in register
        srcReg.contents.add(instr.result);
        getAddrOf(instr.result).clear();
        getAddrOf(instr.result).add(srcReg.name);
        assembly.push({
          label: `# ${instr.result} = ${instr.arg1} (already in ${srcReg.name})`,
          comment: "copy via register",
        });
      } else {
        const reg = getReg(instr.arg1);
        assembly.push({
          label: `LD ${reg.name}, ${instr.arg1}`,
          comment: `load ${instr.arg1}`,
        });
        reg.contents.clear();
        reg.contents.add(instr.arg1);
        reg.contents.add(instr.result);
        getAddrOf(instr.arg1).add(reg.name);
        getAddrOf(instr.result).clear();
        getAddrOf(instr.result).add(reg.name);
      }
    } else if (["+", "-", "*", "/"].includes(instr.op)) {
      const opMap: Record<string, string> = {
        "+": "ADD",
        "-": "SUB",
        "*": "MUL",
        "/": "DIV",
      };
      const mnemonic = opMap[instr.op] || instr.op;

      // Get or load arg1 into a register
      let arg1Reg = findRegContaining(instr.arg1);
      if (!arg1Reg) {
        arg1Reg = getReg(instr.arg1, instr.arg2);
        assembly.push({
          label: `LD ${arg1Reg.name}, ${instr.arg1}`,
          comment: `load ${instr.arg1}`,
        });
        arg1Reg.contents.clear();
        arg1Reg.contents.add(instr.arg1);
        getAddrOf(instr.arg1).add(arg1Reg.name);
      }

      // Determine arg2 source
      const arg2Reg = findRegContaining(instr.arg2);
      const arg2Src = arg2Reg ? arg2Reg.name : instr.arg2;
      if (!arg2Reg && instr.arg2 && !/^\d+$/.test(instr.arg2)) {
        // Need to load arg2 too if not a constant
        const r2 = getReg(instr.arg2, instr.arg1);
        assembly.push({
          label: `LD ${r2.name}, ${instr.arg2}`,
          comment: `load ${instr.arg2}`,
        });
        r2.contents.clear();
        r2.contents.add(instr.arg2);
        getAddrOf(instr.arg2).add(r2.name);
        assembly.push({
          label: `${mnemonic} ${arg1Reg.name}, ${arg1Reg.name}, ${r2.name}`,
          comment: instr.raw,
        });
      } else {
        assembly.push({
          label: `${mnemonic} ${arg1Reg.name}, ${arg1Reg.name}, ${arg2Src}`,
          comment: instr.raw,
        });
      }

      // Result is now in arg1Reg
      // Remove old variable tracking
      arg1Reg.contents.clear();
      arg1Reg.contents.add(instr.result);
      getAddrOf(instr.result).clear();
      getAddrOf(instr.result).add(arg1Reg.name);
      // arg1 is no longer exclusively in this register
      const arg1Locs = getAddrOf(instr.arg1);
      arg1Locs.delete(arg1Reg.name);
    } else if (instr.op === "uminus") {
      let srcReg = findRegContaining(instr.arg1);
      if (!srcReg) {
        srcReg = getReg(instr.arg1);
        assembly.push({
          label: `LD ${srcReg.name}, ${instr.arg1}`,
          comment: `load ${instr.arg1}`,
        });
        srcReg.contents.clear();
        srcReg.contents.add(instr.arg1);
      }
      assembly.push({ label: `NEG ${srcReg.name}`, comment: instr.raw });
      srcReg.contents.clear();
      srcReg.contents.add(instr.result);
      getAddrOf(instr.result).clear();
      getAddrOf(instr.result).add(srcReg.name);
    }
  }

  // At end, store all live variables back to memory
  for (const reg of registers) {
    for (const v of reg.contents) {
      const isTemp = /^t\d+$/.test(v);
      if (!isTemp) {
        const locs = getAddrOf(v);
        if (!locs.has("memory")) {
          assembly.push({
            label: `ST ${v}, ${reg.name}`,
            comment: `store ${v} back to memory`,
          });
        }
      }
    }
  }

  const finalDescriptors: RegisterDescriptor[] = registers.map((r) => ({
    register: r.name,
    contents: Array.from(r.contents),
  }));

  return { assembly, finalDescriptors };
}

// --- Main Export ---

export function generateTargetCode(
  input: string,
  numRegisters: number = 3,
): CodegenResult {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const instructions = lines.map((line, i) => parseCodegenLine(line, i));

  const livenessTable = computeLiveness(instructions);
  const { assembly, finalDescriptors } = generateAssembly(
    instructions,
    numRegisters,
  );

  return {
    instructions,
    livenessTable,
    assembly,
    registerDescriptors: finalDescriptors,
    numRegisters,
  };
}
