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
import { AlertCircle, Play, Loader2, Copy, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { parseSDTGrammar } from "@/engine/semantic";
import { computeFirstSets, computeFollowSets } from "@/engine/sets";
import { buildSLRTable } from "@/engine/parsing/lr";
import { simulateLR } from "@/engine/simulator";
import {
  generateTAC,
  formatTAC,
  TACInstruction,
  Quadruple,
  Triple,
  IndirectTriple,
} from "@/engine/icg";
import { problems } from "@/data/problems";

const DEFAULT_GRAMMAR = `E -> E + T { $$ = $1 + $3 }
E -> T { $$ = $1 }
T -> T * F { $$ = $1 * $3 }
T -> F { $$ = $1 }
F -> ( E ) { $$ = $2 }
F -> id { $$ = $1 }`;

const DEFAULT_INPUT = "id:a + id:b * id:c";

export default function ICGPage() {
  const [grammarInput, setGrammarInput] = useState(DEFAULT_GRAMMAR);
  const [testString, setTestString] = useState(DEFAULT_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [instructions, setInstructions] = useState<TACInstruction[]>([]);
  const [quadruples, setQuadruples] = useState<Quadruple[]>([]);
  const [triples, setTriples] = useState<Triple[]>([]);
  const [indirectTriples, setIndirectTriples] = useState<IndirectTriple[]>([]);
  const [tempCount, setTempCount] = useState(0);
  const [tacText, setTacText] = useState("");

  const handleGenerate = useCallback(() => {
    if (!grammarInput.trim() || !testString.trim() || isComputing) return;
    setIsComputing(true);
    setTimeout(() => {
      try {
        setError(null);
        const grammar = parseSDTGrammar(grammarInput);
        const first = computeFirstSets(grammar);
        const follow = computeFollowSets(grammar, first);
        const slrResult = buildSLRTable(grammar, follow);

        if (slrResult.conflicts.length > 0) {
          throw new Error(
            "Grammar has SLR(1) conflicts: " + slrResult.conflicts.join(", "),
          );
        }

        const originalTokens = testString
          .trim()
          .split(/\s+/)
          .filter((t) => t.length > 0);
        const tokens = originalTokens.map((t) =>
          t.includes(":") ? t.split(":")[0] : t,
        );
        const parsingSteps = simulateLR(tokens, slrResult.table);
        const result = generateTAC(grammar, parsingSteps, originalTokens);

        setInstructions(result.instructions);
        setQuadruples(result.quadruples);
        setTriples(result.triples);
        setIndirectTriples(result.indirectTriples);
        setTempCount(result.tempCount);
        setTacText(formatTAC(result.instructions));

        toast.success("Code Generated", {
          description: `Generated ${result.instructions.length} instructions using ${result.tempCount} temporaries.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(message);
        setInstructions([]);
        setQuadruples([]);
        setTriples([]);
        setIndirectTriples([]);
        setTempCount(0);
        setTacText("");
        toast.error("Code Generation Failed", { description: message });
      } finally {
        setIsComputing(false);
      }
    }, 50);
  }, [grammarInput, testString, isComputing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGenerate]);

  const handleCopyTAC = useCallback(() => {
    if (!tacText) return;
    navigator.clipboard.writeText(tacText).then(() => {
      setCopied(true);
      toast.success("TAC copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tacText]);

  const semanticAndICGProblems = problems.filter(
    (p) => p.recommendedSolver === "Semantic" || p.recommendedSolver === "ICG",
  );

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Intermediate Code Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Generate Three-Address Code (TAC) from Syntax-Directed Definitions
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!grammarInput.trim() || !testString.trim() || isComputing}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {isComputing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Generate Code
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
                  htmlFor="icg-grammar"
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
                      Enter production rules with semantic actions in{" "}
                      <code>{"{ }"}</code> braces. Arithmetic operators in
                      actions will produce TAC instructions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(id) => {
                    const problem = semanticAndICGProblems.find(
                      (p) => p.id === id,
                    );
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
                    {semanticAndICGProblems.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              id="icg-grammar"
              className="flex-1 font-mono text-[13px] leading-relaxed resize-none tracking-tight p-4 bg-muted/10 border-muted focus-visible:ring-primary/20"
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Label
                htmlFor="icg-input"
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
              >
                Expression / Input
              </Label>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs shadow-md border-muted">
                  <p className="text-xs">
                    Tokens separated by spaces. Use{" "}
                    <code className="text-primary font-bold">id:name</code> to
                    give variables meaningful names in the output.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="icg-input"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="id:a + id:b * id:c"
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
              <AlertTitle className="font-bold">Generation Error</AlertTitle>
              <AlertDescription className="text-xs font-mono break-all mt-1 opacity-90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats card */}
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/5 p-6 border rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[100px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-40 mix-blend-multiply" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary/70 mb-2 z-10">
              Generation Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 z-10">
              <div>
                <div className="text-2xl font-extrabold text-foreground tracking-tight">
                  {instructions.length || "--"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  Instructions
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-foreground tracking-tight">
                  {tempCount || "--"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  Temporaries
                </div>
              </div>
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
          className="bg-muted/30 p-6 flex flex-col min-h-0"
        >
          <Tabs defaultValue="tac" className="h-full flex flex-col min-h-0">
            <TabsList className="grid w-full max-w-[600px] grid-cols-4 p-1 bg-muted/50 border shadow-sm rounded-lg">
              <TabsTrigger
                value="tac"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                TAC
              </TabsTrigger>
              <TabsTrigger
                value="quadruples"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Quadruples
              </TabsTrigger>
              <TabsTrigger
                value="triples"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Triples
              </TabsTrigger>
              <TabsTrigger
                value="indirect"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Indirect Triples
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 overflow-auto min-h-0 bg-background rounded-xl border shadow-sm p-1">
              {/* TAC Output */}
              <TabsContent
                value="tac"
                className="h-full w-full m-0 relative rounded-lg overflow-hidden p-4"
              >
                {instructions.length > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Three-Address Code
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyTAC}
                        className="h-7 text-xs gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 bg-zinc-950 dark:bg-zinc-900 rounded-xl p-6 overflow-auto font-mono text-sm border border-zinc-800">
                      {instructions.map((inst, idx) => (
                        <div
                          key={idx}
                          className="flex items-baseline gap-4 py-1.5 group hover:bg-white/5 px-3 rounded-md transition-colors"
                        >
                          <span className="text-zinc-600 text-xs w-6 text-right shrink-0 select-none">
                            {idx + 1}
                          </span>
                          <span className="text-sky-400 font-semibold">
                            {inst.result}
                          </span>
                          <span className="text-zinc-500">=</span>
                          <span className="text-emerald-400">
                            {inst.arg1 || ""}
                          </span>
                          {inst.op !== "=" && (
                            <>
                              <span className="text-amber-400 font-bold">
                                {inst.op}
                              </span>
                              <span className="text-emerald-400">
                                {inst.arg2 || ""}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary/50" />
                    </div>
                    <p className="text-sm font-medium">No code generated yet</p>
                    <p className="text-xs text-muted-foreground/60">
                      Enter a grammar with semantic actions and click Generate
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Quadruples Table */}
              <TabsContent value="quadruples" className="h-full m-0 p-4">
                {quadruples.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left font-mono">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-r w-[10%] text-center">
                            #
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[20%]">
                            Op
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[25%]">
                            Arg 1
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[25%]">
                            Arg 2
                          </th>
                          <th className="px-5 py-4 font-bold border-b w-[20%] text-primary">
                            Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {quadruples.map((q) => (
                          <tr
                            key={q.index}
                            className={`transition-colors hover:bg-muted/5 ${q.index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-5 py-3 border-r text-center text-muted-foreground font-semibold">
                              {q.index}
                            </td>
                            <td className="px-5 py-3 border-r font-bold text-amber-600 dark:text-amber-400">
                              {q.op}
                            </td>
                            <td className="px-5 py-3 border-r text-emerald-700 dark:text-emerald-400">
                              {q.arg1 || "—"}
                            </td>
                            <td className="px-5 py-3 border-r text-emerald-700 dark:text-emerald-400">
                              {q.arg2 || "—"}
                            </td>
                            <td className="px-5 py-3 font-bold text-sky-700 dark:text-sky-400 bg-primary/[0.02]">
                              {q.result}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No quadruples generated yet.
                  </div>
                )}
              </TabsContent>

              {/* Triples Table */}
              <TabsContent value="triples" className="h-full m-0 p-4">
                {triples.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left font-mono">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-r w-[15%] text-center">
                            #
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[25%]">
                            Op
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[30%]">
                            Arg 1
                          </th>
                          <th className="px-5 py-4 font-bold border-b w-[30%]">
                            Arg 2
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {triples.map((t) => (
                          <tr
                            key={t.index}
                            className={`transition-colors hover:bg-muted/5 ${t.index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-5 py-3 border-r text-center font-semibold text-primary">
                              ({t.index})
                            </td>
                            <td className="px-5 py-3 border-r font-bold text-amber-600 dark:text-amber-400">
                              {t.op}
                            </td>
                            <td className="px-5 py-3 border-r text-emerald-700 dark:text-emerald-400">
                              {t.arg1 || "—"}
                            </td>
                            <td className="px-5 py-3 text-emerald-700 dark:text-emerald-400">
                              {t.arg2 || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-5 py-3 bg-muted/20 border-t text-xs text-muted-foreground">
                      <strong>Note:</strong> No explicit result column — the
                      result of triple <code>(i)</code> is referenced by its
                      index in subsequent triples.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No triples generated yet.
                  </div>
                )}
              </TabsContent>

              {/* Indirect Triples Table */}
              <TabsContent value="indirect" className="h-full m-0 p-4">
                {indirectTriples.length > 0 ? (
                  <div className="flex gap-6">
                    {/* Pointer List */}
                    <div className="border rounded-xl overflow-hidden shadow-sm shrink-0">
                      <table className="text-[13px] text-left font-mono">
                        <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="px-5 py-4 font-bold border-b w-[60px] text-center">
                              #
                            </th>
                            <th className="px-5 py-4 font-bold border-b text-center">
                              Pointer
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {indirectTriples.map((it, idx) => (
                            <tr
                              key={idx}
                              className={`transition-colors hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                            >
                              <td className="px-5 py-3 text-center text-muted-foreground font-semibold border-r">
                                {idx}
                              </td>
                              <td className="px-5 py-3 text-center font-bold text-primary">
                                ({it.pointer})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Triple Details */}
                    <div className="border rounded-xl overflow-hidden shadow-sm flex-1">
                      <table className="w-full text-[13px] text-left font-mono">
                        <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="px-5 py-4 font-bold border-b border-r w-[15%] text-center">
                              #
                            </th>
                            <th className="px-5 py-4 font-bold border-b border-r w-[25%]">
                              Op
                            </th>
                            <th className="px-5 py-4 font-bold border-b border-r w-[30%]">
                              Arg 1
                            </th>
                            <th className="px-5 py-4 font-bold border-b w-[30%]">
                              Arg 2
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {indirectTriples.map((it) => (
                            <tr
                              key={it.triple.index}
                              className={`transition-colors hover:bg-muted/5 ${it.triple.index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                            >
                              <td className="px-5 py-3 border-r text-center font-semibold text-primary">
                                ({it.triple.index})
                              </td>
                              <td className="px-5 py-3 border-r font-bold text-amber-600 dark:text-amber-400">
                                {it.triple.op}
                              </td>
                              <td className="px-5 py-3 border-r text-emerald-700 dark:text-emerald-400">
                                {it.triple.arg1 || "—"}
                              </td>
                              <td className="px-5 py-3 text-emerald-700 dark:text-emerald-400">
                                {it.triple.arg2 || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-5 py-3 bg-muted/20 border-t text-xs text-muted-foreground">
                        <strong>Note:</strong> The pointer list (left) maps
                        execution order to triple indices. Reordering pointers
                        changes execution without modifying triples.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No indirect triples generated yet.
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
