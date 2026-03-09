// ============================================================
// RE to DFA — Direct Method (Augmented RE → Syntax Tree → DFA)
// ============================================================

// --- Types ---

export interface SyntaxTreeNode {
  id: number;
  type: "leaf" | "cat" | "or" | "star";
  symbol?: string; // only for leaf nodes
  position?: number; // position number for non-ε leaves
  nullable: boolean;
  firstpos: Set<number>;
  lastpos: Set<number>;
  left?: SyntaxTreeNode;
  right?: SyntaxTreeNode;
}

export interface FollowposEntry {
  position: number;
  symbol: string;
  followpos: number[];
}

export interface DFAState {
  id: number;
  label: string; // e.g. "{1,2,3}"
  positions: number[];
  isAccepting: boolean;
}

export interface DFATransition {
  from: number;
  to: number;
  symbol: string;
}

export interface ReDfaResult {
  tree: SyntaxTreeNode;
  positions: { pos: number; symbol: string }[];
  followposTable: FollowposEntry[];
  states: DFAState[];
  transitions: DFATransition[];
  alphabet: string[];
}

// --- Tokenizer for RE ---

type REToken =
  | { type: "char"; value: string }
  | { type: "or" }
  | { type: "star" }
  | { type: "plus" }
  | { type: "question" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenizeRE(re: string): REToken[] {
  const tokens: REToken[] = [];
  let i = 0;
  while (i < re.length) {
    const ch = re[i];
    if (ch === "\\") {
      i++;
      if (i < re.length) {
        tokens.push({ type: "char", value: re[i] });
      }
    } else if (ch === "|") {
      tokens.push({ type: "or" });
    } else if (ch === "*") {
      tokens.push({ type: "star" });
    } else if (ch === "+") {
      tokens.push({ type: "plus" });
    } else if (ch === "?") {
      tokens.push({ type: "question" });
    } else if (ch === "(") {
      tokens.push({ type: "lparen" });
    } else if (ch === ")") {
      tokens.push({ type: "rparen" });
    } else if (ch !== " ") {
      tokens.push({ type: "char", value: ch });
    }
    i++;
  }
  return tokens;
}

// --- RE Parser (recursive descent) → Syntax Tree ---
// Grammar:
//   expr   → term ('|' term)*
//   term   → factor factor*
//   factor → base ('*' | '+' | '?')*
//   base   → char | '(' expr ')'

let nodeIdCounter = 0;
let positionCounter = 0;
let positionMap: Map<number, string>;

function makeLeaf(symbol: string, assignPos: boolean): SyntaxTreeNode {
  const pos = assignPos ? ++positionCounter : undefined;
  if (pos !== undefined) {
    positionMap.set(pos, symbol);
  }
  return {
    id: ++nodeIdCounter,
    type: "leaf",
    symbol,
    position: pos,
    nullable: false,
    firstpos: pos !== undefined ? new Set([pos]) : new Set(),
    lastpos: pos !== undefined ? new Set([pos]) : new Set(),
  };
}

function makeCat(left: SyntaxTreeNode, right: SyntaxTreeNode): SyntaxTreeNode {
  const nullable = left.nullable && right.nullable;
  const firstpos = new Set(left.firstpos);
  if (left.nullable) {
    for (const p of right.firstpos) firstpos.add(p);
  }
  const lastpos = new Set(right.lastpos);
  if (right.nullable) {
    for (const p of left.lastpos) lastpos.add(p);
  }
  return {
    id: ++nodeIdCounter,
    type: "cat",
    nullable,
    firstpos,
    lastpos,
    left,
    right,
  };
}

function makeOr(left: SyntaxTreeNode, right: SyntaxTreeNode): SyntaxTreeNode {
  const firstpos = new Set(left.firstpos);
  for (const p of right.firstpos) firstpos.add(p);
  const lastpos = new Set(left.lastpos);
  for (const p of right.lastpos) lastpos.add(p);
  return {
    id: ++nodeIdCounter,
    type: "or",
    nullable: left.nullable || right.nullable,
    firstpos,
    lastpos,
    left,
    right,
  };
}

function makeStar(child: SyntaxTreeNode): SyntaxTreeNode {
  return {
    id: ++nodeIdCounter,
    type: "star",
    nullable: true,
    firstpos: new Set(child.firstpos),
    lastpos: new Set(child.lastpos),
    left: child,
  };
}

class REParser {
  private tokens: REToken[];
  private pos: number;

  constructor(tokens: REToken[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): REToken | undefined {
    return this.tokens[this.pos];
  }

  private consume(): REToken {
    return this.tokens[this.pos++];
  }

  parseExpr(): SyntaxTreeNode {
    let node = this.parseTerm();
    while (this.peek()?.type === "or") {
      this.consume(); // eat '|'
      const right = this.parseTerm();
      node = makeOr(node, right);
    }
    return node;
  }

  parseTerm(): SyntaxTreeNode {
    let node = this.parseFactor();
    // Implicit concatenation: next token is a char or lparen
    while (
      this.peek() &&
      this.peek()!.type !== "or" &&
      this.peek()!.type !== "rparen"
    ) {
      const right = this.parseFactor();
      node = makeCat(node, right);
    }
    return node;
  }

  parseFactor(): SyntaxTreeNode {
    let node = this.parseBase();
    while (
      this.peek()?.type === "star" ||
      this.peek()?.type === "plus" ||
      this.peek()?.type === "question"
    ) {
      const op = this.consume();
      if (op.type === "star") {
        node = makeStar(node);
      } else if (op.type === "plus") {
        // r+ = r • r*
        const starCopy = makeStar(node);
        node = makeCat(node, starCopy);
      } else if (op.type === "question") {
        // r? = r | ε
        const epsilonNode: SyntaxTreeNode = {
          id: ++nodeIdCounter,
          type: "leaf",
          symbol: "ε",
          nullable: true,
          firstpos: new Set(),
          lastpos: new Set(),
        };
        node = makeOr(node, epsilonNode);
      }
    }
    return node;
  }

  parseBase(): SyntaxTreeNode {
    const tok = this.peek();
    if (!tok) throw new Error("Unexpected end of regex");
    if (tok.type === "lparen") {
      this.consume(); // eat '('
      const node = this.parseExpr();
      if (this.peek()?.type !== "rparen") {
        throw new Error("Expected ')'");
      }
      this.consume(); // eat ')'
      return node;
    }
    if (tok.type === "char") {
      this.consume();
      return makeLeaf(tok.value, true);
    }
    throw new Error(`Unexpected token: ${JSON.stringify(tok)}`);
  }
}

// --- Followpos computation ---

function computeFollowpos(
  root: SyntaxTreeNode,
  totalPositions: number,
): Map<number, Set<number>> {
  const followpos = new Map<number, Set<number>>();
  for (let i = 1; i <= totalPositions; i++) {
    followpos.set(i, new Set());
  }

  function traverse(node: SyntaxTreeNode) {
    if (node.left) traverse(node.left);
    if (node.right) traverse(node.right);

    if (node.type === "cat" && node.left && node.right) {
      // Rule 1: For cat node c1 • c2
      for (const i of node.left.lastpos) {
        const fp = followpos.get(i)!;
        for (const j of node.right.firstpos) {
          fp.add(j);
        }
      }
    } else if (node.type === "star" && node.left) {
      // Rule 2: For star node c*
      for (const i of node.left.lastpos) {
        const fp = followpos.get(i)!;
        for (const j of node.left.firstpos) {
          fp.add(j);
        }
      }
    }
  }

  traverse(root);
  return followpos;
}

// --- DFA Construction ---

function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const val of a) if (!b.has(val)) return false;
  return true;
}

