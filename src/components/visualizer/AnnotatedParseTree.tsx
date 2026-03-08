import { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

interface AnnotatedParseTreeProps {
  treeData: { nodes: Node[]; edges: Edge[] } | null;
}

function InnerAnnotatedParseTree({ treeData }: AnnotatedParseTreeProps) {
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!treeData) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: newNodes, edges: newEdges } = treeData;

    // Resolve CSS variables at runtime since ReactFlow inline styles
    // don't support hsl(var(--...)) syntax
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const bg = `oklch(${styles.getPropertyValue("--background").trim()})`;
    const fg = `oklch(${styles.getPropertyValue("--foreground").trim()})`;
    const border = `oklch(${styles.getPropertyValue("--border").trim()})`;
    const primary = `oklch(${styles.getPropertyValue("--primary").trim()})`;

    const visibleNodes = newNodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        background: node.data?.label?.includes("val:")
          ? `color-mix(in oklch, ${primary} 15%, ${bg})`
          : bg,
        color: fg,
        border: node.data?.label?.includes("val:")
          ? `2px solid ${primary}`
          : `1px solid ${border}`,
        borderRadius: "8px",
        boxShadow: node.data?.label?.includes("val:")
          ? "0 4px 12px rgba(2, 132, 199, 0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        fontSize: "12px",
        padding: "8px 12px",
        fontWeight: node.data?.label?.includes("val:") ? "700" : "500",
        whiteSpace: "pre-line" as const,
      },
    }));

    const visibleEdges = newEdges.map((edge) => ({
      ...edge,
      style: { stroke: primary, strokeWidth: 1.5, opacity: 0.6 },
      animated: true,
    }));

    setNodes(visibleNodes);
    setEdges(visibleEdges);
  }, [treeData, setNodes, setEdges]);

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
    <div
      style={{ width: "100%", height: "100%", minHeight: "600px" }}
      className="border-0 rounded-xl bg-muted/5 relative overflow-hidden ring-1 ring-border/50"
    >
      {nodes.length > 0 ? (
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center gap-2 text-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
            <span className="font-bold opacity-80">{nodes.length}</span>{" "}
            Annotated Nodes Rendered
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3 w-full text-center max-w-sm px-6">
            <div className="h-10 w-10 text-muted-foreground/30 flex items-center justify-center rounded-lg bg-muted/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              No Tree generated
            </p>
            <span className="text-muted-foreground/60 text-[11px] font-medium leading-relaxed">
              Ensure steps evaluated correctly under Semantic Solver table.
            </span>
          </div>
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

export function AnnotatedParseTreeVisualizer(props: AnnotatedParseTreeProps) {
  return (
    <ReactFlowProvider>
      <InnerAnnotatedParseTree {...props} />
    </ReactFlowProvider>
  );
}
