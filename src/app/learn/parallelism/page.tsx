import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Zap,
  Database,
  Repeat,
  SplitSquareVertical,
  Cpu,
  Network,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ParallelismPage() {
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
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
          Optimization & Parallelism
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Unlock the full potential of hardware by optimizing for cache
          locality, vectorization, and instruction-level parallelism.
        </p>

        {/* Data Spaces and Cache Locality */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Database className="h-8 w-8 text-yellow-500" />
            Memory Hierarchy & Cache Locality
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-sm border-yellow-500/20">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">
                  Two Principal Data Spaces
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-muted-foreground space-y-3 shrink-0">
                <p>
                  Modern compilers must manage two distinct architectural
                  "spaces" to achieve performance:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>The Iteration Space:</strong> The multi-dimensional
                    space formed by nested loops. The compiler analyzes data
                    dependencies here.
                  </li>
                  <li>
                    <strong>The Data Space:</strong> The multi-dimensional array
                    layouts in memory. The compiler transforms iteration spaces
                    to match data spaces.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-emerald-500/20">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Cache Locality</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-muted-foreground space-y-3 shrink-0">
                <p>
                  Processors fetch data in blocks (Cache Lines). A compiler
                  optimizes for:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Spatial Locality:</strong> Accessing data that is
                    stored close together in memory (e.g., iterating a matrix
                    row-by-row in C).
                  </li>
                  <li>
                    <strong>Temporal Locality:</strong> Re-using the same data
                    within a short time frame so it doesn't get evicted from the
                    cache.
                  </li>
                </ul>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  Loop manipulation like <em>Loop Tiling</em> (blocking)
                  drastically improves cache hit rates for Matrix
                  Multiplication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instruction Level Parallelism */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-indigo-500" />
            Instruction-Level Parallelism (ILP)
          </h2>
          <p className="text-muted-foreground mb-6">
            Modern CPUs contain multiple execution units capable of executing
            several instructions simultaneously, provided those instructions do
            not depend on each other.
          </p>

          <div className="space-y-6">
            <Card className="bg-muted/10 border-indigo-500/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <SplitSquareVertical className="h-5 w-5 text-indigo-500" />{" "}
                  Instruction Scheduling
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The compiler analyzes the Data Dependency Graph of a basic
                  block. By reordering instructions, the compiler can overlap
                  the long latencies of memory loads or complex arithmetic with
                  the execution of independent, shorter instructions.
                </p>
                <div className="bg-background rounded font-mono text-xs p-3 border grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground mb-1">
                      // Poor Scheduling (Stalls)
                    </div>
                    <div>1. Load R1, A</div>
                    <div>
                      2. Add R2, R1, 1{" "}
                      <span className="text-red-500">
                        &lt;-- CPU halts waiting for R1
                      </span>
                    </div>
                    <div>3. Load R3, B</div>
                    <div>4. Add R4, R3, 1</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">
                      // Good Scheduling (No Stalls)
                    </div>
                    <div>1. Load R1, A</div>
                    <div>
                      2. Load R3, B{" "}
                      <span className="text-emerald-500">
                        &lt;-- Executed while waiting for A
                      </span>
                    </div>
                    <div>3. Add R2, R1, 1</div>
                    <div>4. Add R4, R3, 1</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/10 border-blue-500/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-blue-500" /> Software
                  Pipelining
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  In a tight loop, an iteration often waits for a previous
                  operation to finish. <strong>Software Pipelining</strong>{" "}
                  restructures the loop so that one iteration of the{" "}
                  <em>new</em> loop executes parts of several iterations of the{" "}
                  <em>original</em> loop simultaneously.
                </p>
                <div className="border-l-4 border-l-blue-500 pl-4 py-2 text-sm text-muted-foreground italic">
                  Example: While iteration `i` is storing its result, iteration
                  `i+1` is performing its arithmetic, and iteration `i+2` is
                  issuing memory loads.
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/10 border-teal-500/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-teal-500" />{" "}
                  Vectorization (SIMD)
                </h3>
                <p className="text-muted-foreground text-sm">
                  Single Instruction, Multiple Data (SIMD). The compiler
                  automatically detects inner loops that apply the same
                  operation to an array of data. It replaces sequential scalar
                  instructions with special Vector Instructions (like AVX or
                  NEON) that process 4, 8, or 16 elements in a single CPU clock
                  cycle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SSA & DSLs */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Network className="h-8 w-8 text-rose-500" />
              SSA Form
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Static Single Assignment (SSA)</strong> form is an
              intermediate representation property. It requires that every
              variable is assigned a value exactly <em>once</em>.
            </p>
            <div className="bg-muted/30 p-4 border rounded-xl text-sm mb-4">
              If a variable{" "}
              <code className="bg-background px-1 rounded">x</code> is modified
              multiple times in the source code, SSA renames it to{" "}
              <code className="bg-background px-1 rounded">x1, x2, x3</code>.
            </div>
            <p className="text-sm text-muted-foreground">
              When control flows merge (e.g., after an if-else), a special{" "}
              <code>&Phi; (Phi)</code> function is inserted to choose the
              correct version of the variable depending on which path was taken.
              SSA makes data flow analysis vastly simpler and faster.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="h-8 w-8 text-fuchsia-500" />
              DSLs for Optimization
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Domain Specific Languages (DSLs)</strong> play a huge role
              in modern optimization architectures (like Halide for image
              processing or TVM for Machine Learning).
            </p>
            <p className="text-sm text-muted-foreground">
              Instead of relying on the compiler to magically guess the best way
              to parallelize C/C++ loops, DSLs separate the{" "}
              <strong>Algorithm</strong> from the <strong>Schedule</strong> (how
              it's executed).
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              This allows developers to explicitly command the compiler to
              unroll, vectorize, and tile specific loops for maximum parallel
              performance onto target Hardware (GPUs/TPUs).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
