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
import { Production, LRTable } from "@/engine/types";

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
      const { action, goto } = data as LRTable;
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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="h-8 text-[11px] font-semibold tracking-widest uppercase"
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
        <div className="border rounded-xl shadow-sm bg-background overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] font-bold text-[11px] uppercase tracking-wider bg-muted/40">
                  Non-Terminal
                </TableHead>
                {cols.map((t) => (
                  <TableHead
                    key={t}
                    className="font-bold text-[11px] text-center uppercase tracking-wider text-green-700 dark:text-green-500 bg-green-500/5"
                  >
                    {t}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {nonTerminals.map((nt) => (
                <TableRow
                  key={nt}
                  className="transition-colors hover:bg-muted/5"
                >
                  <TableCell className="font-bold bg-muted/20 text-center">
                    {nt}
                  </TableCell>
                  {cols.map((t) => {
                    const prods = table[nt]?.[t];
                    const hasConflict = prods && prods.length > 1;
                    return (
                      <TableCell
                        key={t}
                        className={`text-center align-middle border-l ${hasConflict ? "bg-destructive/10" : ""}`}
                      >
                        {prods ? (
                          prods.map((p, idx) => (
                            <div
                              key={idx}
                              className={`whitespace-nowrap font-mono text-[13px] ${hasConflict ? "text-destructive font-bold" : "text-muted-foreground"}`}
                            >
                              {p.lhs} &rarr; {p.rhs.join(" ") || "ε"}
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground/30 font-mono text-xs">
                            -
                          </span>
                        )}
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
    const { action, goto } = data as LRTable;
    const states = Object.keys(action)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="h-8 text-[11px] font-semibold tracking-widest uppercase"
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
        <div className="border rounded-xl shadow-sm bg-background overflow-hidden relative">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead
                  rowSpan={2}
                  className="w-[80px] font-bold text-[11px] uppercase tracking-wider align-middle"
                >
                  State
                </TableHead>
                <TableHead
                  colSpan={terminals.length + 1}
                  className="text-center border-l font-bold text-[11px] uppercase tracking-wider pt-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    Action
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal shadow-md border-muted">
                        <p className="text-xs">
                          Shift (s), Reduce (r), or Accept (acc) operations
                          mapped across terminal lookahead tokens.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead
                  colSpan={nonTerminals.length}
                  className="text-center border-l bg-muted/20 font-bold text-[11px] uppercase tracking-wider pt-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    Goto
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal shadow-md border-muted">
                        <p className="text-xs">
                          The state to transition to after a successful Reduce
                          reduction evaluates a Non-Terminal.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent bg-muted/10">
                {/* Action Cols */}
                {[...terminals, "$"].map((t) => (
                  <TableHead
                    key={`act-${t}`}
                    className="text-[11px] font-bold text-center border-l h-8 text-green-700 dark:text-green-500 bg-green-500/[0.03]"
                  >
                    {t}
                  </TableHead>
                ))}
                {/* Goto Cols */}
                {nonTerminals.map((nt) => (
                  <TableHead
                    key={`goto-${nt}`}
                    className="text-[11px] font-bold text-center border-l h-8 text-blue-700 dark:text-blue-500 bg-blue-500/[0.03]"
                  >
                    {nt}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {states.map((stateId) => (
                <TableRow
                  key={stateId}
                  className="transition-colors hover:bg-muted/5"
                >
                  <TableCell className="font-bold bg-muted/20 text-center">
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
                        className={`border-l text-center align-middle ${hasConflict ? "bg-destructive/10" : ""}`}
                      >
                        {actionsList.length > 0 ? (
                          actionsList.map((act, idx) => {
                            let cellClass = "font-mono text-[13px] ";
                            if (act?.startsWith("s"))
                              cellClass +=
                                "text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-md inline-block mx-0.5";
                            else if (act?.startsWith("r"))
                              cellClass +=
                                "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md inline-block mx-0.5";
                            else if (act === "acc")
                              cellClass +=
                                "text-purple-700 dark:text-purple-400 font-black bg-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest inline-block";

                            if (hasConflict) {
                              cellClass =
                                "font-mono text-[13px] font-bold text-destructive bg-destructive/20 px-1.5 py-0.5 rounded-md inline-block mx-0.5";
                            }

                            return (
                              <div key={idx} className={cellClass}>
                                {act}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-muted-foreground/30 font-mono text-xs">
                            -
                          </span>
                        )}
                      </TableCell>
                    );
                  })}

                  {/* Goto Cells */}
                  {nonTerminals.map((nt) => {
                    const val = goto[stateId]?.[nt];
                    return (
                      <TableCell
                        key={`goto-${nt}`}
                        className="border-l text-center align-middle font-mono text-[13px] text-muted-foreground font-medium"
                      >
                        {val !== undefined ? (
                          val
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">
                            -
                          </span>
                        )}
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
