import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGrammarStore } from "@/store/useGrammarStore";

interface ParseTreeProps {
  type: "LL1" | "LR";
}

function InnerParseTreeVisualizer({ type }: ParseTreeProps) {
  const { ll1ParseTree, lrParseTree } = useGrammarStore();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const treeData = type === "LL1" ? ll1ParseTree : lrParseTree;

    if (!treeData) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: newNodes, edges: newEdges } = treeData;

    // Force styles for visibility
    const visibleNodes = newNodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        background: "white",
        color: "black",
        border: "1px solid black",
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      },
    }));

    const visibleEdges = newEdges.map((edge) => ({
      ...edge,
      style: { stroke: "black", strokeWidth: 2 },
      animated: true,
    }));

    setNodes(visibleNodes);
    setEdges(visibleEdges);
  }, [ll1ParseTree, lrParseTree, type, setNodes, setEdges]);

  // Separate effect for fitting view
  useEffect(() => {
    if (nodes.length > 0) {
      const timeout = setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [nodes, fitView]);

  return (
    <div className="h-[500px] border rounded bg-slate-50 relative overflow-hidden">
      {nodes.length > 0 ? (
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center gap-2 text-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {nodes.length} Nodes Rendered
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <p className="text-muted-foreground text-sm font-medium">
            Waiting for parse tree generation...
          </p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.1}
        maxZoom={4}
        fitView
      >
        <Background color="#ccc" gap={20} />
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

export function ParseTreeVisualizer(props: ParseTreeProps) {
  return (
    <ReactFlowProvider>
      <InnerParseTreeVisualizer {...props} />
    </ReactFlowProvider>
  );
}
