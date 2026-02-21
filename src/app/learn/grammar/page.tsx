import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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
      </div>
    </div>
  );
}
