"use client";

import { useState, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Loader2, ArrowLeft, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { optimizeTAC, OptimizerResult } from "@/engine/optimizer";

const EXAMPLES = [
  {
    label: "Common Subexpressions",
    code: `t1 = a + b\nt2 = a + b\nt3 = t1 * t2\nx = t3`,
  },
  {
    label: "Constant Folding",
    code: `t1 = 3 + 5\nt2 = t1 * 2\nx = t2 + a`,
  },
  {
    label: "Loop with Goto",
    code: `i = 1\nL1:\nt1 = i * 4\nt2 = a + t1\nx = t2\ni = i + 1\nif i <= 10 goto L1\nreturn x`,
  },
  {
    label: "Copy Propagation",
    code: `a = b + c\nd = a\ne = d + f\ng = e`,
  },
];

export default function OptimizerPage() {
  const [input, setInput] = useState(EXAMPLES[0].code);
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = optimizeTAC(input);
      setResult(res);
      toast.success(
        `Partitioned into ${res.blocks.length} basic blocks, found ${res.optimizations.length} optimization(s)`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed: " + msg);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const optTypeColor: Record<string, string> = {
    cse: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
    dead_code: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
    constant_fold:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    copy_prop:
      "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  };

  const optTypeLabel: Record<string, string> = {
    cse: "Common Subexpression",
    dead_code: "Dead Code",
    constant_fold: "Constant Folding",
    copy_prop: "Copy Propagation",
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Basic Block & DAG Optimizer
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Partition TAC into Basic Blocks, Build DAGs, Apply Optimizations
          </p>
        </div>
        <Button
          onClick={handleOptimize}
          disabled={loading || !input.trim()}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Analyze & Optimize
            </>
          )}
        </Button>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-background"
      >
        {/* Input Panel */}
        <ResizablePanel defaultSize={35} minSize={25} className="flex flex-col">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Three-Address Code</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"t1 = a + b\nt2 = t1 * c\n..."}
                className="font-mono text-sm min-h-[200px] resize-none"
                rows={12}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Load Example
              </Label>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <Button
                    key={ex.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(ex.code)}
                  >
                    {ex.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/20">
              <p className="font-medium text-foreground">
                Supported TAC Format:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <code>x = y op z</code> (binary: +, -, *, /)
                </li>
                <li>
                  <code>x = y</code> (copy)
                </li>
                <li>
                  <code>goto L</code> (unconditional jump)
                </li>
                <li>
                  <code>if x relop y goto L</code> (conditional)
                </li>
                <li>
                  <code>L:</code> (label)
                </li>
              </ul>
            </div>

            {error && (
              <div className="text-sm text-red-500 border border-red-500/30 rounded-lg p-3 bg-red-500/5">
                {error}
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Output Panel */}
        <ResizablePanel
          defaultSize={65}
          minSize={40}
          className="flex flex-col min-h-0"
        >
          {result ? (
            <Tabs
              defaultValue="blocks"
              className="flex flex-col flex-1 min-h-0"
            >
              <TabsList className="rounded-none border-b bg-background justify-start px-2 h-12 w-full overflow-x-auto">
                <TabsTrigger value="blocks" className="text-sm">
                  Basic Blocks
                </TabsTrigger>
                <TabsTrigger value="dag" className="text-sm">
                  DAG
                </TabsTrigger>
                <TabsTrigger value="optimizations" className="text-sm">
                  Optimizations
                  {result.optimizations.length > 0 && (
                    <span className="ml-1.5 bg-primary/10 text-primary text-[10px] rounded-full px-1.5">
                      {result.optimizations.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Basic Blocks Tab */}
              <TabsContent
                value="blocks"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">
                  Basic Block Partition
                </h3>
                <div className="space-y-4">
                  {result.blocks.map((block) => (
                    <div
                      key={block.id}
                      className="border rounded-xl overflow-hidden"
                    >
                      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b">
                        <span className="font-mono font-bold text-primary">
                          {block.label}
                        </span>
                        {block.successors.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            → {block.successors.map((s) => `B${s}`).join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        {block.instructions.map((instr) => (
                          <div
                            key={instr.index}
                            className="flex items-center gap-3 font-mono text-sm"
                          >
                            <span className="text-muted-foreground w-6 text-right text-xs">
                              {instr.index}
                            </span>
                            <span
                              className={
                                instr.isLeader ? "text-primary font-bold" : ""
                              }
                            >
                              {instr.raw}
                            </span>
                            {instr.isLeader && (
                              <span className="text-[10px] text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded">
                                Leader
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* DAG Tab */}
              <TabsContent value="dag" className="flex-1 overflow-auto p-4 m-0">
                <h3 className="font-bold text-lg mb-4">
                  DAG Representation (per block)
                </h3>
                <div className="space-y-6">
                  {result.blocks.map((block) => {
                    const dag = result.dagPerBlock.get(block.id);
                    if (!dag || dag.length === 0) return null;
                    return (
                      <div
                        key={block.id}
                        className="border rounded-xl overflow-hidden"
                      >
                        <div className="bg-muted/50 px-4 py-2 font-mono font-bold text-primary border-b">
                          {block.label} — DAG Nodes
                        </div>
                        <div className="p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="px-3 py-1.5 font-semibold">
                                  ID
                                </th>
                                <th className="px-3 py-1.5 font-semibold">
                                  Label
                                </th>
                                <th className="px-3 py-1.5 font-semibold">
                                  Type
                                </th>
                                <th className="px-3 py-1.5 font-semibold">
                                  Left
                                </th>
                                <th className="px-3 py-1.5 font-semibold">
                                  Right
                                </th>
                                <th className="px-3 py-1.5 font-semibold">
                                  Attached Variables
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {dag.map((node) => (
                                <tr
                                  key={node.id}
                                  className="border-t border-border/20 hover:bg-muted/20"
                                >
                                  <td className="px-3 py-1.5 font-mono text-primary font-bold">
                                    n{node.id}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {node.label}
                                  </td>
                                  <td className="px-3 py-1.5 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded ${node.isLeaf ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}
                                    >
                                      {node.isLeaf ? "Leaf" : "Op"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {node.left !== undefined
                                      ? `n${node.left}`
                                      : "—"}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {node.right !== undefined
                                      ? `n${node.right}`
                                      : "—"}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono text-amber-600 dark:text-amber-400">
                                    {node.attachedNames.length > 0
                                      ? node.attachedNames.join(", ")
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Optimizations Tab */}
              <TabsContent
                value="optimizations"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Detected Optimizations
                </h3>
                {result.optimizations.length === 0 ? (
                  <div className="text-muted-foreground text-sm p-6 text-center border rounded-xl bg-muted/10">
                    No optimizations detected for this code.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.optimizations.map((opt, i) => (
                      <div
                        key={i}
                        className={`border rounded-xl p-4 ${optTypeColor[opt.type] || ""}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {optTypeLabel[opt.type] || opt.type}
                          </span>
                          <span className="text-xs opacity-60">
                            in {`B${opt.blockId}`}
                          </span>
                        </div>
                        <p className="text-sm">{opt.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <div className="text-6xl">⊕</div>
                <p className="text-lg font-medium">Enter Three-Address Code</p>
                <p className="text-sm">
                  Click &quot;Analyze & Optimize&quot; to partition into basic
                  blocks and construct DAGs
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
