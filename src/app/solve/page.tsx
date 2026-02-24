"use client";

import { useState, useEffect, Suspense } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, Play, Save, Wand2 } from "lucide-react";
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
import { useSavedGrammars } from "@/hooks/useSavedGrammars";
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

  const searchParams = useSearchParams();
  const problemId = searchParams.get("problemId");

  useEffect(() => {
    if (problemId) {
      const dbProblem = problems.find((p) => p.id === problemId);
      if (dbProblem) {
        setRawInput(dbProblem.grammar);
        setTestInput(dbProblem.testInput);
        // Delay parsing slightly to allow store bindings to update
        setTimeout(() => {
          parse();
        }, 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const { saveGrammar } = useSavedGrammars();

  const handleSave = () => {
    if (!rawInput.trim()) return;
    const name = window.prompt("Enter a name for this grammar:");
    if (name) {
      saveGrammar(name, rawInput, testInput);
      window.alert("Grammar saved successfully!");
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Grammar Solver</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!rawInput.trim()}
          >
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button onClick={parse} disabled={!rawInput.trim()}>
            <Play className="mr-2 h-4 w-4" /> Solve
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-lg overflow-hidden"
      >
        {/* Left Panel: Input */}
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className="bg-background flex flex-col p-4 gap-4"
        >
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="grammar-input"
                  className="text-sm font-semibold"
                >
                  Grammar Rules
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Enter the production rules for your Context-Free Grammar.
                      The first rule defines the Start Symbol.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Wand2 className="mr-2 h-3 w-3" /> Transform
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          setRawInput(eliminateLeftRecursion(rawInput));
                        } catch (e) {
                          alert(
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
                          alert(
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
                  <SelectTrigger className="w-[140px] h-7 text-xs">
                    <SelectValue placeholder="Load Example" />
                  </SelectTrigger>
                  <SelectContent>
                    {problems.map((p) => (
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
              placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
              className="flex-1 font-mono text-sm resize-none"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Enter production rules. Use &apos;-&gt;&apos; or &apos;:&apos; for
              assignment. &apos;|&apos; for alternatives. &apos;epsilon&apos; or
              &apos;ε&apos; for empty.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="test-string">
                Test String (for visualization)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    A sequence of terminal tokens separated by spaces to trace
                    through the generated Parse Tree.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="test-string"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="id + id * id"
              className="font-mono text-sm"
              suppressHydrationWarning
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Label>Parsers to Generate</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Select which algorithms to compile. LALR(1) handles the most
                    complex grammars but takes the most compute time.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col gap-2">
              {(["LL1", "SLR1", "CLR1", "LALR1"] as ParserType[]).map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
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
                      className="font-normal cursor-pointer select-none"
                    >
                      {type}
                    </Label>
                  </div>
                ),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select which parsing tables to build. LALR(1) is recommended for
              complex grammars.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Output */}
        <ResizablePanel defaultSize={70} className="bg-muted/10 p-4">
          {parsedGrammar ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="sets">FIRST & FOLLOW</TabsTrigger>
                <TabsTrigger value="automata">Automata (LR)</TabsTrigger>
                <TabsTrigger value="table">Parsing Table</TabsTrigger>
                <TabsTrigger value="steps">Parsing Steps</TabsTrigger>
                <TabsTrigger value="tree">Parse Tree</TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-4 overflow-auto bg-background rounded-md border p-4">
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
                        <AutomataGraph collection={canonicalCollection} />
                      ) : automataType === "LR1" && clrTable?.collection ? (
                        <AutomataGraph collection={clrTable.collection} />
                      ) : automataType === "LALR1" && lalrTable?.collection ? (
                        <AutomataGraph collection={lalrTable.collection} />
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
