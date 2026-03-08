import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function LL1Page() {
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
          LL(1) Parsing
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A deterministic top-down parsing algorithm reading input from{" "}
          <strong>L</strong>eft to right, computing a <strong>L</strong>eftmost
          derivation, with <strong>1</strong> symbol of lookahead.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How LL(1) Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              LL(1) parsers maintain a stack containing grammar symbols and
              predictively replace the top non-terminal by looking precisely{" "}
              <em>one</em> terminal ahead in the input stream. This is why LL(1)
              uses a 2D Parsing Table defined by{" "}
              <code>Table[NonTerminal][Terminal]</code>.
            </p>
            <p>
              To construct this predictive routing table, the compiler computes
              two mathematical properties for every symbol in the grammar:{" "}
              <strong>FIRST</strong> and <strong>FOLLOW</strong> sets.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>FIRST and FOLLOW Sets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold border-b pb-1 mb-0">
                  FIRST Sets
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm font-normal">
                      <p>
                        Think of FIRST sets as: &quot;If I am looking at
                        Non-Terminal A, what are all the exact terminal
                        characters I could possibly see starting off its
                        expansion?&quot;
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="mb-3 text-muted-foreground">
                <code>FIRST(&alpha;)</code> is the set of terminals that begin
                strings derived from &alpha;. If &alpha; can derive the empty
                string, then <code>&epsilon;</code> is also in{" "}
                <code>FIRST(&alpha;)</code>.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  If <code>X</code> is a terminal,{" "}
                  <code>FIRST(X) = {"{X}"}</code>
                </li>
                <li>
                  If <code>X &rarr; &epsilon;</code> is a production, add{" "}
                  <code>&epsilon;</code> to <code>FIRST(X)</code>
                </li>
                <li>
                  If <code>X</code> is a non-terminal and{" "}
                  <code>X &rarr; Y1 Y2 ... Yk</code>, then place{" "}
                  <code>FIRST(Y1)</code> (excluding &epsilon;) into{" "}
                  <code>FIRST(X)</code>. Cascade down the sequence if preceding
                  symbols are nullable.
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold border-b pb-1 mb-0">
                  FOLLOW Sets
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm font-normal">
                      <p>
                        Think of FOLLOW sets as: &quot;If Non-Terminal A
                        vanishes or completes its expansion, what terminal
                        characters are allowed to come immediately after it in
                        the sequence?&quot;
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="mb-3 text-muted-foreground">
                <code>FOLLOW(A)</code> is the set of terminals that can appear
                immediately to the right of Non-Terminal <code>A</code> in some
                sentential form.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Place the end-of-input marker <code>$</code> into{" "}
                  <code>FOLLOW(S)</code> (the start symbol).
                </li>
                <li>
                  If there is a production{" "}
                  <code>A &rarr; &alpha; B &beta;</code>, then everything in{" "}
                  <code>FIRST(&beta;)</code> except for <code>&epsilon;</code>{" "}
                  is placed in <code>FOLLOW(B)</code>.
                </li>
                <li>
                  If there is a production <code>A &rarr; &alpha; B</code>, or a
                  production <code>A &rarr; &alpha; B &beta;</code> where{" "}
                  <code>FIRST(&beta;)</code> contains <code>&epsilon;</code>,
                  then everything in <code>FOLLOW(A)</code> is placed in{" "}
                  <code>FOLLOW(B)</code>.
                </li>
              </ul>
            </div>

            <div className="mt-10 border-t pt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  2
                </span>
                Step-by-Step: Constructing the Sets
              </h3>
              <p className="text-muted-foreground mb-6">
                Let's calculate the FIRST and FOLLOW sets for a simple grammar:{" "}
                <code>S &rarr; a S a | b S b | c</code>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/30 border rounded-lg p-5">
                  <h4 className="font-bold text-sm mb-3 text-foreground/80 uppercase tracking-widest border-b pb-2">
                    Computing FIRST(S)
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        S &rarr; a S a
                      </span>
                      <span>
                        The first symbol is the terminal <code>a</code>. Add{" "}
                        <code>a</code> to FIRST(S).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        S &rarr; b S b
                      </span>
                      <span>
                        The first symbol is the terminal <code>b</code>. Add{" "}
                        <code>b</code> to FIRST(S).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        S &rarr; c
                      </span>
                      <span>
                        The first symbol is the terminal <code>c</code>. Add{" "}
                        <code>c</code> to FIRST(S).
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-primary/10 rounded font-mono text-center font-bold text-primary">
                    FIRST(S) = {"{"} a, b, c {"}"}
                  </div>
                </div>

                <div className="bg-muted/30 border rounded-lg p-5">
                  <h4 className="font-bold text-sm mb-3 text-foreground/80 uppercase tracking-widest border-b pb-2">
                    Computing FOLLOW(S)
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        Rule 1
                      </span>
                      <span>
                        S is the Start Symbol, so we immediately add the EOF
                        marker <code>$</code> to FOLLOW(S).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        S &rarr; a S a
                      </span>
                      <span>
                        Look at S on the RHS. What follows S? The terminal{" "}
                        <code>a</code>. Add <code>a</code> to FOLLOW(S).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono bg-background px-2 py-1 rounded border text-xs whitespace-nowrap h-fit">
                        S &rarr; b S b
                      </span>
                      <span>
                        Look at S on the RHS. What follows S? The terminal{" "}
                        <code>b</code>. Add <code>b</code> to FOLLOW(S).
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-primary/10 rounded font-mono text-center font-bold text-primary">
                    FOLLOW(S) = {"{"} $, a, b {"}"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              LL(1) Ambiguity & Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A grammar whose parsing table has no multiply-defined entries is
              an LL(1) grammar. Conversely, if computing the table yields a cell
              containing <em>two or more</em> overlapping rules, the grammar
              cannot be deterministically evaluated top-down with 1 lookahead
              token.
            </p>
            <p className="mt-4 font-semibold">
              Common obstacles preventing LL(1) compliance:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Left Recursion</strong>: Any rule like{" "}
                <code>E &rarr; E + T</code> creates an infinite loop where the
                parser predictively expands <code>E</code> forever waiting for{" "}
                <code>T</code>. LR parsers can handle this natively!
              </li>
              <li>
                <strong>Left Factoring</strong>: When two productions share the
                same prefix (e.g. <code>A &rarr; a B | a C</code>), an LL(1)
                parser cannot know which branch to select seeing just{" "}
                <code>a</code>.{" "}
              </li>
              <li>
                <strong>Inherent Ambiguity</strong>: A single language string
                possessing two entirely unique but valid derivation trees.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8 overflow-hidden border-emerald-500/20 shadow-md">
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-background p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-foreground">
              <Play className="h-5 w-5 text-emerald-500" />
              Interactive Demo
            </h3>
            <p className="text-muted-foreground mb-6">
              See LL(1) parsing in action. We've prepared a simple,
              LL(1)-compliant palindrome grammar. Click below to open it in the
              Syntax Engine and watch the FIRST/FOLLOW sets and Predictive
              Parsing Table generate instantly.
            </p>
            <Link
              href={`/solve?g=${btoa("S -> a S a | b S b | c")}&t=${btoa("a b c b a")}`}
            >
              <Button
                size="lg"
                className="gap-2 shadow-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="h-4 w-4 fill-current" /> Try LL(1) Solver
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
