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
import { Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Production, SLRTable } from "@/engine/types";

interface ParsingTableProps {
  title: string;
  type: "LL1" | "SLR1";
  data: unknown; // LL1 or SLR1 table structure
  grammar?: {
    terminals: Set<string>;
    nonTerminals: Set<string>;
  };
}

export function ParsingTableVisualizer({
  title,
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
  const downloadCSV = () => {
    let csvContent = "";

    if (type === "LL1") {
      const table = data as { [nt: string]: { [t: string]: Production[] } };
      csvContent += ["Non-Terminal", ...cols].join(",") + "\n";
      nonTerminals.forEach((nt) => {
        const row = [nt];
        cols.forEach((t) => {
          const prods = table[nt]?.[t];
          if (prods) {
            row.push(
              `"${prods.map((p) => `${p.lhs}->${p.rhs.join(" ") || "ε"}`).join(" | ")}"`,
            );
          } else {
            row.push("");
          }
        });
        csvContent += row.join(",") + "\n";
      });
    } else {
      const { action, goto } = data as SLRTable;
      const states = Object.keys(action)
        .map(Number)
        .sort((a, b) => a - b);
      csvContent +=
        ["State", ...terminals, "$", ...nonTerminals].join(",") + "\n";

      states.forEach((stateId) => {
        const row = [stateId.toString()];
        [...terminals, "$"].forEach((t) => {
          const val = action[stateId]?.[t];
          row.push(val ? `"${val.replace(/\n/g, " ")}"` : "");
        });
        nonTerminals.forEach((nt) => {
          const val = goto[stateId]?.[nt];
          row.push(val !== undefined ? val.toString() : "");
        });
        csvContent += row.join(",") + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_parsing_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (type === "LL1") {
    const table = data as { [nt: string]: { [t: string]: Production[] } };
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="border rounded-md shadow-sm bg-background">
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
                  <TableCell className="font-medium bg-muted/50">
                    {nt}
                  </TableCell>
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
      </div>
    );
  } else {
    // SLR1
    const { action, goto } = data as SLRTable;
    const states = Object.keys(action)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
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
                          Shift (s), Reduce (r), or Accept (acc) operations
                          mapped across terminal lookahead tokens.
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
      </div>
    );
  }
}
