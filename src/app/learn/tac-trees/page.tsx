import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Archive,
  GitBranch,
  ArrowRightLeft,
  Database,
  SplitSquareHorizontal,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TacTreesPage() {
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
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
          Intermediate Representations
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Translate semantic structures into machine-independent intermediate
          logic using Syntax Trees and Three-Address Code (TAC).
        </p>

        {/* Variants of Syntax Trees */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-fuchsia-500" />
            Variants of Syntax Trees
          </h2>
          <Card className="mb-6 shadow-sm border-fuchsia-500/20">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Directed Acyclic Graphs (DAGs)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-muted-foreground space-y-4">
              <p>
                A standard <strong>Syntax Tree</strong> represents the
                hierarchical structure of a program. A powerful variant is the{" "}
                <strong>Directed Acyclic Graph (DAG)</strong>.
              </p>
              <p>
                A DAG is a syntax tree that shares common subexpressions. If an
                expression like <code>a + a * (b - c) + (b - c) * d</code>{" "}
                appears, the DAG will only create <em>one</em> node for the
                subexpression <code>b - c</code>, pointing multiple parent nodes
                to it.
              </p>
              <div className="bg-muted/30 p-4 border rounded-lg text-sm flex gap-3 mt-4">
                <div className="font-bold text-foreground">Why DAGs?</div>
                <div>
                  They automatically eliminate redundant code evaluation,
                  shrinking the generated intermediate code and significantly
                  accelerating execution.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Three Address Code (TAC) */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Archive className="h-8 w-8 text-pink-500" />
            Three-Address Code (TAC)
          </h2>
          <p className="text-muted-foreground mb-6">
            <strong>Three-Address Code</strong> is a linearized representation
            of a syntax tree. It's called "Three-Address" because each
            instruction has at most three operands: two operands for the
            computation, and one for the result.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-pink-500/20 shadow-sm relative overflow-hidden group hover:border-pink-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-full pointer-events-none group-hover:bg-pink-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-pink-600 dark:text-pink-400">
                  <ArrowRightLeft className="w-5 h-5" /> Assignment Statements
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="font-mono bg-background px-3 py-2 border rounded">
                  x = y op z
                </div>
                <div className="font-mono bg-background px-3 py-2 border rounded">
                  x = op y{" "}
                  <span className="text-muted-foreground/50 text-xs">
                    (Unary)
                  </span>
                </div>
                <div className="font-mono bg-background px-3 py-2 border rounded">
                  x = y{" "}
                  <span className="text-muted-foreground/50 text-xs">
                    (Copy)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-500/20 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:bg-rose-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
                  <SplitSquareHorizontal className="w-5 h-5" /> Control Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="font-mono bg-background px-3 py-2 border rounded">
                  goto L
                </div>
                <div className="font-mono bg-background px-3 py-2 border rounded">
                  if x relop y goto L
                </div>
                <p className="mt-2 leading-relaxed">
                  Used to implement if-else, while-loops, and switch-case
                  statements.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-border/50 bg-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-5 h-5" /> Data Structures for TAC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">
                    Quadruples
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A structure with four fields: <code>op</code>,{" "}
                    <code>arg1</code>, <code>arg2</code>, and{" "}
                    <code>result</code>. Highly readable and easy to optimize,
                    but wastes memory if temporary variables are excessive.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">
                    Triples
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    omits the <code>result</code> field. Instead of writing a
                    result to a temporary variable, it refers to the{" "}
                    <em>index</em> of the statement that computed it. Harder to
                    reorder during optimization.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">
                    Indirect Triples
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Uses a list of pointers to triples, rather than the triples
                    themselves. This allows optimizers to easily reorder
                    execution just by moving pointers, retaining the memory
                    efficiency of triples.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Translation Details */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Archive className="h-8 w-8 text-purple-500" />
            Advanced Translation Concepts
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-l-purple-500 pl-4 py-2">
              <h3 className="font-bold text-xl mb-2">Backpatching</h3>
              <p className="text-muted-foreground">
                In a one-pass compiler, when compiling boolean expressions for
                control flow (like <code>if-else</code> or <code>while</code>),
                the jump destinations are often <em>unknown</em> at the time the
                jump instruction is generated. <br />
                <br />
                <strong>Backpatching</strong> solves this by storing lists of
                instruction indices that are "waiting" for a destination. Once
                the destination label is determined later in parsing, the
                compiler iterates through the list and "patches" the blank jump
                fields with the correct address.
              </p>
            </div>

            <div className="border-l-4 border-l-purple-500 pl-4 py-2">
              <h3 className="font-bold text-xl mb-2">Switch-Case Statements</h3>
              <p className="text-muted-foreground">
                Switch statements are translated into a sequence of conditional
                jumps. If the number of cases is large and densely packed,
                compilers often implement them using a{" "}
                <strong>Jump Table</strong>—an array of addresses where the
                expression's offset points directly to the correct case block,
                executing in $O(1)$ time instead of $O(n)$ cascading{" "}
                <code>if</code> checks.
              </p>
            </div>

            <div className="border-l-4 border-l-purple-500 pl-4 py-2">
              <h3 className="font-bold text-xl mb-2">
                Declarations & Procedures
              </h3>
              <p className="text-muted-foreground">
                For procedure calls, typical TAC looks like:
                <br />
                <code className="bg-muted px-2 py-1 rounded">param x1</code>
                <br />
                <code className="bg-muted px-2 py-1 rounded">param x2</code>
                <br />
                <code className="bg-muted px-2 py-1 rounded">call p, 2</code>
                <br />
                <br />
                Declarations don't generate execution code—they compute{" "}
                <strong>offsets</strong> for each variable in memory relative to
                the activation record block.
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-background border rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Generate TAC Interactively
              </h3>
              <p className="text-muted-foreground text-sm">
                Write grammar rules containing semantic actions, and our engine
                will recursively evaluate it and generate Quadruples, Triples,
                and Indirect Triples automatically.
              </p>
            </div>
            <Link href="/icg" className="shrink-0">
              <Button
                size="lg"
                className="rounded-xl shadow-lg gap-2 h-14 px-8 text-base font-medium hover:scale-[1.02] transition-transform"
              >
                <Play className="w-5 h-5" /> Code Generator Toolkit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
