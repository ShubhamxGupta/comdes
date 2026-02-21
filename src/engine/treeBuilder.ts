import { Node, Edge } from "reactflow";
import { ParsingTable, ParsingStep } from "./types";

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  width?: number; // for layout
  x?: number;
  y?: number;
}

export function buildParseTree(
  input: string[],
  table: ParsingTable,
  startSymbol: string,
): { nodes: Node[]; edges: Edge[] } {
  const root: TreeNode = { id: "0", label: startSymbol, children: [] };

  // Stack now holds the tree node corresponding to the symbol
  const stack: { symbol: string; node: TreeNode }[] = [
    { symbol: "$", node: { id: "end", label: "$", children: [] } }, // Dummy end
    { symbol: startSymbol, node: root },
  ];

  const inputBuffer = [...input, "$"];
  let nodeIdCounter = 1;
  const maxSteps = 200;
  let steps = 0;

  while (stack.length > 0 && steps < maxSteps) {
    steps++;
    // Peek
    const topItem = stack[stack.length - 1];
    const topToken = topItem.symbol;
    const topNode = topItem.node;

    const currentInput = inputBuffer[0];

    // 1. Success
    if (topToken === "$") {
      break;
    }

    // 2. Match
    if (topToken === currentInput) {
      stack.pop();
      inputBuffer.shift();
      continue;
    }

    // 3. Expand
    if (table[topToken] && table[topToken][currentInput]) {
      const prod = table[topToken][currentInput][0];
      stack.pop(); // Remove LHS

      // Create children
      const rhsNodes: TreeNode[] = [];

      if (prod.rhs.length === 1 && prod.rhs[0] === "ε") {
        // Epsilon case: Add a node for epsilon
        const epsilonNode: TreeNode = {
          id: `${nodeIdCounter++}`,
          label: "ε",
          children: [],
        };
        topNode.children.push(epsilonNode);
        // Do not push to stack (it's empty)
      } else {
        // Normal case
        for (const symbol of prod.rhs) {
          const child: TreeNode = {
            id: `${nodeIdCounter++}`,
            label: symbol,
            children: [],
          };
          rhsNodes.push(child);
          topNode.children.push(child);
        }

        // Push to stack in reverse
        for (let i = rhsNodes.length - 1; i >= 0; i--) {
          stack.push({ symbol: rhsNodes[i].label, node: rhsNodes[i] });
        }
      }
    } else {
      // Error path: Stop (tree will be partial)
      break;
    }
  }

  // Convert Tree to Nodes/Edges with Layout
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Simple Reingold-Tilford-ish layout (simplified)
  let xCounter = 0;

  function layout(node: TreeNode, depth: number) {
    if (node.children.length === 0) {
      node.x = xCounter * 60;
      xCounter++;
    } else {
      node.children.forEach((child) => layout(child, depth + 1));
      // Center over children
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x! + lastChild.x!) / 2;
    }
    node.y = depth * 80;
  }

  layout(root, 0);

  function traverse(node: TreeNode) {
    if (!node.x && node.x !== 0) node.x = 0;
    if (!node.y && node.y !== 0) node.y = 0;

    nodes.push({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: { label: node.label },
      type: "default",
      style: {
        background: "#fff",
        border: "1px solid #777",
        borderRadius: "5px",
        width: 50,
        textAlign: "center",
        fontWeight: node.children.length > 0 ? "bold" : "normal",
      },
    });

    node.children.forEach((child) => {
      edges.push({
        id: `e${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        type: "smoothstep",
      });
      traverse(child);
    });
  }

  traverse(root);

  return { nodes, edges };
}

export function buildLRTree(
  steps: ParsingStep[],
  grammar: { startSymbol: string },
): { nodes: Node[]; edges: Edge[] } {
  let nodeIdCounter = 0;
  // Node stack stores TreeNodes
  const nodeStack: TreeNode[] = [];

  for (const step of steps) {
    const action = step.action;

    if (action.startsWith("s")) {
      // Shift
      // step.input is buffer BEFORE shift.
      // symbol shifted is input[0].
      const symbol = step.input[0];
      if (symbol && symbol !== "$") {
        const node = {
          id: `node-${nodeIdCounter++}`,
          label: symbol,
          children: [],
        };
        nodeStack.push(node);
      }
    } else if (action.startsWith("r")) {
      // Reduce
      const match = action.match(/r\((.*) -> (.*)\)/);
      if (match) {
        const lhs = match[1].trim();
        const rhsStr = match[2].trim();
        // Handle epsilon
        const isEpsilon = rhsStr === "" || rhsStr === "ε";
        const rhsLength = isEpsilon ? 0 : rhsStr.split(" ").length;

        const children: TreeNode[] = [];
        for (let i = 0; i < rhsLength; i++) {
          // Popping from stack gives children in reverse order (rightmost first)
          const child = nodeStack.pop();
          if (child) children.unshift(child);
        }

        // If epsilon, we might want to show an epsilon node?
        if (isEpsilon) {
          children.push({
            id: `node-${nodeIdCounter++}`,
            label: "ε",
            children: [],
          });
        }

        const newNode = {
          id: `node-${nodeIdCounter++}`,
          label: lhs,
          children: children,
        };
        nodeStack.push(newNode);
      }
    } else if (action === "Accept") {
      // Done
    }
  }

  // Expect 1 node on stack (Start Symbol)
  const root =
    nodeStack.length > 0
      ? nodeStack[0]
      : { id: "root", label: grammar.startSymbol, children: [] };

  // Layout logic
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Better Layout: Assign X based on in-order traversal (leaf order)
  let leafCounter = 0;
  const assignLeafX = (node: TreeNode) => {
    if (!node.children || node.children.length === 0) {
      node.x = leafCounter * 80;
      leafCounter++;
    } else {
      node.children.forEach((c: TreeNode) => assignLeafX(c));
      // Center parent
      const first = node.children[0];
      const last = node.children[node.children.length - 1];
      const firstX = first.x ?? 0;
      const lastX = last.x ?? 0;
      node.x = (firstX + lastX) / 2;
    }
  };

  const assignY = (node: TreeNode, depth: number) => {
    node.y = depth * 100;
    if (node.children) {
      node.children.forEach((c: TreeNode) => assignY(c, depth + 1));
    }
  };

  assignLeafX(root);
  assignY(root, 0);

  const traverseFinal = (node: TreeNode) => {
    nodes.push({
      id: node.id,
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: { label: node.label },
      type: "default",
      style: {
        background: "#fff",
        border: "1px solid #777",
        borderRadius: "5px",
        width: 50,
        textAlign: "center",
        fontWeight:
          node.children && node.children.length > 0 ? "bold" : "normal",
      },
    });
    if (node.children) {
      node.children.forEach((c: TreeNode) => {
        edges.push({
          id: `e-${node.id}-${c.id}`,
          source: node.id,
          target: c.id,
          type: "smoothstep",
        });
        traverseFinal(c);
      });
    }
  };

  traverseFinal(root);

  return { nodes, edges };
}
