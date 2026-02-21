import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheatsheetsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Parsing Cheatsheets</h1>
        <p className="text-muted-foreground">
          Quick reference tables for compiler design algorithms and rules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>FIRST Set Rules</CardTitle>
            <CardDescription>
              Rules for computing FIRST(X) for any grammar symbol X.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Condition</TableHead>
                  <TableHead>Rule to Apply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">X is a terminal</TableCell>
                  <TableCell>
                    <code>FIRST(X)</code> is exactly <code>{"{X}"}</code>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Production <code>X &rarr; ε</code> exists
                  </TableCell>
                  <TableCell>
                    Add <code>ε</code> to <code>FIRST(X)</code>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Production <code>X &rarr; Y1 Y2 ... Yk</code>
                  </TableCell>
                  <TableCell>
                    Add all non-<code>ε</code> symbols from{" "}
                    <code>FIRST(Y1)</code> to <code>FIRST(X)</code>.<br />
                    If <code>ε</code> is in <code>FIRST(Y1)</code>, also add
                    non-<code>ε</code> symbols from <code>FIRST(Y2)</code>, and
                    so on.
                    <br />
                    If all <code>Y1...Yk</code> contain <code>ε</code> in their
                    FIRST sets, add <code>ε</code> to <code>FIRST(X)</code>.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FOLLOW Set Rules</CardTitle>
            <CardDescription>
              Rules for computing FOLLOW(A) for any non-terminal A.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Condition</TableHead>
                  <TableHead>Rule to Apply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    A is the start symbol
                  </TableCell>
                  <TableCell>
                    Add the end-of-input marker <code>$</code> to{" "}
                    <code>FOLLOW(A)</code>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Production <code>X &rarr; &alpha; A &beta;</code>
                  </TableCell>
                  <TableCell>
                    Add all symbols in <code>FIRST(&beta;)</code>, excluding{" "}
                    <code>ε</code>, to <code>FOLLOW(A)</code>.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Production <code>X &rarr; &alpha; A</code> <br />{" "}
                    <span className="text-muted-foreground text-xs">
                      or X &rarr; &alpha; A &beta; where ε &isin; FIRST(&beta;)
                    </span>
                  </TableCell>
                  <TableCell>
                    Add everything in <code>FOLLOW(X)</code> to{" "}
                    <code>FOLLOW(A)</code>.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LR Parser Comparison</CardTitle>
            <CardDescription>
              Structural differences between the bottom-up parsers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parser Type</TableHead>
                  <TableHead>Item Collection</TableHead>
                  <TableHead>Reduction Rule Generation</TableHead>
                  <TableHead>Table Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">LR(0)</TableCell>
                  <TableCell>Standard Closure</TableCell>
                  <TableCell>
                    Places Reduce in <strong>entire row</strong> of states with
                    item <code>[A &rarr; &alpha;&bull;]</code>
                  </TableCell>
                  <TableCell className="text-green-500">Smallest</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SLR(1)</TableCell>
                  <TableCell>Standard Closure</TableCell>
                  <TableCell>
                    Places Reduce only in columns corresponding to{" "}
                    <code>FOLLOW(A)</code>
                  </TableCell>
                  <TableCell className="text-green-500">Small</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">LALR(1)</TableCell>
                  <TableCell>Merged LR(1) Sets</TableCell>
                  <TableCell>
                    Places Reduce exactly in lookahead columns computed
                    recursively
                  </TableCell>
                  <TableCell className="text-yellow-500">Medium</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CLR(1)</TableCell>
                  <TableCell>LR(1) Closure with exact 1-lookaheads</TableCell>
                  <TableCell>
                    Places Reduce exactly in lookahead columns bound to the
                    specific state
                  </TableCell>
                  <TableCell className="text-red-500">Massive</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
