import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Cpu,
  Activity,
  MemoryStick,
  Layers,
  AlertCircle,
  Cpu as Microchip,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TargetCodegenPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <Link href="/learn">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft className="w-4 h-4" /> Back to Learning Resources
          </Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
          Target Code Generation
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          The final compiler phase: translating optimized intermediate code into
          instruction-level machine code tailored to a specific hardware
          architecture.
        </p>

        {/* Issues in Design & The Target Machine */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Microchip className="h-8 w-8 text-red-500" />
            Issues in Code Generator Design
          </h2>
          <Card className="mb-6 shadow-sm border-red-500/20">
            <CardHeader className="pb-4">
              <CardTitle>Core Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Designing an efficient code generator requires balancing compile
                time vs. execution time. Key issues include:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Target Program Choice
                  </h4>
                  <p className="text-sm">
                    Should the compiler output absolute machine code (fastest,
                    immovable), relocatable machine code (supports separate
                    compilation mapping), or assembly language (requires later
                    assembly pass)?
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Instruction Selection
                  </h4>
                  <p className="text-sm">
                    Mapping intermediate (IR) variables to the target machine's
                    specific instruction set. Must consider instruction speed,
                    cost, and side effects.
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Register Allocation
                  </h4>
                  <p className="text-sm">
                    Registers are the fastest but most limited hardware memory.
                    Deciding which values stay in registers vs. main memory
                    (RAM) is crucial.
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Evaluation Order
                  </h4>
                  <p className="text-sm">
                    Changing the order in which expressions are evaluated can
                    drastically reduce the number of temporary registers needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 rounded-xl border-l-4 border-l-red-500">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              The Target Machine Profile
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A naive generic code generator models the target CPU as a generic
              architecture with a byte-addressable memory, general-purpose
              registers (<code>R0, R1... R(n-1)</code>), and standard
              instruction formats (<code>OP dest, src</code>). Real-world code
              generators (like LLVM Backends) contain thousands of lines
              modeling highly specific CPU quirks, instruction pipelines, and
              cache hierarchies.
            </p>
          </div>
        </div>

        {/* Next-Use & Register Allocation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <MemoryStick className="h-8 w-8 text-purple-500" />
            Liveness & Register Allocation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" /> Next-Use
                Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Before allocating registers within a Basic Block, the compiler
                calculates the <strong>Liveness</strong> and{" "}
                <strong>Next-Use</strong> info for every variable.
              </p>
              <p className="text-sm text-muted-foreground">
                By scanning a block <em>backwards</em>, it determines the exact
                instruction index where a variable is next read. Once a variable
                is read for the last time (it goes "dead"), the register holding
                it can be safely freed and reassigned to another variable!
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">
                Register Allocation & Assignment
              </h3>
              <p className="text-sm text-muted-foreground">
                The hardest problem in code generation. Can be framed as a{" "}
                <strong>Graph Coloring Problem</strong>.
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>
                  <strong>Allocation:</strong> Selecting which variables reside
                  in registers vs memory.
                </li>
                <li>
                  <strong>Assignment:</strong> Picking the exact physical
                  register (e.g., RAX vs RCX) for a variable.
                </li>
              </ul>
              <div className="bg-muted/50 text-xs font-mono p-2 rounded text-muted-foreground">
                If # live variables &gt; # registers, the compiler must{" "}
                <strong>Spill</strong> variables back to main memory
                temporarily.
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Organization & Activation Records */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Layers className="h-8 w-8 text-emerald-500" />
            Runtime Storage Organization
          </h2>
          <p className="text-muted-foreground mb-6">
            When a program executes, the OS allocates memory. The compiler must
            structure exactly how data is laid out during runtime.
          </p>

          <Card className="shadow-sm border-emerald-500/20">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-border/50">
                  <h3 className="font-bold text-xl mb-4 text-emerald-600 dark:text-emerald-400">
                    Memory Segments
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <div className="w-20 pt-1 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 bg-muted rounded">
                          Code
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Immutable machine instructions. Generated directly by
                        the compiler. Size is fixed at compile time.
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <div className="w-20 pt-1 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 bg-muted rounded">
                          Static
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Global variables and constants. Size is fixed at compile
                        time.
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <div className="w-20 pt-1 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded">
                          Heap
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Dynamic memory allocated at runtime (e.g.,{" "}
                        <code>malloc()</code> or <code>new</code>). Grows
                        upward.
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <div className="w-20 pt-1 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-500/10 text-blue-600 rounded">
                          Stack
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Function calls, local variables, and return addresses.
                        Grows downward to meet the heap.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-6 md:w-1/2">
                  <h3 className="font-bold text-xl mb-4 text-blue-600 dark:text-blue-400">
                    Activation Records
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Every time a function is called, a block of memory called an{" "}
                    <strong>Activation Record</strong> (or Stack Frame) is
                    pushed onto the Call Stack. It tracks:
                  </p>

                  <div className="bg-background border rounded-lg font-mono text-xs overflow-hidden">
                    <div className="p-2 border-b bg-muted/30 text-center">
                      <strong>Actual Parameters</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        passed from caller
                      </span>
                    </div>
                    <div className="p-2 border-b text-center">
                      <strong>Return Value</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        space for returned data
                      </span>
                    </div>
                    <div className="p-2 border-b bg-muted/30 text-center">
                      <strong>Control Link</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        points to caller's frame (dynamic link)
                      </span>
                    </div>
                    <div className="p-2 border-b text-center">
                      <strong>Access Link</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        points to enclosing lexical scope (static link)
                      </span>
                    </div>
                    <div className="p-2 border-b bg-muted/30 text-center">
                      <strong>Saved Machine Status</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        registers, program counter return address
                      </span>
                    </div>
                    <div className="p-2 border-b text-center">
                      <strong>Local Data</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        local variables defined in the function
                      </span>
                    </div>
                    <div className="p-2 bg-muted/30 text-center">
                      <strong>Temporaries</strong>{" "}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        for intermediate multi-step calculations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
