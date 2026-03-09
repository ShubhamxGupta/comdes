import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Network, Brackets } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReDfaPage() {
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
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          Regular Expressions to DFA
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Learn how to formally specify tokens using Extended Regular
          Expressions and compile them directly into a Deterministic Finite
          Automata (DFA) using the Direct Method.
        </p>

        {/* Extended Regular Expressions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Brackets className="h-8 w-8 text-orange-500" />
            Extended Regular Expressions
          </h2>
          <Card className="mb-6 shadow-sm border-orange-500/20">
            <CardHeader>
              <CardTitle>Specification of Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Regular Expressions (REs) are the standard notation for
                specifying the patterns that lexemes must match to form a token.
                While basic REs only include Union (<code>|</code>),
                Concatenation, and Kleene Star (<code>*</code>),{" "}
                <strong>Extended Regular Expressions</strong> add syntactic
                sugar for convenience:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    One or more instances (<code>+</code>)
                  </h4>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    r+
                  </code>
                  <p className="text-sm mt-2">
                    Matches one or more occurrences of <code>r</code>.
                    Equivalent to <code>r(r*)</code>.
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    Zero or one instance (<code>?</code>)
                  </h4>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    r?
                  </code>
                  <p className="text-sm mt-2">
                    Matches zero or one occurrence of <code>r</code>. Equivalent
                    to <code>(r | ε)</code>.
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    Character Classes
                  </h4>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    [a-z]
                  </code>
                  <p className="text-sm mt-2">
                    Matches any character in the specified range. Equivalent to{" "}
                    <code>a|b|c...|z</code>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Direct Method RE -> DFA */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Network className="h-8 w-8 text-emerald-500" />
            RE to DFA (Direct Method)
          </h2>
          <p className="text-muted-foreground mb-6">
            Instead of converting an RE to an NFA (using Thompson's
            construction) and then converting that NFA to a DFA (using Subset
            Construction), the <strong>Direct Method</strong> constructs a DFA
            straight from an augmented Regular Expression.
          </p>

          <Card className="mb-6 shadow-sm border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                The Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Augment the Regular Expression
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Concatenate the RE with a special end marker{" "}
                      <code>#</code>. For an expression <code>r</code>, form{" "}
                      <code>(r)#</code>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Construct a Syntax Tree
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Build a syntax tree for the augmented expression. The
                      leaves represent operands (characters and <code>#</code>),
                      and internal nodes represent operators (<code>|</code>,{" "}
                      <code>•</code>, <code>*</code>).
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assign unique integer <em>positions</em> $1, 2, ..., n$ to
                      the leaf nodes (excluding ε).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Compute Functions</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Traverse the tree bottom-up to compute three properties
                      for each node:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                      <li>
                        <strong>nullable(n):</strong> True if the subexpression
                        at node <em>n</em> can generate the empty string ε.
                      </li>
                      <li>
                        <strong>firstpos(n):</strong> Set of positions that can
                        match the first symbol of a string generated by the
                        subexpression at <em>n</em>.
                      </li>
                      <li>
                        <strong>lastpos(n):</strong> Set of positions that can
                        match the last symbol of a string generated by the
                        subexpression at <em>n</em>.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Compute followpos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      For every position <em>p</em>, compute{" "}
                      <code>followpos(p)</code>, which is the set of positions
                      that can directly follow <em>p</em> in the final string.
                    </p>
                    <div className="bg-muted/20 p-3 rounded mt-2 text-sm border font-medium text-foreground">
                      Two rules for followpos:
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-muted-foreground">
                        <li>
                          If node <em>n</em> is a concatenation{" "}
                          <code>c1 • c2</code>, then for every position{" "}
                          <em>i</em> in <code>lastpos(c1)</code>, all positions
                          in <code>firstpos(c2)</code> are in{" "}
                          <code>followpos(i)</code>.
                        </li>
                        <li>
                          If node <em>n</em> is a star node <code>c*</code>,
                          then for every position <em>i</em> in{" "}
                          <code>lastpos(c)</code>, all positions in{" "}
                          <code>firstpos(c)</code> are in{" "}
                          <code>followpos(i)</code>.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Construct DFA States</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The initial state of the DFA is the <code>firstpos</code>{" "}
                      of the root node.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      For any given state subset <em>S</em> and input symbol{" "}
                      <em>a</em>, the transition is to the state consisting of
                      the union of <code>followpos(p)</code> for all <em>p</em>{" "}
                      in <em>S</em> that correspond to symbol <em>a</em>.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Accepting states are those that contain the position
                      corresponding to the end marker <code>#</code>.
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
