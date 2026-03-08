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
  nonTerminals?: Set<string>;
}

// Custom Node for LR State
const StateNode = ({
  data,
}: {
  data: { id: number; items: LRItem[]; nonTerminals?: Set<string> };
}) => {
  return (
    <div className="border border-border/60 rounded-xl bg-background shadow-md overflow-hidden min-w-[220px] max-w-[340px] transition-all hover:shadow-lg hover:border-border">
      <div className="bg-muted/40 px-4 py-2 border-b border-border/30 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/70 shadow-sm"></div>
          State {data.id}
        </span>
      </div>
      <div className="p-3 space-y-2 bg-background/50">
        {data.items.map((item, idx) => (
          <div
            key={idx}
            className="text-[12px] font-mono leading-relaxed text-foreground/90 flex flex-wrap items-center break-words"
          >
            <span className="font-bold text-primary mr-1.5">{item.lhs}</span>
            <span className="text-muted-foreground mx-1.5 text-[10px]">
              &rarr;
            </span>{" "}
            {item.rhs.map((s, i) => (
              <span key={i} className="tracking-tight mr-1">
                {i === item.dotIndex && (
                  <span className="text-destructive font-black mx-1 inline-block transform scale-125">
                    •
                  </span>
                )}
                <span
                  className={
                    !data.nonTerminals?.has(s)
                      ? "text-green-700 dark:text-green-500"
                      : "text-blue-700 dark:text-blue-500 font-semibold"
                  }
                >
                  {s}
                </span>
              </span>
            ))}
            {item.dotIndex === item.rhs.length && (
              <span className="text-destructive font-black mx-1 inline-block transform scale-125">
                •
              </span>
            )}
            {item.lookahead && item.lookahead.length > 0 && (
              <span className="text-muted-foreground/80 ml-2 font-semibold bg-muted/40 px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-widest inline-flex gap-1 border border-border/40">
                {item.lookahead.join(" / ")}
              </span>
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

function InnerAutomataGraph({ collection, nonTerminals }: AutomataGraphProps) {
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
        data: { id: state.id, items: state.items, nonTerminals },
        // style: { border: '1px solid #777', padding: 10, borderRadius: 5, backgroundColor: 'white' }
      };
    });

    // Build Edges
    const newEdges: Edge[] = [];
    collection.states.forEach((state) => {
      Object.entries(state.transitions).forEach(([symbol, nextStateId]) => {
        const isTerminal = nonTerminals
          ? !nonTerminals.has(symbol)
          : symbol === symbol.toLowerCase() && symbol !== symbol.toUpperCase();
        newEdges.push({
          id: `e${state.id}-${symbol}-${nextStateId}`,
          source: state.id.toString(),
          target: nextStateId.toString(),
          label: symbol,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isTerminal
              ? "hsl(var(--destructive))"
              : "hsl(var(--primary))",
          },
          style: {
            strokeWidth: 2,
            stroke: isTerminal
              ? "hsl(var(--destructive) / 0.6)"
              : "hsl(var(--primary) / 0.6)",
          },
          labelStyle: {
            fill: isTerminal
              ? "hsl(var(--destructive))"
              : "hsl(var(--primary))",
            fontWeight: 800,
            fontSize: 13,
          },
          labelBgStyle: {
            fill: "hsl(var(--background))",
            fillOpacity: 0.8,
            rx: 4,
            ry: 4,
          },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [collection, setNodes, setEdges, fitView]);

  return (
    <div className="h-full min-h-[500px] border-0 rounded-xl bg-muted/5 relative overflow-hidden ring-1 ring-border/50">
      {nodes.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center gap-2 text-foreground">
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
            <span className="font-bold opacity-80">{nodes.length}</span> States
            Generated
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1.5} />
        <Controls className="bg-background border shadow-sm rounded-md overflow-hidden" />
        <MiniMap
          zoomable
          pannable
          nodeClassName="bg-primary/20 rounded-sm"
          className="bg-background border shadow-sm rounded-lg overflow-hidden"
          maskColor="hsl(var(--muted) / 0.5)"
        />
      </ReactFlow>
    </div>
  );
}

export function AutomataGraph({
  collection,
  nonTerminals,
}: AutomataGraphProps) {
  if (!collection) return null;

  return (
    <ReactFlowProvider>
      <InnerAutomataGraph collection={collection} nonTerminals={nonTerminals} />
    </ReactFlowProvider>
  );
}
