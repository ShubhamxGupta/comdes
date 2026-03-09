"use client";

import { useState, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { convertREToDFA, ReDfaResult } from "@/engine/redfa";

const EXAMPLES = [
  { label: "(a|b)*abb", value: "(a|b)*abb" },
  { label: "a*b|c", value: "a*b|c" },
  { label: "(a|b)*a(a|b)", value: "(a|b)*a(a|b)" },
  { label: "ab*c+", value: "ab*c+" },
  { label: "(a|b)(c|d)", value: "(a|b)(c|d)" },
];

export default function ReDfaSolverPage() {
  const [regex, setRegex] = useState("(a|b)*abb");
  const [result, setResult] = useState<ReDfaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = convertREToDFA(regex.trim());
      setResult(res);
      toast.success(`DFA constructed with ${res.states.length} states`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed to convert: " + msg);
    } finally {
      setLoading(false);
    }
  }, [regex]);

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            RE → DFA Converter
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Convert Regular Expressions to Deterministic Finite Automata
          </p>
        </div>
        <Button
          onClick={handleConvert}
          disabled={loading || !regex.trim()}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Convert to DFA
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
              <Label className="text-sm font-medium">Regular Expression</Label>
              <Input
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                placeholder="e.g. (a|b)*abb"
                className="font-mono text-base"
                onKeyDown={(e) => e.key === "Enter" && handleConvert()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Load Example
              </Label>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <Button
                    key={ex.value}
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono"
                    onClick={() => setRegex(ex.value)}
                  >
                    {ex.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/20">
              <p className="font-medium text-foreground">Supported Syntax:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <code>a|b</code> — Union (OR)
                </li>
                <li>
                  <code>ab</code> — Concatenation (implicit)
                </li>
                <li>
                  <code>a*</code> — Kleene Star (0 or more)
                </li>
                <li>
                  <code>a+</code> — One or more
                </li>
                <li>
                  <code>a?</code> — Zero or one
                </li>
                <li>
                  <code>(…)</code> — Grouping
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
              defaultValue="positions"
              className="flex flex-col flex-1 min-h-0"
            >
              <TabsList className="rounded-none border-b bg-background justify-start px-2 h-12 w-full overflow-x-auto">
                <TabsTrigger value="positions" className="text-sm">
                  Positions
                </TabsTrigger>
                <TabsTrigger value="followpos" className="text-sm">
                  Followpos
                </TabsTrigger>
                <TabsTrigger value="dfa-table" className="text-sm">
                  DFA Table
                </TabsTrigger>
                <TabsTrigger value="dfa-states" className="text-sm">
                  DFA States
                </TabsTrigger>
              </TabsList>

              {/* Positions Tab */}
              <TabsContent
                value="positions"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">
                  Leaf Position Assignments
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Augmented RE:{" "}
                  <code className="bg-muted px-2 py-1 rounded font-mono text-primary">
                    ({regex})#
                  </code>
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Position
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Symbol
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.positions.map((p) => (
                        <tr
                          key={p.pos}
                          className="border-b border-border/30 hover:bg-muted/20"
                        >
                          <td className="px-4 py-2 font-mono font-bold text-primary">
                            {p.pos}
                          </td>
                          <td className="px-4 py-2 font-mono">{p.symbol}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Followpos Tab */}
              <TabsContent
                value="followpos"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">Followpos Table</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Position
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Symbol
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Followpos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.followposTable.map((entry) => (
                        <tr
                          key={entry.position}
                          className="border-b border-border/30 hover:bg-muted/20"
                        >
                          <td className="px-4 py-2 font-mono font-bold text-primary">
                            {entry.position}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {entry.symbol}
                          </td>
                          <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">
                            {`{${entry.followpos.join(", ")}}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* DFA Transition Table Tab */}
              <TabsContent
                value="dfa-table"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">DFA Transition Table</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          State
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold border-b">
                          Positions
                        </th>
                        {result.alphabet.map((a) => (
                          <th
                            key={a}
                            className="px-4 py-2.5 text-center font-semibold border-b font-mono"
                          >
                            {a}
                          </th>
                        ))}
                        <th className="px-4 py-2.5 text-center font-semibold border-b">
                          Accepting?
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.states.map((state) => (
                        <tr
                          key={state.id}
                          className={`border-b border-border/30 hover:bg-muted/20 ${state.isAccepting ? "bg-emerald-500/5" : ""}`}
                        >
                          <td className="px-4 py-2 font-mono font-bold text-primary">
                            {state.id === 0 ? "→ " : ""}q{state.id}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                            {state.label}
                          </td>
                          {result.alphabet.map((a) => {
                            const trans = result.transitions.find(
                              (t) => t.from === state.id && t.symbol === a,
                            );
                            return (
                              <td
                                key={a}
                                className="px-4 py-2 text-center font-mono"
                              >
                                {trans !== undefined ? `q${trans.to}` : "—"}
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-center">
                            {state.isAccepting ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* DFA States (text diagram) Tab */}
              <TabsContent
                value="dfa-states"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">DFA States Summary</h3>
                <div className="space-y-3">
                  {result.states.map((state) => (
                    <div
                      key={state.id}
                      className={`border rounded-xl p-4 ${
                        state.isAccepting
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-border/50"
                      } ${state.id === 0 ? "ring-2 ring-primary/30" : ""}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-lg text-primary">
                          q{state.id}
                        </span>
                        {state.id === 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Start
                          </span>
                        )}
                        {state.isAccepting && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                            Accepting
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono mb-2">
                        Positions: {state.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.transitions
                          .filter((t) => t.from === state.id)
                          .map((t, i) => (
                            <span
                              key={i}
                              className="text-xs bg-muted rounded-lg px-3 py-1.5 font-mono border"
                            >
                              <span className="text-primary font-bold">
                                {t.symbol}
                              </span>
                              {" → "}
                              <span className="font-bold">q{t.to}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <div className="text-6xl">⊕</div>
                <p className="text-lg font-medium">
                  Enter a Regular Expression
                </p>
                <p className="text-sm">
                  Click &quot;Convert to DFA&quot; to see the step-by-step
                  Direct Method construction
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
