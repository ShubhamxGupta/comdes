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

export default function ShiftReducePage() {
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
          Shift-Reduce Parsing
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A class of bottom-up parsing algorithms that constructs the parse tree
          by "shifting" input tokens onto a stack and "reducing" them based on
          production rules.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Core Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Shift-Reduce parsing is a form of bottom-up parsing. Instead of
              starting with the initial symbol and deriving the target string
              (like LL top-down parsing), a shift-reduce parser begins with the
              input string and attempts to progressively condense it backward to
              the Start Symbol.
            </p>
            <p>
              The parser operates using a <strong>Stack</strong> to hold grammar
              symbols in progress and an <strong>Input Buffer</strong> for the
              unread tokens.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Four Parser Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-muted-foreground">
                At any point during the parsing sequence, the parser decides
                between four possible operations:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <div className="font-semibold text-primary text-lg">
                    Shift
                  </div>
                  <p>
                    Moves the next unread token from the input buffer to the top
                    of the stack. This is effectively saying, "I haven't found a
                    complete production match yet, let me see more tokens."
                  </p>
                </li>
                <li>
                  <div className="font-semibold text-primary text-lg flex items-center gap-2">
                    Reduce
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm font-normal">
                          <p>
                            A reduction applies a production rule in reverse
                            (Right-Hand Side to Left-Hand Side).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p>
                    When the sequence of symbols securely situated at the top of
                    the stack matches the Right Hand Side (RHS) of a grammar
                    rule, the parser removes them and substitutes the
                    corresponding Left Hand Side (LHS) non-terminal.
                  </p>
                </li>
                <li>
                  <div className="font-semibold text-emerald-500 text-lg flex items-center gap-2">
                    Accept
                  </div>
                  <p>
                    If the stack contains only the start symbol and the input
                    sequence is completely exhausted (reaching the{" "}
                    <code>$</code> end-marker), the sentence is syntactically
                    correct and accepted.
                  </p>
                </li>
                <li>
                  <div className="font-semibold text-destructive text-lg flex items-center gap-2">
                    Error
                  </div>
                  <p>
                    If neither a valid Shift nor a valid Reduce applies, the
                    parser discovers a syntax error.
                  </p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold border-b pb-1 mb-3">
                Action Trace Example
              </h3>
              <p className="mb-3">
                Using a simplified grammar for arithmetic expressions:{" "}
                <code>E &rarr; E + E | id</code>.
              </p>
              <div className="overflow-x-auto border rounded-md shadow-sm">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold border-b w-1/3 text-right">
                        Stack
                      </th>
                      <th className="px-4 py-3 font-semibold border-b border-l w-1/3 text-left">
                        Input
                      </th>
                      <th className="px-4 py-3 font-semibold border-b border-l w-1/3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono divide-y divide-border/50">
                    <tr className="bg-background hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$</td>
                      <td className="px-4 py-3 border-l">id + id $</td>
                      <td className="px-4 py-3 border-l font-bold text-blue-500">
                        Shift
                      </td>
                    </tr>
                    <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$ id</td>
                      <td className="px-4 py-3 border-l">+ id $</td>
                      <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                        Reduce{" "}
                        <span className="text-muted-foreground font-normal ml-1 text-xs">
                          (E &rarr; id)
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-background hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$ E</td>
                      <td className="px-4 py-3 border-l">+ id $</td>
                      <td className="px-4 py-3 border-l font-bold text-blue-500">
                        Shift
                      </td>
                    </tr>
                    <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$ E +</td>
                      <td className="px-4 py-3 border-l">id $</td>
                      <td className="px-4 py-3 border-l font-bold text-blue-500">
                        Shift
                      </td>
                    </tr>
                    <tr className="bg-background hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$ E + id</td>
                      <td className="px-4 py-3 border-l">$</td>
                      <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                        Reduce{" "}
                        <span className="text-muted-foreground font-normal ml-1 text-xs">
                          (E &rarr; id)
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-right">$ E + E</td>
                      <td className="px-4 py-3 border-l">$</td>
                      <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                        Reduce{" "}
                        <span className="text-muted-foreground font-normal ml-1 text-xs">
                          (E &rarr; E + E)
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-green-500/5 dark:bg-green-500/10">
                      <td className="px-4 py-3 text-right">$ E</td>
                      <td className="px-4 py-3 border-l">$</td>
                      <td className="px-4 py-3 border-l font-bold text-emerald-500">
                        Accept
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  Watch the LR parser state machine execute this exact trace
                  automatically!
                </span>
                <Link
                  href={`/solve?g=${btoa("E -> E + E | id")}&t=${btoa("id + id")}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Play className="h-4 w-4" /> Run this Trace Live
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-500">
              Shift-Reduce Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="space-y-2">
              The inherent challenge in shift-reduce parsing occurs when
              multiple actions are possible, known as conflicts:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Shift/Reduce Conflict:</strong> The parser doesn't know
                whether to shift a new token or reduce the current top-of-stack.
                This often happens in rules with varying associativity (like
                "if-else" dangling modifiers).
              </li>
              <li>
                <strong>Reduce/Reduce Conflict:</strong> The parser encounters a
                situation where the stack's top sequence matches two distinct
                rule RHSs, so it doesn't know which LHS to reduce to.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Algorithms like LR(0), SLR(1), CLR(1), and LALR(1) are
              sophisticated methods constructed implicitly to handle or avoid
              these conflicts using lookahead state machines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
