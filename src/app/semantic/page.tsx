"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { problems } from "@/data/problems";
import { AlertCircle, Play, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { parseSDTGrammar, evaluateSDT, SDTStep } from "@/engine/semantic";
import { computeFirstSets, computeFollowSets } from "@/engine/sets";
import { buildSLRTable } from "@/engine/parsing/lr";
import { simulateLR } from "@/engine/simulator";
import { buildSDTTree } from "@/engine/treeBuilder";
import { AnnotatedParseTreeVisualizer } from "@/components/visualizer/AnnotatedParseTree";
import { Node, Edge } from "reactflow";

const DEFAULT_GRAMMAR = `E -> E + T { $$ = $1 + $3 }
E -> T { $$ = $1 }
T -> T * F { $$ = $1 * $3 }
T -> F { $$ = $1 }
F -> ( E ) { $$ = $2 }
F -> id { $$ = $1 }`;

const DEFAULT_INPUT = "id:5 + id:3 * id:4";

export default function SemanticPage() {
  const [grammarInput, setGrammarInput] = useState(DEFAULT_GRAMMAR);
  const [testString, setTestString] = useState(DEFAULT_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const [sdtSteps, setSdtSteps] = useState<SDTStep[]>([]);
  const [finalValue, setFinalValue] = useState<unknown>(undefined);
  const [treeData, setTreeData] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  const handleSolve = useCallback(() => {
    if (!grammarInput.trim() || !testString.trim() || isComputing) return;
    setIsComputing(true);
    setTimeout(() => {
      try {
        setError(null);
        // 1. Parse SDT Grammar
        const grammar = parseSDTGrammar(grammarInput);

        // 2. Prepare Sets & Table
        const first = computeFirstSets(grammar);
        const follow = computeFollowSets(grammar, first);
        const slrResult = buildSLRTable(grammar, follow);

        if (slrResult.conflicts.length > 0) {
          throw new Error(
            "Grammar has conflicts in SLR(1) table: " +
              slrResult.conflicts.join(", "),
          );
        }

        // 3. Simulate LR
        const originalTokens = testString
          .trim()
          .split(/\s+/)
          .filter((t) => t.length > 0);
        const tokens = originalTokens.map((t) =>
          t.includes(":") ? t.split(":")[0] : t,
        );
        const parsingSteps = simulateLR(tokens, slrResult.table);

        // 4. Evaluate SDT
        const { finalValue, steps } = evaluateSDT(
          grammar,
          parsingSteps,
          originalTokens,
        );

        setSdtSteps(steps);
        setFinalValue(finalValue);

        // 5. Build Tree
        const tree = buildSDTTree(steps, grammar);
        setTreeData(tree);
        toast.success("Evaluation Successful", {
          description: `Parsed input and generated ${steps.length} semantic steps.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(message);
        setSdtSteps([]);
        setFinalValue(undefined);
        setTreeData(null);
        toast.error("Semantic Analysis Failed", {
          description: message,
        });
      } finally {
        setIsComputing(false);
      }
    }, 50);
  }, [grammarInput, testString, isComputing]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to evaluate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSolve();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSolve]);

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Semantic Solver (SDT)
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Evaluate Assigned Attributes Across the Parse Tree
          </p>
        </div>
        <Button
          onClick={handleSolve}
          disabled={!grammarInput.trim() || !testString.trim() || isComputing}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {isComputing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Evaluate Definition
            </>
          )}
        </Button>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-background"
      >
        {/* Left Panel: Input */}
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          className="flex flex-col p-6 gap-6"
        >
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="sdt-grammar"
                  className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                >
                  SDT Rules
                </Label>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs shadow-md border-muted">
                    <p className="text-xs">
                      Syntax: <code>LHS -&gt; RHS {"{ action }"}</code>. Use{" "}
                      <code className="text-primary font-bold">$$</code> for LHS
                      attribute, and{" "}
                      <code className="text-primary font-bold">$1</code>,{" "}
                      <code className="text-primary font-bold">$2</code> for RHS
                      values.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(id) => {
                    const problem = problems.find((p) => p.id === id);
                    if (problem) {
                      setGrammarInput(problem.grammar);
                      setTestString(problem.testInput);
                    }
                  }}
                >
                  <SelectTrigger className="w-[160px] h-7 text-xs">
                    <SelectValue placeholder="Load Example" />
                  </SelectTrigger>
                  <SelectContent>
                    {problems
                      .filter((p) => p.recommendedSolver === "Semantic")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              id="sdt-grammar"
              className="flex-1 font-mono text-[13px] leading-relaxed resize-none tracking-tight p-4 bg-muted/10 border-muted focus-visible:ring-primary/20"
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Label
                htmlFor="sdt-input"
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
              >
                Test Sequence with Values
              </Label>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs shadow-md border-muted">
                  <p className="text-xs">
                    Input tokens separated by spaces. Format tokens with
                    assigned values like{" "}
                    <code className="text-primary font-bold">id:5</code>.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="sdt-input"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="id:5 + id:3"
              className="font-mono text-[13px] p-4 h-12 bg-muted/10 border-muted focus-visible:ring-primary/20"
              suppressHydrationWarning
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-destructive shadow-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Semantic Error</AlertTitle>
              <AlertDescription className="text-xs font-mono break-all mt-1 opacity-90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gradient-to-br from-primary/10 to-blue-500/5 p-6 border rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[100px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-40 mix-blend-multiply" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary/70 mb-1 z-10">
              Evaluation Result
            </h3>
            <div className="text-4xl font-extrabold text-foreground tracking-tight z-10">
              {finalValue !== undefined ? (
                String(finalValue)
              ) : (
                <span className="text-muted-foreground/30">--</span>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-border/50 transition-colors hover:bg-primary/20 active:bg-primary"
        />

        {/* Right Panel: Output */}
        <ResizablePanel
          defaultSize={65}
          className="bg-muted/30 p-6 flex flex-col"
        >
          <Tabs defaultValue="tree" className="h-full flex flex-col">
            <TabsList className="grid w-[400px] grid-cols-2 p-1 bg-muted/50 border shadow-sm rounded-lg">
              <TabsTrigger
                value="tree"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Annotated Parse Tree
              </TabsTrigger>
              <TabsTrigger
                value="steps"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Evaluation Steps
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 overflow-auto bg-background rounded-xl border shadow-sm p-1">
              <TabsContent
                value="tree"
                className="h-full w-full m-0 relative rounded-lg overflow-hidden"
              >
                <AnnotatedParseTreeVisualizer treeData={treeData} />
              </TabsContent>

              <TabsContent value="steps" className="h-full m-0 p-4">
                {sdtSteps.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left font-mono">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-r w-[20%]">
                            Action
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[25%] text-right">
                            Input Buffer
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[30%] text-right text-primary/80">
                            Semantic Stack
                          </th>
                          <th className="px-5 py-4 font-bold border-b w-[25%] text-green-600 dark:text-green-500">
                            Evaluated $$
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {sdtSteps.map((step, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-5 py-3 border-r whitespace-nowrap text-foreground font-medium">
                              {step.action}
                            </td>
                            <td className="px-5 py-3 border-r whitespace-nowrap text-right text-muted-foreground/80">
                              {step.input.join(" ")}
                            </td>
                            <td className="px-5 py-3 border-r whitespace-nowrap text-right bg-primary/[0.02]">
                              {JSON.stringify(step.semanticStack)}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap font-bold text-green-700 dark:text-green-400 bg-green-500/[0.02]">
                              {step.evaluatedValue !== undefined
                                ? JSON.stringify(step.evaluatedValue)
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No steps generated yet.
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