function setToSortedArray(s: Set<number>): number[] {
  return Array.from(s).sort((a, b) => a - b);
}

function setLabel(s: Set<number>): string {
  return `{${setToSortedArray(s).join(",")}}`;
}

// --- Main Export ---

export function convertREToDFA(regex: string): ReDfaResult {
  // Reset globals
  nodeIdCounter = 0;
  positionCounter = 0;
  positionMap = new Map();

  // Step 1: Tokenize
  const tokens = tokenizeRE(regex);

  // Step 2: Parse into syntax tree
  const parser = new REParser(tokens);
  const exprTree = parser.parseExpr();

  // Step 3: Augment with end marker #
  const endLeaf = makeLeaf("#", true);
  const augmentedTree = makeCat(exprTree, endLeaf);
  const endPosition = endLeaf.position!;

  const totalPositions = positionCounter;

  // Step 4: Compute followpos
  const followposMap = computeFollowpos(augmentedTree, totalPositions);

  // Build positions list
  const positions: { pos: number; symbol: string }[] = [];
  for (let i = 1; i <= totalPositions; i++) {
    positions.push({ pos: i, symbol: positionMap.get(i) || "?" });
  }

  // Build alphabet (exclude #)
  const alphabetSet = new Set<string>();
  for (const [, sym] of positionMap) {
    if (sym !== "#") alphabetSet.add(sym);
  }
  const alphabet = Array.from(alphabetSet).sort();

  // Build followpos table
  const followposTable: FollowposEntry[] = [];
  for (let i = 1; i <= totalPositions; i++) {
    followposTable.push({
      position: i,
      symbol: positionMap.get(i) || "?",
      followpos: setToSortedArray(followposMap.get(i)!),
    });
  }

  // Step 5: Construct DFA
  const states: DFAState[] = [];
  const transitions: DFATransition[] = [];
  const unmarked: Set<number>[] = [];
  const allSets: Set<number>[] = [];

  const startSet = new Set(augmentedTree.firstpos);
  allSets.push(startSet);
  unmarked.push(startSet);
  states.push({
    id: 0,
    label: setLabel(startSet),
    positions: setToSortedArray(startSet),
    isAccepting: startSet.has(endPosition),
  });

  function findStateIndex(s: Set<number>): number {
    for (let i = 0; i < allSets.length; i++) {
      if (setsEqual(allSets[i], s)) return i;
    }
    return -1;
  }

  while (unmarked.length > 0) {
    const currentSet = unmarked.pop()!;
    const currentIdx = findStateIndex(currentSet);

    for (const a of alphabet) {
      // U = union of followpos(p) for all p in currentSet where symbol(p) == a
      const U = new Set<number>();
      for (const p of currentSet) {
        if (positionMap.get(p) === a) {
          for (const fp of followposMap.get(p)!) {
            U.add(fp);
          }
        }
      }

      if (U.size === 0) continue;

      let existingIdx = findStateIndex(U);
      if (existingIdx === -1) {
        existingIdx = allSets.length;
        allSets.push(U);
        unmarked.push(U);
        states.push({
          id: existingIdx,
          label: setLabel(U),
          positions: setToSortedArray(U),
          isAccepting: U.has(endPosition),
        });
      }

      transitions.push({
        from: currentIdx,
        to: existingIdx,
        symbol: a,
      });
    }
  }

  return {
    tree: augmentedTree,
    positions,
    followposTable,
    states,
    transitions,
    alphabet,
  };
}
