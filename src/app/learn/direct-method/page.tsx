import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function DirectMethodPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/learn">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft className="w-4 h-4" /> Back to Learning Resources
          </Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Direct Method to Generate Parse Tree
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A fundamental approach to understanding string derivation by matching
          grammar rules sequentially without complex automated tables.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What is the Direct Method?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The <strong>Direct Method</strong> evaluates a grammar by
              attempting to manually or semi-manually replace non-terminals with
              their productions until the target string is derived. While
              standard compilers use automated techniques like LL or LR parsing
              tables, the direct method is a crucial educational tool for
              visualizing how derivation trees are constructed top-down or
              bottom-up.
            </p>
            <p>
              By applying productions directly to the sequence, we form a{" "}
              <strong>Parse Tree</strong>. The root of the tree is the start
              symbol of the grammar, and the leaves are the terminals forming
              the final sentence.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Constructing the Parse Tree</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b pb-1 mb-3">
                Step-by-Step Derivation
              </h3>
              <p className="mb-3 text-muted-foreground">
                To parse a string directly, you follow these general steps:
              </p>
              <ul className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Start with Root:</strong> Place the grammar&apos;s
                  Start Symbol at the root.
                </li>
                <li>
                  <strong>Choose a Non-Terminal:</strong> Select an unexpanded
                  Non-Terminal (usually the leftmost or rightmost one).
                </li>
                <li>
                  <strong>Apply a Production:</strong> Choose a suitable rule
                  from the grammar and expand the non-terminal into child nodes.
                </li>
                <li>
                  <strong>Match Terminals:</strong> Ensure the derived terminals
                  match the target input string sequentially.
                </li>
                <li>
                  <strong>Repeat:</strong> Continue expanding until all leaf
                  nodes are terminals forming the exact input string.
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold border-b pb-1 mb-3">
                Example
              </h3>
              <p className="mb-3">
                Given the grammar:
                <br />
                <code>E &rarr; E + E | E * E | id</code>
              </p>
              <p>
                To derive the string <code>id + id * id</code> directly:
              </p>
              <ol className="list-decimal pl-6 space-y-1 bg-muted/20 p-4 rounded-md font-mono mt-2">
                <li>E</li>
                <li>
                  E + E <em>(applying E &rarr; E + E)</em>
                </li>
                <li>
                  id + E <em>(applying E &rarr; id to the first E)</em>
                </li>
                <li>
                  id + E * E <em>(applying E &rarr; E * E to the second E)</em>
                </li>
                <li>
                  id + id * E <em>(applying E &rarr; id to the second E)</em>
                </li>
                <li>
                  id + id * id <em>(applying E &rarr; id to the third E)</em>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-10 border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                1
              </span>
              Step-by-Step Example: Direct Derivation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <p className="text-muted-foreground">
              Let's derive the string <code>id + id * id</code> directly using
              the grammar: <code>E &rarr; E + E | E * E | id</code>. We will
              construct a Leftmost Derivation.
            </p>

            <div className="bg-muted/30 border rounded-lg p-5">
              <div className="font-mono text-sm space-y-4">
                <div className="flex gap-4 items-center group border-b border-border/50 pb-3">
                  <div className="w-8 shrink-0 flex items-center justify-center bg-background rounded-full h-8 w-8 text-xs font-bold border">
                    1
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <span className="w-20 text-right text-muted-foreground font-medium text-lg">
                      E
                    </span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-lg">
                      <span className="text-primary font-bold">E</span> + E
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Apply <code>E &rarr; E + E</code> to root
                  </div>
                </div>

                <div className="flex gap-4 items-center group border-b border-border/50 pb-3">
                  <div className="w-8 shrink-0 flex items-center justify-center bg-background rounded-full h-8 w-8 text-xs font-bold border">
                    2
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <span className="w-20 text-right text-muted-foreground font-medium text-lg"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-lg">
                      <span className="text-green-600 dark:text-green-400">
                        id
                      </span>{" "}
                      + <span className="text-primary font-bold">E</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Apply <code>E &rarr; id</code> to first E
                  </div>
                </div>

                <div className="flex gap-4 items-center group border-b border-border/50 pb-3">
                  <div className="w-8 shrink-0 flex items-center justify-center bg-background rounded-full h-8 w-8 text-xs font-bold border">
                    3
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <span className="w-20 text-right text-muted-foreground font-medium text-lg"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-lg">
                      <span className="text-green-600 dark:text-green-400">
                        id
                      </span>{" "}
                      + <span className="text-primary font-bold">E</span> * E
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Apply <code>E &rarr; E * E</code> to second E
                  </div>
                </div>

                <div className="flex gap-4 items-center group border-b border-border/50 pb-3">
                  <div className="w-8 shrink-0 flex items-center justify-center bg-background rounded-full h-8 w-8 text-xs font-bold border">
                    4
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <span className="w-20 text-right text-muted-foreground font-medium text-lg"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-lg">
                      <span className="text-green-600 dark:text-green-400">
                        id
                      </span>{" "}
                      +{" "}
                      <span className="text-green-600 dark:text-green-400">
                        id
                      </span>{" "}
                      * <span className="text-primary font-bold">E</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Apply <code>E &rarr; id</code> to middle E
                  </div>
                </div>

                <div className="flex gap-4 items-center group pb-1">
                  <div className="w-8 shrink-0 flex items-center justify-center bg-background rounded-full h-8 w-8 text-xs font-bold border">
                    5
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <span className="w-20 text-right text-muted-foreground font-medium text-lg"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-lg">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        id + id * id
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block text-emerald-500 font-bold">
                    Accept! Leaves match string.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium">
                Watch the Syntax Engine construct this exact Tree automatically
                from these rules!
              </span>
              <Link
                href={`/solve?g=${btoa("E -> E + E | E * E | id")}&t=${btoa("id + id * id")}`}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full gap-2">
                  <Play className="h-4 w-4" /> Trace the Direct Derivation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-500">
              Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The direct method is great for human comprehension and simple
              examples. However, it requires backtracking or "guessing" the
              correct production rule when multiple options exist for a
              non-terminal. This makes it inefficient and impractical for
              automated, large-scale compiler implementations. Complex,
              ambiguous grammars can lead to incorrect branch selections without
              lookahead systems (like in LL) or deterministic automata (like in
              LR).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
