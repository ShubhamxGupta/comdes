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
import { AlertCircle, Play, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { ParserType } from "@/engine/types";

// Visualizers
import { ParseTreeVisualizer } from "@/components/visualizer/ParseTree";
import { ParsingTableVisualizer } from "@/components/visualizer/ParsingTable";
import { AutomataGraph } from "@/components/visualizer/AutomataGraph";
import { useSavedGrammars } from "@/hooks/useSavedGrammars";

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
  } = useGrammarStore();

  const [activeTab, setActiveTab] = useState("tree");
  const [treeType, setTreeType] = useState<"LL1" | "LR">("LL1");
  const [automataType, setAutomataType] = useState<"LR0" | "LALR1">("LR0");

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
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="grammar-input">Grammar Rules</Label>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="table">Parsing Table</TabsTrigger>
                <TabsTrigger value="tree">Parse Tree</TabsTrigger>
                <TabsTrigger value="automata">Automata (LR)</TabsTrigger>
                <TabsTrigger value="sets">FIRST & FOLLOW</TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-4 overflow-auto bg-background rounded-md border p-4">
                <TabsContent value="table" className="h-full m-0">
                  {selectedParsers.includes("LL1") &&
                    (ll1Table ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>LL(1) Parsing Table</h3>
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

                  {slrTable && (
                    <div className="prose dark:prose-invert max-w-none mt-8">
                      <h3>SLR(1) Parsing Table</h3>
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
                        type="SLR1"
                        data={slrTable.table}
                        grammar={parsedGrammar}
                      />
                    </div>
                  )}

                  {clrTable && (
                    <div className="prose dark:prose-invert max-w-none mt-8">
                      <h3>CLR(1) Parsing Table</h3>
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
                        type="SLR1" // SLR1 renderer works for CLR since the structure Action/Goto is identical
                        data={clrTable.table}
                        grammar={parsedGrammar}
                      />
                    </div>
                  )}

                  {lalrTable && (
                    <div className="prose dark:prose-invert max-w-none mt-8">
                      <h3>LALR(1) Parsing Table</h3>
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
                        <Button
                          variant={treeType === "LL1" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setTreeType("LL1")}
                          disabled={!ll1Table || ll1Table.conflicts.length > 0}
                          className="h-7 text-xs"
                        >
                          LL(1)
                        </Button>
                        <Button
                          variant={treeType === "LR" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setTreeType("LR")}
                          disabled={!slrTable}
                          className="h-7 text-xs"
                        >
                          LR(1)
                        </Button>
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
                        <Button
                          variant={
                            automataType === "LR0" ? "secondary" : "ghost"
                          }
                          size="sm"
                          onClick={() => setAutomataType("LR0")}
                          disabled={!canonicalCollection}
                          className="h-7 text-xs"
                        >
                          LR(0) Core
                        </Button>
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
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      {automataType === "LR0" && canonicalCollection ? (
                        <AutomataGraph collection={canonicalCollection} />
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
