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

export default function LRPage() {
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
        <h1 className="text-4xl font-bold mb-4 tracking-tight">LR Parsing</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A highly expressive bottom-up parsing algorithm reading input from{" "}
          <strong>L</strong>eft to right, computing a <strong>R</strong>ightmost
          derivation in reverse.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Bottom-Up LR Parsing?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Unlike LL predictive parsing, LR parsers evaluate input tokens by{" "}
              <em>shifting</em> them onto a stack and <em>reducing</em> them
              retroactively once a full grammar rule mapping is unambiguously
              collected. While generating their parsing tables requires heavy
              computation (calculating mathematical closure items mapped onto a
              Finite State Machine Automatons), bottom-up architecture grants
              several massive advantages over LL(1):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                LR parsers natively handle <strong>left-recursive</strong>{" "}
                grammars (<code>E &rarr; E + T</code>) gracefully without
                crashing.
              </li>
              <li>
                LR supports a much larger, encompassing class of context-free
                languages compared to LL.
              </li>
              <li>
                Fewer language rules require painful mathematical &quot;Left
                Factoring&quot; just to appease the parser limitations.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Parser Tiers and Architectures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              Our engine natively computes four escalating tiers of bottom-up
              parsers. They utilize the same underlying stack-push shifting
              execution workflow but differ wildly in how they generate their
              state maps (item closures) and when they mathematically authorize
              a &quot;Reduce&quot; command.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border rounded-md p-4">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  LR(0)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal">
                        <p>
                          The &quot;0&quot; means zero lookahead tokens are used
                          to determine if a reduction is valid.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm">
                  The purest baseline. LR(0) completely ignores lookaheads,
                  executing rule reductions blindly if it reaches the end of an
                  item path. Exceedingly weak and highly vulnerable to{" "}
                  <strong>Shift/Reduce conflicts</strong>.
                </p>
              </div>

              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  SLR(1)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal">
                        <p>
                          The &quot;1&quot; signifies 1 token of lookahead, used
                          *only* during Reduce operations by checking FOLLOW
                          sets.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm">
                  Simple LR. Computes the LR(0) state machine but vastly
                  improves reduction conditions by restricting a reduction of{" "}
                  <code>A &rarr; &alpha;</code> to *only* occur if the upcoming
                  input token mathematically resides in <code>FOLLOW(A)</code>.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  CLR(1)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal">
                        <p>
                          Extremely strict. Computes new unique states simply if
                          the lookahead differs, guaranteeing zero false
                          conflicts.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm">
                  Canonical LR. Calculates item closure mappings using a
                  hyper-specific, exhaustive 1-lookahead token context{" "}
                  <code>[A &rarr; &alpha; &bull; &beta;, a]</code>. Massively
                  resilient to grammar ambiguity but creates an explosive,
                  exponentially massive State Machine graph.
                </p>
              </div>

              <div className="border rounded-md p-4 bg-primary/10 border-primary/20">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-primary">
                  LALR(1)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-primary cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs font-normal text-foreground">
                        <p>
                          Fuses exact CLR States that share the same core rules
                          but different lookaheads. Space efficient and highly
                          capable.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm">
                  Look-Ahead LR. The gold standard deployed securely inside
                  actual production compilers like YACC and Bison.
                  Mathematically compresses identical states inside the CLR
                  Automaton graph to save tremendous memory overhead while
                  preserving exact lookaheads.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
