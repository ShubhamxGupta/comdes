import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      </div>
    </div>
  );
}
