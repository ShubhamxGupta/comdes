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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Loader2, ArrowLeft, Cpu } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { generateTargetCode, CodegenResult } from "@/engine/codegen";

const EXAMPLES = [
  {
    label: "Arithmetic Expression",
    code: `t1 = a + b\nt2 = c + d\nt3 = t1 * t2\nx = t3`,
  },
  {
    label: "Copy + Operations",
    code: `t1 = a + b\nt2 = a - b\nx = t1 * t2`,
  },
  {
    label: "Chained Operations",
    code: `t1 = a * b\nt2 = t1 + c\nt3 = t2 - d\nresult = t3`,
  },
  {
    label: "Register Pressure",
    code: `t1 = a + b\nt2 = c + d\nt3 = e + f\nt4 = t1 * t2\nt5 = t3 * t4\nresult = t5`,
  },
];

export default function CodegenPage() {
  const [input, setInput] = useState(EXAMPLES[0].code);
  const [numRegs, setNumRegs] = useState(3);
  const [result, setResult] = useState<CodegenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = generateTargetCode(input, numRegs);
      setResult(res);
      toast.success(
        `Generated ${res.assembly.length} assembly instructions using ${numRegs} registers`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed: " + msg);
    } finally {
      setLoading(false);
    }
  }, [input, numRegs]);

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-muted/5">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Target Code Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Perform Liveness Analysis, Allocate Registers, Emit Assembly
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          size="lg"
          className="shadow-sm font-semibold tracking-wide min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Generate Target Code
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
                className="font-mono text-sm min-h-[180px] resize-none"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Number of Registers
              </Label>
              <Input
                type="number"
                min={2}
                max={16}
                value={numRegs}
                onChange={(e) =>
                  setNumRegs(
                    Math.max(2, Math.min(16, parseInt(e.target.value) || 2)),
                  )
                }
                className="w-24 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Fewer registers → more spills to memory
              </p>
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
              defaultValue="assembly"
              className="flex flex-col flex-1 min-h-0"
            >
              <TabsList className="rounded-none border-b bg-background justify-start px-2 h-12 w-full overflow-x-auto">
                <TabsTrigger value="assembly" className="text-sm">
                  Assembly
                </TabsTrigger>
                <TabsTrigger value="liveness" className="text-sm">
                  Liveness & Next-Use
                </TabsTrigger>
                <TabsTrigger value="registers" className="text-sm">
                  Register State
                </TabsTrigger>
              </TabsList>

              {/* Assembly Tab */}
              <TabsContent
                value="assembly"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-red-500" />
                  Generated Assembly ({result.numRegisters} registers)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left font-semibold border-b w-8">
                          #
                        </th>
                        <th className="px-4 py-2 text-left font-semibold border-b">
                          Instruction
                        </th>
                        <th className="px-4 py-2 text-left font-semibold border-b text-muted-foreground">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.assembly.map((asm, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/20 hover:bg-muted/20"
                        >
                          <td className="px-4 py-1.5 text-muted-foreground text-xs">
                            {i + 1}
                          </td>
                          <td className="px-4 py-1.5 font-mono text-primary font-medium">
                            {asm.label}
                          </td>
                          <td className="px-4 py-1.5 text-muted-foreground text-xs italic">
                            {asm.comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Liveness Tab */}
              <TabsContent
                value="liveness"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">
                  Liveness & Next-Use Information
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Computed via backward scan. Shows the liveness status and
                  next-use instruction index for each variable at each TAC
                  instruction.
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left font-semibold border-b">
                          Instr #
                        </th>
                        <th className="px-4 py-2 text-left font-semibold border-b">
                          Variable
                        </th>
                        <th className="px-4 py-2 text-center font-semibold border-b">
                          Live?
                        </th>
                        <th className="px-4 py-2 text-center font-semibold border-b">
                          Next-Use
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.livenessTable.map((entry, i) => (
                        <tr
                          key={i}
                          className={`border-b border-border/20 hover:bg-muted/20 ${!entry.isLive ? "opacity-50" : ""}`}
                        >
                          <td className="px-4 py-1.5 font-mono">
                            {entry.instrIndex}
                          </td>
                          <td className="px-4 py-1.5 font-mono font-bold">
                            {entry.variable}
                          </td>
                          <td className="px-4 py-1.5 text-center">
                            {entry.isLive ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                Live
                              </span>
                            ) : (
                              <span className="text-red-500">Dead</span>
                            )}
                          </td>
                          <td className="px-4 py-1.5 text-center font-mono">
                            {entry.nextUse !== null ? entry.nextUse : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Register State Tab */}
              <TabsContent
                value="registers"
                className="flex-1 overflow-auto min-h-0 p-4 m-0"
              >
                <h3 className="font-bold text-lg mb-4">
                  Final Register Descriptors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.registerDescriptors.map((rd) => (
                    <div
                      key={rd.register}
                      className={`border rounded-xl p-4 ${
                        rd.contents.length > 0
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-muted/10"
                      }`}
                    >
                      <div className="font-mono font-bold text-lg text-primary mb-2">
                        {rd.register}
                      </div>
                      {rd.contents.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {rd.contents.map((v) => (
                            <span
                              key={v}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-mono"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Empty
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <div className="text-6xl">⊕</div>
                <p className="text-lg font-medium">Enter Three-Address Code</p>
                <p className="text-sm">
                  Click &quot;Generate Target Code&quot; to compute liveness,
                  allocate registers, and emit assembly
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
