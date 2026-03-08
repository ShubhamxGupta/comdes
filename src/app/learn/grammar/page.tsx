import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GrammarBasicsPage() {
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
          Grammar Basics
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          An introduction to Context-Free Grammars, Terminals, and
          Non-Terminals.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What is a Context-Free Grammar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              In formal language theory, a{" "}
              <strong>Context-Free Grammar (CFG)</strong> is a set of recursive
              rewriting rules (or <em>productions</em>) used to generate
              patterns of strings. They are the standard way to mathematically
              describe the syntax of programming languages.
            </p>
            <p>A CFG consists of four components:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Non-Terminals (N)</strong>: Variables that represent a
                syntactic category (e.g., <code>Expr</code>, <code>Term</code>).
                These are the symbols that can be expanded or replaced.
              </li>
              <li>
                <strong>Terminals (Σ)</strong>: The actual, literal symbols that
                appear in the target string or source code (e.g.,{" "}
                <code>id</code>, <code>+</code>, <code>(</code>). These cannot
                be expanded further.
              </li>
              <li>
                <strong>Productions (P)</strong>: Rules describing how
                non-terminals can be replaced. Format:{" "}
                <code>
                  LHS (Non-Terminal) &rarr; RHS (Combination of Terminals &
                  Non-Terminals)
                </code>
                .
              </li>
              <li>
                <strong>Start Symbol (S)</strong>: The designated non-terminal
                symbol from which all derivations begin.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Writing Grammars in this Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our parser engine supports standard Backus-Naur Form (BNF) style
              syntax. You can use either the arrow <code>-&gt;</code> or a colon{" "}
              <code>:</code> to delimit rules. Multiple production bodies can be
              separated by a pipe <code>|</code>.
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm leading-relaxed overflow-x-auto">
              E -&gt; E + T | T <br />
              T -&gt; T * F | F <br />F -&gt; ( E ) | id
            </div>

            <h4 className="font-semibold mt-6 mb-2">
              Epsilon (Empty) Productions
            </h4>
            <p>
              When a non-terminal can be expanded into an empty string, we
              represent this using the Greek letter Epsilon (`ε`). Our engine
              natively detects this using either the literal <code>ε</code> or
              the word <code>epsilon</code>.
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              S -&gt; A a b <br />A -&gt; ε
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
              Step-by-Step Example: Derivations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <p className="text-muted-foreground">
              A <strong>derivation</strong> is the sequence of rule applications
              that transforms the Start Symbol into a string of pure terminals.
              Let's derive the string <code>id + id * id</code> using the
              standard arithmetic grammar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-muted/30 border rounded-lg p-5">
                <h4 className="font-bold text-sm mb-3 text-foreground/80 uppercase tracking-widest border-b pb-2">
                  Leftmost Derivation
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Always expand the <em>leftmost</em> non-terminal first.
                </p>
                <div className="font-mono text-sm space-y-2">
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium">
                      E
                    </span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">E</span> + T
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">T</span> + T
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">F</span> + T
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    + <span className="text-primary font-bold">T</span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    + <span className="text-primary font-bold">T</span> * F
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    + <span className="text-primary font-bold">F</span> * F
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    * <span className="text-primary font-bold">F</span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border rounded-lg p-5">
                <h4 className="font-bold text-sm mb-3 text-foreground/80 uppercase tracking-widest border-b pb-2">
                  Rightmost Derivation
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Always expand the <em>rightmost</em> non-terminal first (used
                  by Bottom-Up parsers).
                </p>
                <div className="font-mono text-sm space-y-2">
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium">
                      E
                    </span>
                    <span className="text-muted-foreground/30">⇒</span>E +{" "}
                    <span className="text-primary font-bold">T</span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>E + T *{" "}
                    <span className="text-primary font-bold">F</span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>E +{" "}
                    <span className="text-primary font-bold">T</span> *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>E +{" "}
                    <span className="text-primary font-bold">F</span> *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">E</span> +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">T</span> +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-primary font-bold">F</span> +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                  <div className="flex gap-4 items-center group">
                    <span className="w-8 text-right text-muted-foreground font-medium"></span>
                    <span className="text-muted-foreground/30">⇒</span>
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    +{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>{" "}
                    *{" "}
                    <span className="text-green-600 dark:text-green-400">
                      id
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium">
                Notice how both yield the same final string, but construct the
                tree in different orders!
              </span>
              <Link
                href={`/solve?g=${btoa("E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id")}&t=${btoa("id + id * id")}`}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full gap-2">
                  <Play className="h-4 w-4" /> Watch the Tree Build Live
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8 overflow-hidden border-primary/20 shadow-md">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-foreground">
              <Play className="h-5 w-5 text-primary" />
              Interactive Demo
            </h3>
            <p className="text-muted-foreground mb-6">
              Ready to see a context-free grammar in action? Click below to open
              the Arithmetic Expression grammar directly in the Syntax Engine.
              We'll automatically generate the First/Follow sets and Parsing
              Tables for you.
            </p>
            <Link
              href={`/solve?g=${btoa("E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id")}&t=${btoa("id + id * id")}`}
            >
              <Button
                size="lg"
                className="gap-2 shadow-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Play className="h-4 w-4 fill-current" /> Try It Out in Solver
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
