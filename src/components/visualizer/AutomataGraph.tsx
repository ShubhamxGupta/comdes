import { useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { CanonicalCollection, LRItem } from "@/engine/types";

interface AutomataGraphProps {
  collection: CanonicalCollection;
}

// Custom Node for LR State
const StateNode = ({ data }: { data: { id: number; items: LRItem[] } }) => {
  return (
    <div className="border border-foreground/20 rounded-md bg-card shadow-sm min-w-[200px]">
      <div className="bg-muted px-3 py-1 border-b border-foreground/10 text-xs font-bold flex justify-between">
        <span>State {data.id}</span>
      </div>
      <div className="p-2 space-y-1">
        {data.items.map((item, idx) => (
          <div key={idx} className="text-[10px] font-mono whitespace-nowrap">
            {item.lhs} &rarr;{" "}
            {item.rhs.map((s, i) => (
              <span key={i}>
                {i === item.dotIndex && (
                  <span className="text-red-500 font-bold">.</span>
                )}
                {s}{" "}
              </span>
            ))}
            {item.dotIndex === item.rhs.length && (
              <span className="text-red-500 font-bold">.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  lrState: StateNode,
};

function InnerAutomataGraph({ collection }: AutomataGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!collection) return;

    // Build Nodes
    // Simple grid layout or force layout needed. For now, basic vertical stacking with safe spacing
    // Better: usage of `dagre` for layouting, but let's try a naive tiered approach

    // Use a simple layout: transitions define depth.
    // Identify levels (BFS)
    const levels: Map<number, number> = new Map();
    levels.set(collection.startStateId, 0);
    const queue = [collection.startStateId];
    const visited = new Set<number>();
    visited.add(collection.startStateId);

    while (queue.length > 0) {
      const currId = queue.shift()!;
      const currLevel = levels.get(currId)!;
      const state = collection.states.find((s) => s.id === currId);

      if (state) {
        Object.values(state.transitions).forEach((nextId) => {
          if (!visited.has(nextId)) {
            visited.add(nextId);
            levels.set(nextId, currLevel + 1);
            queue.push(nextId);
          }
        });
      }
    }

    const levelCounts: { [key: number]: number } = {};

    const newNodes: Node[] = collection.states.map((state) => {
      const level = levels.get(state.id) || 0;
      const count = levelCounts[level] || 0;
      levelCounts[level] = count + 1;

      return {
        id: state.id.toString(),
        type: "lrState",
        position: { x: level * 350, y: count * 200 }, // Spread out
        data: { id: state.id, items: state.items },
        // style: { border: '1px solid #777', padding: 10, borderRadius: 5, backgroundColor: 'white' }
      };
    });

    // Build Edges
    const newEdges: Edge[] = [];
    collection.states.forEach((state) => {
      Object.entries(state.transitions).forEach(([symbol, nextStateId]) => {
        newEdges.push({
          id: `e${state.id}-${symbol}-${nextStateId}`,
          source: state.id.toString(),
          target: nextStateId.toString(),
          label: symbol,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2 },
          labelStyle: { fill: "var(--foreground)", fontWeight: 700 },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [collection, setNodes, setEdges, fitView]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="bg-muted/5">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#888" gap={16} size={1} />
        <Controls />
        <MiniMap
          zoomable
          pannable
          nodeClassName="bg-primary/20"
          className="bg-background border shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

export function AutomataGraph({ collection }: AutomataGraphProps) {
  if (!collection) return null;

  return (
    <ReactFlowProvider>
      <InnerAutomataGraph collection={collection} />
    </ReactFlowProvider>
  );
}
