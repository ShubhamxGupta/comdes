"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { problems } from "@/data/problems";
import { useGrammarStore } from "@/store/useGrammarStore";
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
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, Play, Share2, Wand2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { ParserType, ParsingStep } from "@/engine/types";

// Visualizers
import { ParseTreeVisualizer } from "@/components/visualizer/ParseTree";
import { ParsingTableVisualizer } from "@/components/visualizer/ParsingTable";
import { AutomataGraph } from "@/components/visualizer/AutomataGraph";

import { eliminateLeftRecursion, leftFactor } from "@/engine/transformations";

function SolverContent() {
  const {
    rawInput,
    setRawInput,
    testInput,
    setTestInput,
    parse,
    error,
    parsedGrammar,
    ll1Table,
    slrTable,
    canonicalCollection,
    firstSets,
    followSets,
    selectedParsers,
    setSelectedParsers,
    clrTable,
    lalrTable,
    ll1Steps,
    slrSteps,
    clrSteps,
    lalrSteps,
  } = useGrammarStore();

  const [activeTab, setActiveTab] = useState("sets");
  const [treeType, setTreeType] = useState<"LL1" | "SLR1" | "CLR1" | "LALR1">(
    "LL1",
  );
  const [automataType, setAutomataType] = useState<"LR0" | "LR1" | "LALR1">(
    "LR0",
  );
  const [stepsType, setStepsType] = useState<"LL1" | "SLR1" | "CLR1" | "LALR1">(
    "LL1",
  );

  // Auto-select the first available parser sub-type when selectedParsers changes
  useEffect(() => {
    if (selectedParsers.length > 0) {
      const first = selectedParsers[0] as "LL1" | "SLR1" | "CLR1" | "LALR1";
      // If current selection is not in the selected list, switch to first
      if (!selectedParsers.includes(stepsType)) {
        setStepsType(first);
      }
      if (!selectedParsers.includes(treeType)) {
        setTreeType(first);
      }
      // Map parser types to automata types
      const automataMap: Record<string, "LR0" | "LR1" | "LALR1"> = {
        LL1: "LR0",
        SLR1: "LR0",
        CLR1: "LR1",
        LALR1: "LALR1",
      };
      if (
        !selectedParsers.includes(
          automataType === "LR0"
            ? "SLR1"
            : automataType === "LR1"
              ? "CLR1"
              : "LALR1",
        )
      ) {
        setAutomataType(automataMap[first] || "LR0");
      }
    }
  }, [selectedParsers]);

  const searchParams = useSearchParams();
  const problemId = searchParams.get("problemId");
  const sharedGrammar = searchParams.get("g");
  const sharedTest = searchParams.get("t");

  useEffect(() => {
    // Load from shared URL params (base64 encoded)
    if (sharedGrammar) {
      try {
        const grammar = atob(sharedGrammar);
        const test = sharedTest ? atob(sharedTest) : "";
        setRawInput(grammar);
        setTestInput(test);
        setTimeout(() => parse(), 50);
        return;
      } catch {
        // Invalid base64, ignore
      }
    }
    // Load from problem ID
    if (problemId) {
      const dbProblem = problems.find((p) => p.id === problemId);
      if (dbProblem) {
        setRawInput(dbProblem.grammar);
        setTestInput(dbProblem.testInput);
        setTimeout(() => parse(), 50);
      }
    }
  }, [problemId, sharedGrammar, sharedTest, setRawInput, setTestInput, parse]);

  const [isComputing, setIsComputing] = useState(false);

  const handleSolve = useCallback(() => {
    if (!rawInput.trim() || isComputing) return;
    setIsComputing(true);
    setTimeout(() => {
      try {
        parse();
      } finally {
        setIsComputing(false);
      }
    }, 50);
  }, [rawInput, isComputing, parse]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to solve
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

  const handleShare = useCallback(() => {
    if (!rawInput.trim()) return;
    try {
      const g = btoa(rawInput);
      const t = testInput.trim() ? btoa(testInput) : "";
      const params = new URLSearchParams();
      params.set("g", g);
      if (t) params.set("t", t);
      const url = `${window.location.origin}/solve?${params.toString()}`;

      // Use clipboard API with fallback for non-secure contexts
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            toast.success("Link Copied!", {
              description:
                "Shareable grammar URL has been copied to your clipboard.",
            });
          })
          .catch(() => {
            copyFallback(url);
          });
      } else {
        copyFallback(url);
      }
    } catch {
      toast.error("Failed to generate share link.");
    }
  }, [rawInput, testInput]);

  const copyFallback = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Link Copied!", {
        description: "Shareable grammar URL has been copied to your clipboard.",
      });
    } catch {
      // If even fallback fails, show the URL so user can copy manually
      toast.info("Share Link", {
        description: text,
        duration: 10000,
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Grammar Solver
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Parse context-free grammars with LL(1), SLR(1), CLR(1) & LALR(1)
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={!rawInput.trim()}
            className="shadow-sm font-medium"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button
            onClick={handleSolve}
            disabled={!rawInput.trim() || isComputing}
            size="lg"
            className="shadow-sm font-semibold tracking-wide min-w-[120px]"
          >
            {isComputing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Solve
              </>
            )}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-background"
      >
        {/* Left Panel: Input */}
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          className="flex flex-col p-4 gap-4"
        >
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="grammar-input"
                  className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Grammar Rules
                </Label>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs shadow-md border-muted">
                    <p className="text-xs leading-relaxed">
                      Enter the production rules for your Context-Free Grammar.
                      The first rule defines the Start Symbol.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] font-semibold tracking-wide uppercase"
                    >
                      <Wand2 className="mr-1.5 h-3 w-3" /> Transform
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          setRawInput(eliminateLeftRecursion(rawInput));
                        } catch (e) {
                          toast.error(
                            e instanceof Error
                              ? e.message
                              : "Failed to eliminate left recursion.",
                          );
                        }
                      }}
                      disabled={!rawInput.trim()}
                    >
                      Eliminate Left Recursion
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          setRawInput(leftFactor(rawInput));
                        } catch (e) {
                          toast.error(
                            e instanceof Error
                              ? e.message
                              : "Failed to left factor grammar.",
                          );
                        }
                      }}
                      disabled={!rawInput.trim()}
                    >
                      Left Factor Grammar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Select
                  onValueChange={(id) => {
                    const dbProblem = problems.find((p) => p.id === id);
                    if (dbProblem) {
                      setRawInput(dbProblem.grammar);
                      setTestInput(dbProblem.testInput);
                    }
                  }}
                >
                  <SelectTrigger className="w-[160px] h-7 text-xs">
                    <SelectValue placeholder="Load Example" />
                  </SelectTrigger>
                  <SelectContent>
                    {problems
                      .filter((p) => p.recommendedSolver === "Syntax")
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
              id="grammar-input"
              placeholder={"E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id"}
              className="flex-1 font-mono text-[13px] leading-relaxed resize-none tracking-tight p-3 bg-muted/10 border-muted focus-visible:ring-primary/20"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              spellCheck={false}
            />
            <p className="text-[11px] text-muted-foreground leading-snug">
              Use &apos;-&gt;&apos; or &apos;:&apos; for assignment.
              &apos;|&apos; for alternatives. &apos;ε&apos; for empty.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="test-input"
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
              >
                Test String
              </Label>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs shadow-md border-muted">
                  <p className="text-xs">
                    Input a sequence of terminals separated by spaces to test
                    against the generated parsing tables.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="test-input"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="id + id * id"
              className="font-mono text-[13px] p-3 h-10 bg-muted/10 border-muted focus-visible:ring-primary/20"
              suppressHydrationWarning
            />
          </div>

          <div className="flex flex-col gap-2 bg-background/50 p-3 border rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Parsers to Generate
              </Label>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs shadow-md border-muted">
                  <p className="text-xs leading-relaxed">
                    Select which algorithms to compile.{" "}
                    <code className="text-primary font-bold">LALR(1)</code>{" "}
                    handles the most complex grammars but takes the most compute
                    time.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["LL1", "SLR1", "CLR1", "LALR1"] as ParserType[]).map(
                (type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-3 bg-muted/20 hover:bg-muted/40 transition-colors p-2 rounded-lg border border-transparent hover:border-border"
                  >
                    <Checkbox
                      id={`parser-${type}`}
                      checked={selectedParsers.includes(type)}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        if (checked) {
                          setSelectedParsers([...selectedParsers, type]);
                        } else {
                          setSelectedParsers(
                            selectedParsers.filter((p) => p !== type),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`parser-${type}`}
                      className="font-semibold cursor-pointer select-none text-[13px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </Label>
                  </div>
                ),
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select which parsing tables to build. LALR(1) for complex
              grammars.
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-destructive shadow-sm mt-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Error Processing</AlertTitle>
              <AlertDescription className="text-xs font-mono break-all mt-1 opacity-90">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-border/50 transition-colors hover:bg-primary/20 active:bg-primary"
        />

        {/* Right Panel: Output */}
        <ResizablePanel
          defaultSize={70}
          className="bg-muted/30 p-6 flex flex-col min-h-0"
        >
          {parsedGrammar ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col min-h-0"
            >
              <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/50 border shadow-sm rounded-lg mb-4">
                <TabsTrigger
                  value="sets"
                  className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  FIRST & FOLLOW
                </TabsTrigger>
                <TabsTrigger
                  value="automata"
                  className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Automata (LR)
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Parsing Table
                </TabsTrigger>
                <TabsTrigger
                  value="steps"
                  className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Parsing Steps
                </TabsTrigger>
                <TabsTrigger
                  value="tree"
                  className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Parse Tree
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-4 overflow-auto min-h-0 bg-background rounded-xl border p-4 shadow-sm relative">
                <TabsContent value="steps" className="h-full m-0 relative">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-start p-2 border-b gap-2 items-center">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm font-medium">Steps Type:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Step-by-step breakdown of the parsing process
                              (Stack, Input, Action).
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex gap-1 bg-muted/20 p-0.5 rounded-md">
                        {(["LL1", "SLR1", "CLR1", "LALR1"] as const)
                          .filter((type) => selectedParsers.includes(type))
                          .map((type) => {
                            let disabled = true;
                            if (type === "LL1")
                              disabled =
                                !ll1Table || ll1Table.conflicts.length > 0;
                            else if (type === "SLR1") disabled = !slrTable;
                            else if (type === "CLR1") disabled = !clrTable;
                            else if (type === "LALR1") disabled = !lalrTable;

                            return (
                              <Button
                                key={type}
                                variant={
                                  stepsType === type ? "secondary" : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                  setStepsType(
                                    type as "LL1" | "SLR1" | "CLR1" | "LALR1",
                                  )
                                }
                                disabled={disabled}
                                className="h-7 text-xs"
                              >
                                {type.replace("1", "(1)")}
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto mt-4">
                      {(["LL1", "SLR1", "CLR1", "LALR1"] as const)
                        .filter((type) => selectedParsers.includes(type))
                        .map((type) => {
                          let steps: ParsingStep[] = [];
                          if (type === "LL1") steps = ll1Steps;
                          else if (type === "SLR1") steps = slrSteps;
                          else if (type === "CLR1") steps = clrSteps;
                          else if (type === "LALR1") steps = lalrSteps;

                          if (stepsType !== type || steps.length === 0)
                            return null;

                          return (
                            <div
                              key={type}
                              className="border rounded-md overflow-hidden"
                            >
                              <table className="w-full text-sm text-left">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold border-b w-1/3">
                                      Stack
                                    </th>
                                    <th className="px-4 py-3 font-semibold border-b border-l w-1/3 text-right">
                                      Input
                                    </th>
                                    <th className="px-4 py-3 font-semibold border-b border-l w-1/3">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {steps.map((step, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border-b last:border-0 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                                    >
                                      <td className="px-4 py-3 font-mono border-r whitespace-pre-wrap">
                                        {step.stack.join(" ")}
                                      </td>
                                      <td className="px-4 py-3 font-mono border-r whitespace-pre-wrap text-right">
                                        {step.input.join(" ")}
                                      </td>
                                      <td className="px-4 py-3 border-r whitespace-pre-wrap">
                                        {step.action}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      {(() => {
                        let currentSteps: ParsingStep[] = [];
                        if (stepsType === "LL1") currentSteps = ll1Steps;
                        else if (stepsType === "SLR1") currentSteps = slrSteps;
                        else if (stepsType === "CLR1") currentSteps = clrSteps;
                        else if (stepsType === "LALR1")
                          currentSteps = lalrSteps;

                        if (currentSteps.length === 0) {
                          return (
                            <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground w-full">
                              No parsing steps available. Try selecting a
                              different algorithm or checking for conflicts.
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="table" className="h-full m-0">
                  {selectedParsers.includes("LL1") &&
                    (ll1Table ? (
                      <div className="grid gap-4 mt-2">
                        {ll1Table.conflicts.length > 0 && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Conflicts Found</AlertTitle>
                            <AlertDescription>
                              {ll1Table.conflicts.map(
                                (c: string, i: number) => (
                                  <div key={i}>{c}</div>
                                ),
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                        <ParsingTableVisualizer
                          title="LL(1) Parsing Table"
                          type="LL1"
                          data={ll1Table.table}
                          grammar={parsedGrammar}
                        />
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        LL(1) Table could not be generated (Grammar might be
                        Left-Recursive or Ambiguous).
                      </div>
                    ))}

                  {selectedParsers.includes("SLR1") && slrTable && (
                    <div className="grid gap-4 mt-6">
                      {slrTable.conflicts.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Conflicts Found</AlertTitle>
                          <AlertDescription>
                            {slrTable.conflicts.map((c, i) => (
                              <div key={i}>{c}</div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                      <ParsingTableVisualizer
                        title="SLR(1) Parsing Table"
                        type="SLR1"
                        data={slrTable.table}
                        grammar={parsedGrammar}
                      />
                    </div>
                  )}

                  {selectedParsers.includes("CLR1") && clrTable && (
                    <div className="grid gap-4 mt-6">
                      {clrTable.conflicts.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Conflicts Found</AlertTitle>
                          <AlertDescription>
                            {clrTable.conflicts.map((c, i) => (
                              <div key={i}>{c}</div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                      <ParsingTableVisualizer
                        title="CLR(1) Parsing Table"
                        type="SLR1" // SLR1 renderer works for CLR since the structure Action/Goto is identical
                        data={clrTable.table}
                        grammar={parsedGrammar}
                      />
                    </div>
                  )}

                  {selectedParsers.includes("LALR1") && lalrTable && (
                    <div className="grid gap-4 mt-6">
                      {lalrTable.conflicts.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Conflicts Found</AlertTitle>
                          <AlertDescription>
                            {lalrTable.conflicts.map((c, i) => (
                              <div key={i}>{c}</div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                      <ParsingTableVisualizer
                        title="LALR(1) Parsing Table"
                        type="SLR1"
                        data={lalrTable.table}
                        grammar={parsedGrammar}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tree" className="h-full m-0 relative">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-start p-2 border-b gap-2 items-center">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm font-medium">Tree Type:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Visual representation of how the parser derived
                              the Test String using the Grammar Rules.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex gap-1 bg-muted/20 p-0.5 rounded-md">
                        {(["LL1", "SLR1", "CLR1", "LALR1"] as const)
                          .filter((type) => selectedParsers.includes(type))
                          .map((type) => {
                            let disabled = true;
                            if (type === "LL1")
                              disabled =
                                !ll1Table || ll1Table.conflicts.length > 0;
                            else if (type === "SLR1") disabled = !slrTable;
                            else if (type === "CLR1") disabled = !clrTable;
                            else if (type === "LALR1") disabled = !lalrTable;

                            return (
                              <Button
                                key={type}
                                variant={
                                  treeType === type ? "secondary" : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                  setTreeType(
                                    type as "LL1" | "SLR1" | "CLR1" | "LALR1",
                                  )
                                }
                                disabled={disabled}
                                className="h-7 text-xs"
                              >
                                {type.replace("1", "(1)")}
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <ParseTreeVisualizer type={treeType} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="automata" className="h-full m-0 relative">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-start p-2 border-b gap-2 items-center">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm font-medium">Automata:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              The Deterministic Finite Automaton (DFA) state
                              machine used by Bottom-Up LR parsers to track
                              viable prefixes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex gap-1 bg-muted/20 p-0.5 rounded-md">
                        {selectedParsers.includes("SLR1") && (
                          <Button
                            variant={
                              automataType === "LR0" ? "secondary" : "ghost"
                            }
                            size="sm"
                            onClick={() => setAutomataType("LR0")}
                            disabled={!canonicalCollection}
                            className="h-7 text-xs"
                          >
                            LR(0) Core (For SLR)
                          </Button>
                        )}
                        {selectedParsers.includes("CLR1") && (
                          <Button
                            variant={
                              automataType === "LR1" ? "secondary" : "ghost"
                            }
                            size="sm"
                            onClick={() => setAutomataType("LR1")}
                            disabled={!clrTable?.collection}
                            className="h-7 text-xs"
                          >
                            LR(1) Automata (For CLR)
                          </Button>
                        )}
                        {selectedParsers.includes("LALR1") && (
                          <Button
                            variant={
                              automataType === "LALR1" ? "secondary" : "ghost"
                            }
                            size="sm"
                            onClick={() => setAutomataType("LALR1")}
                            disabled={!lalrTable?.collection}
                            className="h-7 text-xs"
                          >
                            LALR(1) Merged
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      {automataType === "LR0" && canonicalCollection ? (
                        <AutomataGraph
                          collection={canonicalCollection}
                          nonTerminals={parsedGrammar?.nonTerminals}
                        />
                      ) : automataType === "LR1" && clrTable?.collection ? (
                        <AutomataGraph
                          collection={clrTable.collection}
                          nonTerminals={parsedGrammar?.nonTerminals}
                        />
                      ) : automataType === "LALR1" && lalrTable?.collection ? (
                        <AutomataGraph
                          collection={lalrTable.collection}
                          nonTerminals={parsedGrammar?.nonTerminals}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Please run the engine and select a valid Automata
                          type.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sets" className="h-full m-0 p-4">
                  {!firstSets || !followSets ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No sets computed. Please enter a grammar and solve.
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>FIRST & FOLLOW Sets</h3>
                      <div className="grid gap-4 mt-4">
                        <table className="min-w-full text-sm text-left border rounded-md overflow-hidden">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 font-semibold border-b">
                                Non-Terminal
                              </th>
                              <th className="px-4 py-3 font-semibold border-b border-l">
                                FIRST Set
                              </th>
                              <th className="px-4 py-3 font-semibold border-b border-l">
                                FOLLOW Set
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedGrammar &&
                              Array.from(parsedGrammar.nonTerminals).map(
                                (nt, idx) => {
                                  const first = Array.from(
                                    firstSets.get(nt) || [],
                                  );
                                  const follow = Array.from(
                                    followSets.get(nt) || [],
                                  );
                                  return (
                                    <tr
                                      key={nt}
                                      className={`border-b last:border-0 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                                    >
                                      <td className="px-4 py-3 font-mono border-r font-medium">
                                        {nt}
                                      </td>
                                      <td className="px-4 py-3 font-mono border-r text-blue-600 dark:text-blue-400">
                                        {`{ ${first.join(", ")} }`}
                                      </td>
                                      <td className="px-4 py-3 font-mono text-green-600 dark:text-green-400">
                                        {`{ ${follow.join(", ")} }`}
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Play className="h-12 w-12 mb-4 opacity-20" />
              <p>Enter a grammar and click Solve to see results.</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function SolverPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground w-full h-full flex items-center justify-center">
          Loading Solver Engine...
        </div>
      }
    >
      <SolverContent />
    </Suspense>
  );
}
