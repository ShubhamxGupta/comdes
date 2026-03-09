import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart2,
  ShieldCheck,
  Cpu,
  Box,
  LayoutTemplate,
  Layers,
  Repeat2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BasicBlocksPage() {
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
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
          Code Optimization & Basic Blocks
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Improve the intermediate code to consume fewer resources, execute
          faster, and maintain strict semantic equivalence.
        </p>

        {/* Basic Blocks and Flow Graphs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Box className="h-8 w-8 text-cyan-500" />
            Basic Blocks & Flow Graphs
          </h2>
          <Card className="mb-6 shadow-sm border-cyan-500/20">
            <CardHeader className="pb-4">
              <CardTitle>What is a Basic Block?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                A <strong>Basic Block</strong> is a sequence of consecutive
                statements in which flow of control enters at the beginning and
                leaves at the end without halt or possibility of branching
                except at the end.
              </p>

              <div className="bg-muted/30 p-4 border rounded-xl flex flex-col md:flex-row gap-6 mt-4 items-start md:items-center">
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-foreground">
                    Partitioning into Basic Blocks:
                  </h4>
                  <ul className="list-decimal pl-5 space-y-1 text-sm">
                    <li>
                      Determine <strong>Leader</strong> statements: The first
                      instruction, any target of a conditional/unconditional
                      jump, and any instruction immediately following a jump.
                    </li>
                    <li>
                      For each leader, its basic block consists of the leader
                      and all statements up to but not including the next leader
                      or end of program.
                    </li>
                  </ul>
                </div>
                <div className="bg-background border px-4 py-3 rounded-lg font-mono text-xs w-full md:w-auto shrink-0 space-y-1 text-primary">
                  <div className="text-muted-foreground mb-1">
                    // Block 1: Leader is line 1
                  </div>
                  <div>1. i = 1</div>
                  <div className="text-muted-foreground mt-2 mb-1">
                    // Block 2: Leader is line 2 (target)
                  </div>
                  <div>2. t1 = a[i]</div>
                  <div>3. t1 = t1 * 2</div>
                  <div>4. if i &lt;= 10 goto 2</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-500" /> Flow
                  Graphs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Basic blocks are the nodes of a{" "}
                  <strong>Control Flow Graph (CFG)</strong>. Directed edges
                  represent jumps between blocks. Loops in flow graphs are
                  critical targets for optimization.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" /> DAG
                  Representation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Inside a single basic block, operations can be transformed
                  into a <strong>Directed Acyclic Graph (DAG)</strong> to easily
                  identify and eliminate local common subexpressions and dead
                  code.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Machine Independent Optimization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-rose-500" />
            Machine Independent Optimization
          </h2>
          <p className="text-muted-foreground mb-6">
            These optimizations apply to the intermediate code regardless of the
            target CPU architecture.
          </p>

          <div className="space-y-6">
            {/* Principal Sources */}
            <h3 className="text-xl font-bold border-b pb-2">
              Principal Sources of Optimization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-background border p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-2 text-primary">
                  Common Subexpressions
                </h4>
                <p className="text-xs text-muted-foreground">
                  Avoiding recomputing an expression if its operands have not
                  changed since previously computed.
                </p>
              </div>
              <div className="bg-background border p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-2 text-primary">
                  Copy Propagation
                </h4>
                <p className="text-xs text-muted-foreground">
                  Using a variable's assigned value directly instead of copying
                  it to temporary variables repeatedly.
                </p>
              </div>
              <div className="bg-background border p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-2 text-primary">
                  Dead-Code Elimination
                </h4>
                <p className="text-xs text-muted-foreground">
                  Removing code that computes values never used, or branches
                  that are mathematically unreachable.
                </p>
              </div>
              <div className="bg-background border p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-2 text-primary">
                  Constant Folding
                </h4>
                <p className="text-xs text-muted-foreground">
                  Deducing at compile time that the value of an expression is a
                  constant and replacing the code with the constant.
                </p>
              </div>
            </div>

            {/* Loops and Data Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                  <Repeat2 className="h-5 w-5 text-rose-500" /> Loop
                  Optimizations
                </h3>
                <p className="text-sm text-muted-foreground">
                  Loops are where programs spend most of their time. Key
                  techniques include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                  <li>
                    <strong>Code Motion (Hoisting):</strong> Moving computations
                    that produce the same result every iteration outside the
                    loop.
                  </li>
                  <li>
                    <strong>Induction Variable Elimination:</strong> Removing
                    extra loop counters if they can be derived from another
                    iterating variable.
                  </li>
                  <li>
                    <strong>Reduction in Strength:</strong> Replacing expensive
                    operations (like multiplication) with cheaper ones (like
                    addition) inside loops.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">
                  Data Flow Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  To perform global optimization across multiple basic blocks,
                  compilers use <strong>Data Flow Analysis</strong>. It gathers
                  information about the possible set of values calculated at
                  various points in a program.
                </p>
                <p className="text-sm text-muted-foreground">
                  By solving Data Flow Equations (like Reaching Definitions or
                  Live Variable Analysis) iteratively until convergence, the
                  compiler safely determines where optimizations can cross block
                  boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Dependent: Peephole, Naive Codegen, VM Limits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-indigo-500" />
            Machine-Dependent & Target Optimization
          </h2>

          <Card className="mb-6 shadow-sm border-indigo-500/20">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-indigo-600 dark:text-indigo-400">
                    Peephole Optimization
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    A simple but effective technique applied to the final target
                    code. The compiler examines a short, sliding window (a
                    "peephole") of target instructions and replaces them with a
                    faster or shorter equivalent sequence.
                  </p>
                  <p className="text-muted-foreground text-sm font-medium">
                    Common targets: Redundant loads/stores, unreachable
                    instructions, branch chaining, algebraic simplifications,
                    and using specific machine idioms.
                  </p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Box className="h-5 w-5 text-muted-foreground" /> Naive
                      Code Generator for a VM
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      A simple "naive" code generator translates each TAC
                      instruction directly into the target machine's instruction
                      set without deeply tracking registers across statements.
                      While it's easy to build to target Virtual Machines (like
                      the JVM), it results in highly inefficient{" "}
                      <code>load/store</code> heavy code, emphasizing the need
                      for robust register allocation.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-red-500" /> Security
                      Checking of VM Code
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      When generating code for Virtual Machines, the compiler or
                      the VM runtime must perform strictly enforced security
                      checks (like the JVM's Bytecode Verifier). These checks
                      ensure that the code doesn't maliciously manipulate
                      pointers, illegally access memory boundaries, or bypass
                      type safety rules.
                    </p>
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
