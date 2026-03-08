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
import { Label } from "@/components/ui/label";
import { Play, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { toast } from "sonner";

import {
  tokenize,
  Token,
  SymbolEntry,
  LexerStats,
  TOKEN_COLORS,
  TOKEN_BG_COLORS,
} from "@/engine/lexer";

const DEFAULT_CODE = `int main() {
  int x = 10;
  float y = 3.14;
  // compute result
  if (x > 5) {
    y = y + x * 2;
    print("result");
  }
  return 0;
}`;

const EXAMPLE_PROGRAMS: { label: string; code: string }[] = [
  {
    label: "Simple C Program",
    code: `int main() {\n  int x = 10;\n  float y = 3.14;\n  if (x > 5) {\n    y = y + x * 2;\n  }\n  return 0;\n}`,
  },
  {
    label: "Variable Declarations",
    code: `int a = 5;\nfloat b = 2.5;\nchar c = 'x';\nstring name = "hello";\nbool flag = true;`,
  },
  {
    label: "Loop & Conditionals",
    code: `for (int i = 0; i < 10; i++) {\n  if (i % 2 == 0) {\n    print(i);\n  } else {\n    continue;\n  }\n}`,
  },
  {
    label: "Arithmetic Expression",
    code: `int result = (a + b) * (c - d) / e;\nresult += 10;\nresult--;`,
  },
];

export default function LexerPage() {
  const [codeInput, setCodeInput] = useState(DEFAULT_CODE);
  const [isComputing, setIsComputing] = useState(false);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [symbolTable, setSymbolTable] = useState<SymbolEntry[]>([]);
  const [stats, setStats] = useState<LexerStats | null>(null);

  const handleAnalyze = useCallback(() => {
    if (!codeInput.trim() || isComputing) return;
    setIsComputing(true);
    setTimeout(() => {
      try {
        const result = tokenize(codeInput);
        setTokens(result.tokens);
        setSymbolTable(result.symbolTable);
        setStats(result.stats);

        toast.success("Lexical Analysis Complete", {
          description: `Found ${result.tokens.length} tokens, ${result.symbolTable.length} symbols${result.errors.length > 0 ? `, ${result.errors.length} errors` : ""}.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        toast.error("Lexical Analysis Failed", { description: message });
      } finally {
        setIsComputing(false);
      }
    }, 50);
  }, [codeInput, isComputing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAnalyze]);

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Lexical Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Tokenize Source Code into Lexemes, Build Symbol Tables
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={!codeInput.trim() || isComputing}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {isComputing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Analyze
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
                  htmlFor="lexer-input"
                  className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Source Code
                </Label>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className="h-[14px] w-[14px] text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs shadow-md border-muted">
                    <p className="text-xs">
                      Enter any code snippet. The lexer will identify keywords,
                      identifiers, numbers, operators, delimiters, strings, and
                      comments.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {EXAMPLE_PROGRAMS.map((ex, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setCodeInput(ex.code)}
                  >
                    {ex.label}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              id="lexer-input"
              className="flex-1 font-mono text-[13px] leading-relaxed resize-none tracking-tight p-4 bg-muted/10 border-muted focus-visible:ring-primary/20"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Stats card */}
          {stats && (
            <div className="bg-gradient-to-br from-primary/10 to-blue-500/5 p-5 border rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-40 mix-blend-multiply" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-primary/70 mb-3 z-10 relative">
                Token Summary
              </h3>
              <div className="grid grid-cols-4 gap-2 z-10 relative">
                {[
                  { label: "Total", value: stats.totalTokens },
                  { label: "Keywords", value: stats.keywords },
                  { label: "Identifiers", value: stats.identifiers },
                  { label: "Numbers", value: stats.numbers },
                  { label: "Operators", value: stats.operators },
                  { label: "Delimiters", value: stats.delimiters },
                  { label: "Strings", value: stats.strings },
                  { label: "Errors", value: stats.errors },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-extrabold tracking-tight text-foreground">
                      {s.value}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          <Tabs defaultValue="tokens" className="h-full flex flex-col">
            <TabsList className="grid w-full max-w-[500px] grid-cols-3 p-1 bg-muted/50 border shadow-sm rounded-lg">
              <TabsTrigger
                value="tokens"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Token Stream
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Token Table
              </TabsTrigger>
              <TabsTrigger
                value="symbols"
                className="rounded-md font-medium text-[13px] transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Symbol Table
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 overflow-auto bg-background rounded-xl border shadow-sm p-1">
              {/* Token Stream — visual colored tokens */}
              <TabsContent
                value="tokens"
                className="h-full w-full m-0 relative rounded-lg overflow-hidden p-4"
              >
                {tokens.length > 0 ? (
                  <div className="flex flex-col gap-4 h-full">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Colored Token Stream
                    </h3>
                    <div className="flex-1 bg-zinc-950 dark:bg-zinc-900 rounded-xl p-6 overflow-auto font-mono text-sm border border-zinc-800">
                      <div className="flex flex-wrap gap-1.5 items-baseline leading-relaxed">
                        {tokens.map((token, idx) => (
                          <Tooltip key={idx} delayDuration={100}>
                            <TooltipTrigger asChild>
                              <span
                                className={`px-1.5 py-0.5 rounded cursor-default transition-all hover:ring-1 hover:ring-white/20 ${TOKEN_BG_COLORS[token.type]} ${TOKEN_COLORS[token.type]}`}
                              >
                                {token.value}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <span className="font-bold">{token.type}</span>
                              <span className="text-muted-foreground ml-2">
                                L{token.line}:C{token.column}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 text-[10px] px-1">
                      {(
                        [
                          "KEYWORD",
                          "IDENTIFIER",
                          "NUMBER",
                          "OPERATOR",
                          "DELIMITER",
                          "STRING",
                          "COMMENT",
                        ] as const
                      ).map((type) => (
                        <div key={type} className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-sm ${TOKEN_BG_COLORS[type]}`}
                          />
                          <span className="text-muted-foreground font-medium uppercase tracking-wider">
                            {type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary/50" />
                    </div>
                    <p className="text-sm font-medium">No tokens yet</p>
                    <p className="text-xs text-muted-foreground/60">
                      Enter source code and click Analyze
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Token Table */}
              <TabsContent value="table" className="h-full m-0 p-4">
                {tokens.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left font-mono">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5 font-bold border-b border-r w-[8%] text-center">
                            #
                          </th>
                          <th className="px-4 py-3.5 font-bold border-b border-r w-[20%]">
                            Type
                          </th>
                          <th className="px-4 py-3.5 font-bold border-b border-r w-[42%]">
                            Lexeme
                          </th>
                          <th className="px-4 py-3.5 font-bold border-b w-[30%] text-center">
                            Position
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {tokens.map((token, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-4 py-2.5 border-r text-center text-muted-foreground text-xs">
                              {idx}
                            </td>
                            <td className="px-4 py-2.5 border-r">
                              <span
                                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${TOKEN_BG_COLORS[token.type]} ${TOKEN_COLORS[token.type]}`}
                              >
                                {token.type}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-2.5 border-r font-semibold ${TOKEN_COLORS[token.type]}`}
                            >
                              {token.value}
                            </td>
                            <td className="px-4 py-2.5 text-center text-muted-foreground text-xs">
                              Line {token.line}, Col {token.column}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No tokens generated yet.
                  </div>
                )}
              </TabsContent>

              {/* Symbol Table */}
              <TabsContent value="symbols" className="h-full m-0 p-4">
                {symbolTable.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left font-mono">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-r w-[8%] text-center">
                            #
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[35%]">
                            Symbol
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[22%]">
                            Type
                          </th>
                          <th className="px-5 py-4 font-bold border-b border-r w-[15%] text-center">
                            Count
                          </th>
                          <th className="px-5 py-4 font-bold border-b w-[20%] text-center">
                            First Seen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {symbolTable.map((entry, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-5 py-3 border-r text-center text-muted-foreground font-semibold">
                              {idx}
                            </td>
                            <td
                              className={`px-5 py-3 border-r font-bold ${TOKEN_COLORS[entry.type]}`}
                            >
                              {entry.name}
                            </td>
                            <td className="px-5 py-3 border-r">
                              <span
                                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${TOKEN_BG_COLORS[entry.type]} ${TOKEN_COLORS[entry.type]}`}
                              >
                                {entry.type}
                              </span>
                            </td>
                            <td className="px-5 py-3 border-r text-center font-semibold text-foreground">
                              {entry.occurrences}
                            </td>
                            <td className="px-5 py-3 text-center text-muted-foreground">
                              Line {entry.firstLine}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground w-full">
                    No symbol table generated yet.
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
