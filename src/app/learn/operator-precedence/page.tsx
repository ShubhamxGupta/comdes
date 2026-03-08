import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function OperatorPrecedencePage() {
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
          Operator Precedence Parser
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A bottom-up parser that specifically evaluates mathematical
          expressions and operator grammars using relational precedence tables
          instead of automata.
        </p>

        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-500">
              Operator Grammars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Before constructing an Operator Precedence parser, the grammar
              must strictly be an <strong>Operator Grammar</strong>. It must
              follow two primary constraints:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                No empty transitions (
                <strong>
                  no <code>&epsilon;</code> productions
                </strong>
                ). The RHS of any rule cannot derive the empty string.
              </li>
              <li>
                <strong>No adjacent non-terminals.</strong> You cannot have
                rules like <code>A &rarr; B C</code>. Terminals must always
                visually separate non-terminals if they are back-to-back.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Precedence Relations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-muted-foreground">
                Unlike LR parsers that use state numbers or shifts and reduces,
                Operator Precedence uses relational symbols. Between any two
                terminals <i>a</i> and <i>b</i>, one of three relations holds:
              </p>
              <ul className="list-disc pl-6 space-y-4 font-mono text-sm max-w-xl">
                <li className="flex items-center justify-between border-b pb-2">
                  <span>
                    a <code>&lt;&middot;</code> b
                  </span>
                  <span className="font-sans text-muted-foreground">
                    a yields precedence to b
                  </span>
                </li>
                <li className="flex items-center justify-between border-b pb-2">
                  <span>
                    a <code>&middot;&gt;</code> b
                  </span>
                  <span className="font-sans text-muted-foreground">
                    a takes precedence over b
                  </span>
                </li>
                <li className="flex items-center justify-between pb-1">
                  <span>
                    a <code>=&middot;</code> b
                  </span>
                  <span className="font-sans text-muted-foreground">
                    a has the same precedence as b
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                <em>Note:</em> The relation <code>&middot;&gt;</code>{" "}
                essentially signals the parser to perform a "Reduce" operation.
                The parser evaluates the string from left to right, inserting{" "}
                <code>&lt;&middot;</code>, <code>=&middot;</code>, and{" "}
                <code>&middot;&gt;</code> until it isolates the target segment
                surrounded by <code>&lt;&middot;</code> and{" "}
                <code>&middot;&gt;</code>.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold border-b pb-1 mb-3">
                Precedence Table Example
              </h3>
              <p className="mb-3">
                Standard precedence for arithmetic: <code>*</code> has higher
                precedence than <code>+</code>. <code>id</code> has the highest
                precedence.
              </p>
              <div className="overflow-x-auto border rounded-md max-w-md">
                <table className="min-w-full text-center text-sm font-mono">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 border-b"></th>
                      <th className="px-4 py-3 border-b border-l">id</th>
                      <th className="px-4 py-3 border-b border-l">+</th>
                      <th className="px-4 py-3 border-b border-l">*</th>
                      <th className="px-4 py-3 border-b border-l">$</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-background">
                      <td className="px-4 py-3 font-semibold border-r bg-muted">
                        id
                      </td>
                      <td className="px-4 py-3 border-r text-muted-foreground">
                        -
                      </td>
                      <td className="px-4 py-3 border-r text-red-500">
                        &middot;&gt;
                      </td>
                      <td className="px-4 py-3 border-r text-red-500">
                        &middot;&gt;
                      </td>
                      <td className="px-4 py-3 text-red-500">&middot;&gt;</td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="px-4 py-3 font-semibold border-r bg-muted">
                        +
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 border-r text-red-500">
                        &middot;&gt;
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 text-red-500">&middot;&gt;</td>
                    </tr>
                    <tr className="border-b bg-background">
                      <td className="px-4 py-3 font-semibold border-r bg-muted">
                        *
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 border-r text-red-500">
                        &middot;&gt;
                      </td>
                      <td className="px-4 py-3 border-r text-red-500">
                        &middot;&gt;
                      </td>
                      <td className="px-4 py-3 text-red-500">&middot;&gt;</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3 font-semibold border-r bg-muted">
                        $
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 border-r text-blue-500">
                        &lt;&middot;
                      </td>
                      <td className="px-4 py-3 font-sans font-bold text-emerald-500">
                        Accept
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-10 border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                2
              </span>
              Step-by-Step Example: Relational Parsing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <p className="text-muted-foreground">
              Let's evaluate the string <code>id + id * id</code> using the
              relational table above. We pad the string with <code>$</code> on
              both ends. The parser's sole rule is:{" "}
              <strong className="text-blue-500">
                Shift on &lt;&middot; or =&middot;
              </strong>
              , and{" "}
              <strong className="text-red-500">Reduce on &middot;&gt;</strong>.
            </p>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b w-1/3 text-right">
                      Stack
                    </th>
                    <th className="px-4 py-3 font-semibold border-b border-l w-12 text-center">
                      Relation
                    </th>
                    <th className="px-4 py-3 font-semibold border-b border-l w-1/3 text-left">
                      Input
                    </th>
                    <th className="px-4 py-3 font-semibold border-b border-l w-1/4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono divide-y divide-border/50">
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-blue-500">
                      &lt;&middot;
                    </td>
                    <td className="px-4 py-3 border-l">id + id * id $</td>
                    <td className="px-4 py-3 border-l text-blue-500 font-bold">
                      Shift
                    </td>
                  </tr>
                  <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ id</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-red-500">
                      &middot;&gt;
                    </td>
                    <td className="px-4 py-3 border-l">+ id * id $</td>
                    <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                      Reduce{" "}
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        (pop id)
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-blue-500">
                      &lt;&middot;
                    </td>
                    <td className="px-4 py-3 border-l">+ id * id $</td>
                    <td className="px-4 py-3 border-l text-blue-500 font-bold">
                      Shift
                    </td>
                  </tr>
                  <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E +</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-blue-500">
                      &lt;&middot;
                    </td>
                    <td className="px-4 py-3 border-l">id * id $</td>
                    <td className="px-4 py-3 border-l text-blue-500 font-bold">
                      Shift
                    </td>
                  </tr>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + id</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-red-500">
                      &middot;&gt;
                    </td>
                    <td className="px-4 py-3 border-l">* id $</td>
                    <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                      Reduce{" "}
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        (pop id)
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + E</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-blue-500">
                      &lt;&middot;
                    </td>
                    <td className="px-4 py-3 border-l">* id $</td>
                    <td className="px-4 py-3 border-l text-blue-500 font-bold">
                      Shift
                    </td>
                  </tr>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + E *</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-blue-500">
                      &lt;&middot;
                    </td>
                    <td className="px-4 py-3 border-l">id $</td>
                    <td className="px-4 py-3 border-l text-blue-500 font-bold">
                      Shift
                    </td>
                  </tr>
                  <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + E * id</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-red-500">
                      &middot;&gt;
                    </td>
                    <td className="px-4 py-3 border-l">$</td>
                    <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                      Reduce{" "}
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        (pop id)
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + E * E</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-red-500">
                      &middot;&gt;
                    </td>
                    <td className="px-4 py-3 border-l">$</td>
                    <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                      Reduce{" "}
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        (pop E * E)
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-right">$ E + E</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-red-500">
                      &middot;&gt;
                    </td>
                    <td className="px-4 py-3 border-l">$</td>
                    <td className="px-4 py-3 border-l text-purple-600 dark:text-purple-400 font-bold">
                      Reduce{" "}
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        (pop E + E)
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-green-500/5 dark:bg-green-500/10">
                    <td className="px-4 py-3 text-right">$ E</td>
                    <td className="px-4 py-3 border-l text-center font-bold text-emerald-500"></td>
                    <td className="px-4 py-3 border-l">$</td>
                    <td className="px-4 py-3 border-l font-bold text-emerald-500">
                      Accept
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-muted-foreground italic text-sm">
              Notice how the multiplication <code>*</code> is shifted onto the
              stack instead of reducing the addition <code>+</code>. This is
              because the relational table says <code>+ &lt;&middot; *</code>,
              forcing the parser to delay the addition until the multiplication
              completes!
            </p>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium">
                To avoid building relational tables, modern compilers use
                unambiguous grammars parsed by LR algorithms. Try it!
              </span>
              <Link
                href={`/solve?g=${btoa("E -> E + T | T\nT -> T * F | F\nF -> id")}&t=${btoa("id + id * id")}`}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full gap-2">
                  <Play className="h-4 w-4" /> Trace the Modern Equivalent
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
