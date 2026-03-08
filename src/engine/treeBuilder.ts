import { Node, Edge } from "reactflow";
import { ParsingTable, ParsingStep } from "./types";
import dagre from "dagre";

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

  function traverse(node: TreeNode) {
    nodes.push({
      id: node.id,
      position: { x: 0, y: 0 },
      data: { label: node.label },
      type: "default",
      style: {
        background:
          node.children.length === 0
            ? "hsl(var(--muted) / 0.5)"
            : "hsl(var(--background))",
        border:
          node.children.length === 0
            ? "1px dashed hsl(var(--border))"
            : "1px solid hsl(var(--border) / 0.8)",
        borderRadius: "8px",
        minWidth: 50,
        padding: "8px 12px",
        textAlign: "center",
        color:
          node.children.length === 0
            ? "hsl(var(--muted-foreground))"
            : "hsl(var(--foreground))",
        fontWeight: node.children.length > 0 ? "700" : "500",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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

  if (nodes.length === 0) return { nodes: [], edges: [] };

  // Assign Dagre Layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    // estimate width roughly based on label length
    const estimatedWidth = Math.max(50, node.data.label.length * 10 + 24);
    dagreGraph.setNode(node.id, { width: estimatedWidth, height: 40 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 30, // center offset (width/2)
      y: nodeWithPosition.y - 20, // center offset (height/2)
    };
  });

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

  const traverseFinal = (node: TreeNode) => {
    nodes.push({
      id: node.id,
      position: { x: 0, y: 0 },
      data: { label: node.label },
      type: "default",
      style: {
        background:
          node.children.length === 0
            ? "hsl(var(--muted) / 0.5)"
            : "hsl(var(--background))",
        border:
          node.children.length === 0
            ? "1px dashed hsl(var(--border))"
            : "1px solid hsl(var(--border) / 0.8)",
        borderRadius: "8px",
        minWidth: 50,
        padding: "8px 12px",
        textAlign: "center",
        color:
          node.children.length === 0
            ? "hsl(var(--muted-foreground))"
            : "hsl(var(--foreground))",
        fontWeight: node.children.length > 0 ? "700" : "500",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
    });
    if (node.children) {
      node.children.forEach((c) => {
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

  if (root) traverseFinal(root);

  if (nodes.length === 0) return { nodes: [], edges: [] };

  // Assign Dagre Layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    const estimatedWidth = Math.max(50, node.data.label.length * 10 + 24);
    dagreGraph.setNode(node.id, { width: estimatedWidth, height: 40 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 30, // center offset (width/2)
      y: nodeWithPosition.y - 20, // center offset (height/2)
    };
  });

  return { nodes, edges };
}

import { SDTStep } from "./semantic";

export function buildSDTTree(
  steps: SDTStep[],
  grammar: { startSymbol: string },
): { nodes: Node[]; edges: Edge[] } {
  let nodeIdCounter = 0;

  interface SDTTreeNode {
    id: string;
    label: string;
    val?: any; // Semantic value
    children: SDTTreeNode[];
    x?: number;
    y?: number;
  }

  const nodeStack: SDTTreeNode[] = [];

  for (const step of steps) {
    const action = step.action;

    if (action.startsWith("Shift")) {
      const match = action.match(/Shift (.*)/);
      if (match) {
        const symbol = match[1].trim();
        if (symbol && symbol !== "$") {
          // Find the value pushed to semantic stack for this shifted token
          // In semantic.ts, evaluatedValue isn't set for Shift, but the value is pushed to semanticStack
          // Wait, we need to know the value. It's the top of semanticStack
          const val =
            step.semanticStack.length > 0
              ? step.semanticStack[step.semanticStack.length - 1]
              : undefined;
          const node: SDTTreeNode = {
            id: `sdt-${nodeIdCounter++}`,
            label: symbol,
            val,
            children: [],
          };
          nodeStack.push(node);
        }
      }
    } else if (action.startsWith("Reduce")) {
      const match = action.match(/Reduce (.*) -> (.*)/);
      if (match) {
        const lhs = match[1].trim();
        const rhsStr = match[2].trim();
        const isEpsilon = rhsStr === "" || rhsStr === "ε";
        const rhsLength = isEpsilon ? 0 : rhsStr.split(" ").length;

        const children: SDTTreeNode[] = [];
        for (let i = 0; i < rhsLength; i++) {
          const child = nodeStack.pop();
          if (child) children.unshift(child);
        }

        if (isEpsilon) {
          children.push({
            id: `sdt-${nodeIdCounter++}`,
            label: "ε",
            children: [],
          });
        }

        // The evaluated value is in step.evaluatedValue
        const newNode: SDTTreeNode = {
          id: `sdt-${nodeIdCounter++}`,
          label: lhs,
          val: step.evaluatedValue,
          children: children,
        };
        nodeStack.push(newNode);
      }
    }
  }

  const root =
    nodeStack.length > 0
      ? nodeStack[0]
      : { id: "sdt-root", label: grammar.startSymbol, children: [] };

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverseFinal = (node: SDTTreeNode) => {
    const displayLabel =
      node.val !== undefined
        ? `${node.label}\n(val: ${typeof node.val === "number" ? Math.round(node.val * 100) / 100 : node.val})`
        : node.label;

    nodes.push({
      id: node.id,
      position: { x: 0, y: 0 },
      data: { label: displayLabel },
      type: "default",
      style: {
        background:
          node.val !== undefined
            ? "hsl(var(--primary) / 0.1)"
            : "hsl(var(--background))",
        border:
          node.val !== undefined
            ? "2px solid hsl(var(--primary))"
            : "1px solid hsl(var(--border) / 0.8)",
        borderRadius: "8px",
        minWidth: 80,
        padding: "8px 12px",
        textAlign: "center",
        color:
          node.val !== undefined
            ? "hsl(var(--foreground))"
            : "hsl(var(--muted-foreground))",
        fontWeight:
          node.children && node.children.length > 0 ? "bold" : "normal",
        whiteSpace: "pre-line",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
    });
    if (node.children) {
      node.children.forEach((c) => {
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

  if (nodes.length === 0) return { nodes: [], edges: [] };

  // Assign Dagre Layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Increase separation slightly more for SDT with long labels
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    const lines = node.data.label.split("\n");
    const maxLineLen = Math.max(...lines.map((l: string) => l.length));
    const estimatedWidth = Math.max(80, maxLineLen * 9 + 20);
    dagreGraph.setNode(node.id, { width: estimatedWidth, height: 50 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 50, // center offset (width/2)
      y: nodeWithPosition.y - 30, // center offset (height/2)
    };
  });

  return { nodes, edges };
}
