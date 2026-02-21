import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Production, SLRTable } from "@/engine/types";

interface ParsingTableProps {
  type: "LL1" | "SLR1";
  data: unknown; // LL1 or SLR1 table structure
  grammar?: {
    terminals: Set<string>;
    nonTerminals: Set<string>;
  };
}

export function ParsingTableVisualizer({
  type,
  data,
  grammar,
}: ParsingTableProps) {
  if (!data || !grammar) return null;

  const terminals = Array.from(grammar.terminals).sort();
  const nonTerminals = Array.from(grammar.nonTerminals).sort();

  // For SLR, we also have the '$' terminal usually
  const cols =
    type === "LL1" ? [...terminals, "$"] : [...terminals, "$", ...nonTerminals];

  if (type === "LL1") {
    const table = data as { [nt: string]: { [t: string]: Production[] } };
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Non-Terminal</TableHead>
              {cols.map((t) => (
                <TableHead key={t}>{t}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {nonTerminals.map((nt) => (
              <TableRow key={nt}>
                <TableCell className="font-medium bg-muted/50">{nt}</TableCell>
                {cols.map((t) => {
                  const prods = table[nt]?.[t];
                  const hasConflict = prods && prods.length > 1;
                  return (
                    <TableCell
                      key={t}
                      className={hasConflict ? "bg-red-500/20" : ""}
                    >
                      {prods
                        ? prods.map((p, idx) => (
                            <div
                              key={idx}
                              className={`whitespace-nowrap text-xs ${hasConflict ? "text-red-700 dark:text-red-400 font-bold" : ""}`}
                            >
                              {p.lhs} &rarr; {p.rhs.join(" ") || "ε"}
                            </div>
                          ))
                        : ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    // SLR1
    const { action, goto } = data as SLRTable;
    const states = Object.keys(action)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="w-[80px]">
                State
              </TableHead>
              <TableHead
                colSpan={terminals.length + 1}
                className="text-center border-l"
              >
                <div className="flex items-center justify-center gap-2">
                  Action
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs font-normal">
                      <p>
                        Shift (s), Reduce (r), or Accept (acc) operations mapped
                        across terminal lookahead tokens.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead
                colSpan={nonTerminals.length}
                className="text-center border-l bg-muted/20"
              >
                <div className="flex items-center justify-center gap-2">
                  Goto
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs font-normal">
                      <p>
                        The state to transition to after a successful Reduce
                        reduction evaluates a Non-Terminal.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
            </TableRow>
            <TableRow>
              {/* Action Cols */}
              {[...terminals, "$"].map((t) => (
                <TableHead key={`act-${t}`} className="text-xs border-l">
                  {t}
                </TableHead>
              ))}
              {/* Goto Cols */}
              {nonTerminals.map((nt) => (
                <TableHead key={`goto-${nt}`} className="text-xs border-l">
                  {nt}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {states.map((stateId) => (
              <TableRow key={stateId}>
                <TableCell className="font-medium bg-muted/50">
                  {stateId}
                </TableCell>

                {/* Action Cells */}
                {[...terminals, "$"].map((t) => {
                  const val = action[stateId]?.[t];
                  const actionsList = val ? val.split("\n") : [];
                  const hasConflict = actionsList.length > 1;

                  return (
                    <TableCell
                      key={`act-${t}`}
                      className={`border-l text-xs ${hasConflict ? "bg-red-500/20" : ""}`}
                    >
                      {actionsList.map((act, idx) => {
                        let cellClass = "";
                        if (act?.startsWith("s"))
                          cellClass =
                            "text-blue-600 dark:text-blue-400 font-mono";
                        else if (act?.startsWith("r"))
                          cellClass =
                            "text-green-600 dark:text-green-400 font-mono";
                        else if (act === "acc")
                          cellClass =
                            "text-purple-600 font-bold bg-purple-100 dark:bg-purple-900/20";

                        if (hasConflict) {
                          cellClass += " font-bold";
                        }

                        return (
                          <div key={idx} className={cellClass}>
                            {act}
                          </div>
                        );
                      })}
                    </TableCell>
                  );
                })}

                {/* Goto Cells */}
                {nonTerminals.map((nt) => {
                  const val = goto[stateId]?.[nt];
                  return (
                    <TableCell
                      key={`goto-${nt}`}
                      className="border-l text-xs font-mono text-muted-foreground"
                    >
                      {val !== undefined ? val : ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
