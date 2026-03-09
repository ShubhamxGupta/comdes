import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Workflow, GitMerge, FileCode2, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SdtPage() {
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
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
          Syntax Directed Translation (SDT)
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Discover how compilers assign meaning to parsed syntax by attaching
          attributes and semantic rules directly to grammar productions.
        </p>

        {/* Syntax Directed Definitions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Workflow className="h-8 w-8 text-sky-500" />
            Syntax Directed Definitions (SDD)
          </h2>
          <p className="text-muted-foreground mb-6">
            A <strong>Syntax Directed Definition</strong> is a context-free
            grammar where every grammar symbol has a set of attributes, and
            every production rule has a set of semantic rules for computing the
            values of those attributes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-sky-500/20 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full pointer-events-none group-hover:bg-sky-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-sky-600 dark:text-sky-400">
                  Synthesized Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  The attribute value at a parse tree node is determined solely
                  from the attribute values of its <strong>children</strong>{" "}
                  (and itself).
                </p>
                <p>
                  Evaluated using a <strong>bottom-up</strong> traversal. Common
                  in arithmetic expression evaluation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
                  Inherited Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  The attribute value at a parse tree node is determined from
                  the attribute values of its{" "}
                  <strong>parent, itself, and its siblings</strong>.
                </p>
                <p>
                  Evaluated using a <strong>top-down</strong> or sideways
                  traversal. Used for passing context like variable types down
                  the tree.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              Evaluation Order (Dependency Graphs)
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              To evaluate attributes in a parse tree, we must follow their
              dependencies. If attribute{" "}
              <code className="bg-background px-1 rounded">B.b</code> depends on{" "}
              <code className="bg-background px-1 rounded">A.a</code>, then{" "}
              <code className="bg-background px-1 rounded">A.a</code> must be
              computed before{" "}
              <code className="bg-background px-1 rounded">B.b</code>. This
              forms a directed graph called a <strong>Dependency Graph</strong>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the dependency graph has no cycles, a <em>topological sort</em>{" "}
              gives a valid evaluation order. If cycles exist, the SDD cannot be
              evaluated.
            </p>
          </div>
        </div>

        {/* Categories of SDDs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <GitMerge className="h-8 w-8 text-indigo-500" />
            L-Attributed vs S-Attributed
          </h2>
          <Card className="mb-6 shadow-sm border-indigo-500/20">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-indigo-600 dark:text-indigo-400">
                    S-Attributed Definitions
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    An SDD is S-attributed if every attribute is{" "}
                    <strong>Synthesized</strong>.
                  </p>
                  <p className="text-muted-foreground text-sm font-medium">
                    Implementation: Can be easily evaluated during bottom-up LR
                    parsing. The attributes can simply be pushed onto the
                    parser's stack alongside the grammar symbols.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-purple-600 dark:text-purple-400">
                    L-Attributed Definitions
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    An SDD is L-attributed (Left-to-Right) if inherited
                    attributes of a symbol <code>Xj</code> on the RHS of a
                    production <code>A &rarr; X1 X2 ... Xn</code> depend ONLY
                    on:
                  </p>
                  <ul className="list-decimal pl-5 text-sm text-muted-foreground mb-3 space-y-1">
                    <li>
                      Inherited attributes of the head <code>A</code>.
                    </li>
                    <li>
                      Either synthesized or inherited attributes of the symbols{" "}
                      <code>X1, X2, ..., X(j-1)</code> located to the{" "}
                      <em>left</em> of <code>Xj</code>.
                    </li>
                    <li>
                      Attributes associated with <code>Xj</code> itself.
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm font-medium">
                    Implementation: Can be evaluated during top-down LL parsing
                    or during a single left-to-right depth-first traversal of
                    the parse tree.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Translation Schemes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FileCode2 className="h-8 w-8 text-pink-500" />
            Syntax Directed Translation Schemes
          </h2>
          <p className="text-muted-foreground mb-6">
            An <strong>SDT Scheme</strong> is a context-free grammar in which
            program fragments (semantic actions) are embedded within the right
            sides of productions.
          </p>
          <div className="font-mono text-sm bg-muted/30 p-4 rounded-lg border mb-6">
            <code>rest &rarr; + term &#123; print("+") &#125; rest1</code>
          </div>
          <p className="text-muted-foreground mb-6">
            In an SDT, the semantic action is executed precisely when all the
            symbols to its left have been successfully parsed. This makes SDTs
            incredibly practical for real-world compilers generating
            intermediate code directly during parsing.
          </p>

          <div className="p-6 bg-background border rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Interactive Semantic Solver
              </h3>
              <p className="text-muted-foreground text-sm">
                Write grammar rules containing semantic actions inside{" "}
                <code className="bg-muted px-1 rounded">&#123; &#125;</code> and
                see how attributes are mathematically computed across the parse
                tree!
              </p>
            </div>
            <Link href="/semantic" className="shrink-0">
              <Button
                size="lg"
                className="rounded-xl shadow-lg gap-2 h-14 px-8 text-base font-medium hover:scale-[1.02] transition-transform"
              >
                <Play className="w-5 h-5" /> Try the SDT Solver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
